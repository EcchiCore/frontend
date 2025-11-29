"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Star } from "lucide-react"
import { Article } from "@/types/article";
import myImageLoader from "@/lib/imageLoader"

interface ArticleTitleMetaProps {
  article: Article
  isDarkMode: boolean
}

const MemoizedModalImage: React.FC<{ src: string; alt: string; fill: boolean; sizes: string; className: string; loader: any }> = React.memo(({ src, alt, fill, sizes, className, loader }) => (
  <Image
    src={src}
    alt={alt}
    fill={fill}
    sizes={sizes}
    className={className}
    loader={loader}
  />
));

MemoizedModalImage.displayName = 'MemoizedModalImage';

const ArticleTitleMeta: React.FC<ArticleTitleMetaProps> = ({ article, isDarkMode }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [_imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [lastTap, setLastTap] = useState(0)
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Memoized values
  const hasImages = useMemo(() => article.images && article.images.length > 0, [article.images])
  const imageCount = useMemo(() => article.images?.length || 0, [article.images])
  const subtitleClass = `text-sm sm:text-base font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`
  const subtitleValueClass = `${isDarkMode ? "text-white" : "text-gray-900"} font-semibold`

  // Combined style classes
  const styles = useMemo(() => ({
    title: `text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`,
    badge: `inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${isDarkMode
        ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border border-violet-500/30 hover:border-violet-400/50 shadow-lg shadow-violet-500/10"
        : "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200 hover:border-violet-300 shadow-lg shadow-violet-500/10"
      }`,
    mainImage: `relative rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl ${isDarkMode
        ? "bg-gray-800/50 shadow-xl shadow-black/20 hover:shadow-black/40"
        : "bg-gray-50 shadow-xl shadow-gray-500/20 hover:shadow-gray-500/30"
      }`,
    controlButton: `p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${isDarkMode
        ? "bg-black/60 text-white border border-white/20 hover:bg-black/80"
        : "bg-white/80 text-gray-900 border border-black/10 hover:bg-white/90"
      }`,
    thumbnail: (isSelected: boolean) => `relative aspect-square rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${isSelected
        ? "ring-3 ring-violet-500 ring-offset-2 scale-105 shadow-lg shadow-violet-500/25"
        : "hover:shadow-lg opacity-70 hover:opacity-100"
      } ${isDarkMode ? "bg-gray-800 ring-offset-gray-900" : "bg-gray-100 ring-offset-white"}`
  }), [isDarkMode])

  const handleImageError = (index: number) => setImageErrors(prev => new Set(prev).add(index))

  const getImageSrc = useCallback((image: { url: string } | null | undefined) => {
    const src = image?.url;
    if (typeof src !== 'string' || !src) return null;
    return src;
  }, [])

  const preloadImage = useCallback((src: string, index: number) => {
    if (preloadedImages.has(index)) return

    const img = new window.Image()
    img.onload = () => {
      setPreloadedImages(prev => new Set(prev).add(index))
      if (index === selectedImageIndex) setIsLoading(false)
    }
    img.onerror = () => {
      handleImageError(index)
      if (index === selectedImageIndex) setIsLoading(false)
    }
    const imageSrc = getImageSrc(article.images[index]);
    if (!imageSrc) return;
    img.src = imageSrc;
  }, [preloadedImages, selectedImageIndex, getImageSrc, article.images])

  // Optimized preloading logic
  useEffect(() => {
    if (!hasImages) return

    const currentIndex = isModalOpen ? modalImageIndex : selectedImageIndex
    const totalImages = imageCount

    preloadImage(article.images[currentIndex].url, currentIndex)

    const getPreloadCount = () => {
      if (typeof window === "undefined") return 3
      const isLargeScreen = window.innerWidth >= 1024
      const isSlowConnection = ("connection" in navigator &&
        [(navigator as any).connection?.effectiveType].includes("slow-2g") ||
        (navigator as any).connection?.effectiveType === "2g")

      if (isSlowConnection) return 2
      if (totalImages <= 5) return totalImages
      return isLargeScreen && totalImages <= 10 ? 5 : 3
    }

    const preloadCount = getPreloadCount()
    const indicesToPreload: number[] = []

    for (let i = 1; i <= Math.floor(preloadCount / 2); i++) {
      indicesToPreload.push(
        (currentIndex - i + totalImages) % totalImages,
        (currentIndex + i) % totalImages
      )
    }

    if (preloadCount % 2 === 1 && preloadCount > 1) {
      indicesToPreload.push((currentIndex + Math.ceil(preloadCount / 2)) % totalImages)
    }

    indicesToPreload.forEach((index, i) => {
      setTimeout(() => preloadImage(article.images[index].url, index), i * 50)
    })
  }, [selectedImageIndex, modalImageIndex, isModalOpen, hasImages, imageCount, preloadImage, article.images])

  // Modal controls
  const openModal = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
  }

  const nextImage = useCallback(() => {
    if (!hasImages) return
    const newIndex = modalImageIndex < imageCount - 1 ? modalImageIndex + 1 : 0
    setModalImageIndex(newIndex)
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
  }, [hasImages, imageCount, modalImageIndex])

  const prevImage = useCallback(() => {
    if (!hasImages) return
    const newIndex = modalImageIndex > 0 ? modalImageIndex - 1 : imageCount - 1
    setModalImageIndex(newIndex)
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
  }, [hasImages, imageCount, modalImageIndex])

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))
  const resetZoom = () => {
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
  }

  const downloadImage = async () => {
    if (!hasImages) return
    const imageUrl = getImageSrc(article.images[modalImageIndex])
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${article.title}-image-${modalImageIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleDoubleClick = () => setZoomLevel(zoomLevel === 1 ? 2 : 1)

  const handleTouchEnd = () => {
    const now = Date.now()
    if (now - lastTap < 300) handleDoubleClick()
    setLastTap(now)
  }

  const handleThumbnailSelect = (index: number) => {
    setSelectedImageIndex(index)
    setIsLoading(true)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (selectedImageIndex < imageCount - 1 ? selectedImageIndex + 1 : 0)
      : (selectedImageIndex > 0 ? selectedImageIndex - 1 : imageCount - 1)
    handleThumbnailSelect(newIndex)
  }

  // Keyboard controls
  useEffect(() => {
    if (!isModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyActions: Record<string, () => void> = {
        'Escape': closeModal,
        'ArrowLeft': prevImage,
        'ArrowRight': nextImage,
        '+': handleZoomIn,
        '=': handleZoomIn,
        '-': handleZoomOut,
        '0': resetZoom
      }
      keyActions[e.key]?.()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isModalOpen, nextImage, prevImage])

  // No images fallback
  if (!hasImages) {
    return (
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex-1 space-y-2">
            <h1 className={`${styles.title} text-2xl sm:text-3xl`}>{article.title}</h1>
            {article.creators && article.creators.length > 0 && (
              <p className={subtitleClass}>Creator / Studio: <span className={subtitleValueClass}>{article.creators[0]?.name}</span></p>
            )}
          </div>
          {article.sequentialCode && (
            <div className={styles.badge}>
              <Star className="w-4 h-4 mr-2" />
              {article.sequentialCode}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
        <div className="flex-1">
          <h1 className={`${styles.title} mb-4`}>{article.title}</h1>
          {article.creators && article.creators.length > 0 && (
            <p className={`${subtitleClass} mb-2`}>Creator / Studio: <span className={subtitleValueClass}>{article.creators[0]?.name}</span></p>
          )}
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {imageCount} {imageCount === 1 ? "Image" : "Images"}
            </span>
            <div className={`w-1 h-1 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-gray-400"}`} />
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Gallery View
            </span>
          </div>
        </div>

        {article.sequentialCode && (
          <div className={styles.badge}>
            <Star className="w-4 h-4 mr-2" />
            {article.sequentialCode}
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div className="space-y-6">
        {/* Main Image */}
        <div className={styles.mainImage} onClick={() => openModal(selectedImageIndex)}>
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-4 ${isDarkMode ? "border-gray-600 border-t-violet-400" : "border-gray-300 border-t-violet-600"
                }`} />
            </div>
          )}

          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[36rem]">
            {(() => {
              const mainImageSrc = getImageSrc(article.images[selectedImageIndex]);
              return mainImageSrc && (
                <Image
                  src={mainImageSrc}
                  alt={`${article.title} - Image ${selectedImageIndex + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  onError={() => handleImageError(selectedImageIndex)}
                  onLoad={() => setIsLoading(false)}
                  priority={selectedImageIndex === 0}
                  loader={myImageLoader}
                />
              );
            })()}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Controls */}
          <div className="absolute top-6 right-6">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md transition-all duration-300 ${isDarkMode ? "bg-black/60 text-white border border-white/20" : "bg-white/80 text-gray-900 border border-black/10"
              }`}>
              {selectedImageIndex + 1} / {imageCount}
            </div>
          </div>

          <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className={styles.controlButton}>
              <Maximize2 className="w-5 h-5" />
            </div>
          </div>

          {/* Navigation arrows */}
          {imageCount > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('prev') }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 ${styles.controlButton}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('next') }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 ${styles.controlButton}`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail */}
        {imageCount > 1 && (
          <div className="space-y-4 ">
            <div className="flex flex-wrap gap-3">
              {article.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailSelect(index)}
                  className={`${styles.thumbnail(selectedImageIndex === index)} w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36`}
                >
                  {(() => {
                    const thumbnailImageSrc = getImageSrc(image);
                    return thumbnailImageSrc && (
                      <Image
                        src={thumbnailImageSrc}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 25vw, (max-width: 768px) 16.67vw, (max-width: 1024px) 12.5vw, 8.33vw"
                        className="object-cover transition-transform duration-300 hover:scale-110"
                        onError={() => handleImageError(index)}
                        loader={myImageLoader}
                      />
                    );
                  })()}

                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
                    </div>
                  )}

                  <div className="absolute top-1 right-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${selectedImageIndex === index
                        ? "bg-violet-500 text-white"
                        : isDarkMode ? "bg-black/60 text-white" : "bg-white/80 text-gray-900"
                      }`}>
                      {index + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                  {modalImageIndex + 1} / {imageCount}
                </span>
                <span className="text-white/80 text-sm font-medium animate-pulse hover:animate-none hover:text-white transition-all duration-300 cursor-default">
                  {article.title}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md hover:scale-110"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 backdrop-blur-md hover:scale-110"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-6 py-3 backdrop-blur-md">
              <button onClick={handleZoomOut} className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" title="Zoom Out">
                <ZoomOut className="w-5 h-5" />
              </button>

              <span className="text-white text-sm px-3 py-1 bg-white/10 rounded-lg font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button onClick={handleZoomIn} className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" title="Zoom In">
                <ZoomIn className="w-5 h-5" />
              </button>

              <button onClick={resetZoom} className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" title="Reset Zoom">
                <RotateCcw className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-white/30 mx-2" />

              <button onClick={downloadImage} className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110" title="Download">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-8 sm:p-16">
            <div
              className="relative w-full h-full max-w-7xl max-h-full cursor-move"
              style={{
                transform: `scale(${zoomLevel}) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onDoubleClick={handleDoubleClick}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const modalImageSrc = getImageSrc(article.images[modalImageIndex]);
                return modalImageSrc && (
                  <MemoizedModalImage
                    src={modalImageSrc}
                    alt={`${article.title} - Image ${modalImageIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    loader={myImageLoader}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticleTitleMeta

