import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { ImageLightboxProps } from "./Interfaces";

const myImageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const ImageLightbox = ({
                         open,
                         onClose,
                         images,
                         initialIndex = 0,
                         isDarkMode = false,
                         swipeHandlers, // NEW: Destructure swipeHandlers
                       }: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  // Reset state when lightbox opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      setRotation(0);
      setIsLoading(true);
      setPreloadedImages(new Set());
    }
  }, [open, initialIndex]);

  // Estimate viewport width for preloading
  const getPreloadWidth = useCallback(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width <= 640) return 640;
      if (width <= 828) return 828;
      if (width <= 1280) return 1280;
      return 1920;
    }
    return 828;
  }, []);

  // Preload next one or two images
  const preloadImages = useCallback(() => {
    const width = getPreloadWidth();
    const imagesToPreload = [];

    const nextIndex = (currentIndex + 1) % images.length;
    const nextImageUrl = myImageLoader({ src: images[nextIndex], width, quality: 90 });
    if (!preloadedImages.has(nextImageUrl)) {
      imagesToPreload.push({ src: images[nextIndex], url: nextImageUrl });
    }

    const nextNextIndex = (currentIndex + 2) % images.length;
    if (images.length > 2) {
      const nextNextImageUrl = myImageLoader({ src: images[nextNextIndex], width, quality: 90 });
      if (!preloadedImages.has(nextNextImageUrl)) {
        imagesToPreload.push({ src: images[nextNextIndex], url: nextNextImageUrl });
      }
    }

    imagesToPreload.forEach(({ src, url }) => {
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        setPreloadedImages((prev) => new Set(prev).add(url));
      };
      img.onerror = () => {
        console.error(`Failed to preload image: ${src}`);
      };
    });
  }, [currentIndex, images, preloadedImages, getPreloadWidth]);

  // Memoize navigation functions
  const navigateToNext = useCallback(() => {
    setIsLoading(true);
    setZoomLevel(1);
    setRotation(0);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const navigateToPrevious = useCallback(() => {
    setIsLoading(true);
    setZoomLevel(1);
    setRotation(0);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const lightboxElement = document.getElementById("lightbox-container");
    if (!document.fullscreenElement) {
      if (lightboxElement?.requestFullscreen) {
        void lightboxElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      }
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowLeft":
          navigateToPrevious();
          break;
        case "ArrowRight":
          navigateToNext();
          break;
        case "Escape":
          onClose();
          break;
        case "+":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
          handleRotate();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, navigateToNext, navigateToPrevious, onClose, handleZoomIn, handleZoomOut, handleRotate, toggleFullscreen]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Trigger preload when current image loads
  const handleImageLoad = () => {
    setIsLoading(false);
    preloadImages();
  };

  // Preload initial images when lightbox opens
  useEffect(() => {
    if (open && images.length > 0) {
      preloadImages();
    }
  }, [open, currentIndex, images, preloadImages]);

  if (!open || images.length === 0) return null;

  const themeClass = isDarkMode ? "dark" : "";

  return (
    <div className={`${open ? "fixed" : "hidden"} inset-0 z-50 ${themeClass}`}>
      <div className="modal modal-open">
        <div className="modal-box max-w-full h-full p-0 m-0 rounded-none bg-base-100">
          <div
            id="lightbox-container"
            className="flex flex-col h-full w-full relative overflow-hidden"
            {...swipeHandlers} // NEW: Apply swipe handlers
          >
            {/* Header toolbar */}
            <div className="navbar bg-base-200 px-4 border-b border-base-300">
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
              <div className="flex-none gap-2">
                <button className="btn btn-sm btn-ghost btn-circle" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <button className="btn btn-sm btn-ghost btn-circle" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
                <button className="btn btn-sm btn-ghost btn-circle" onClick={handleRotate}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="btn btn-sm btn-ghost btn-circle" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  )}
                </button>
                <button className="btn btn-sm btn-ghost btn-circle" onClick={onClose}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="w-full">
                <progress className="progress w-full"></progress>
              </div>
            )}

            {/* Main image container */}
            <div className="flex items-center justify-center flex-grow relative select-none overflow-hidden">
              <div
                className="relative h-4/5 w-4/5 flex items-center justify-center transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
              >
                <Image
                  src={images[currentIndex]}
                  alt={`Expanded image ${currentIndex + 1}`}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="100vw"
                  priority
                  onLoad={handleImageLoad}
                  quality={90}
                />
              </div>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <button
                    className="btn btn-circle btn-ghost absolute left-4 bg-base-200 bg-opacity-50 hover:bg-opacity-80"
                    onClick={navigateToPrevious}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="btn btn-circle btn-ghost absolute right-4 bg-base-200 bg-opacity-50 hover:bg-opacity-80"
                    onClick={navigateToNext}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails bar */}
            {images.length > 1 && (
              <div className="bg-base-200 p-2 border-t border-base-300 overflow-x-auto">
                <div className="flex gap-2 py-1 justify-center">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsLoading(true);
                        setZoomLevel(1);
                        setRotation(0);
                      }}
                      className={`
                        w-20 h-16 relative rounded overflow-hidden cursor-pointer
                        transition-all duration-200 hover:opacity-100
                        ${index === currentIndex ? "ring-2 ring-primary opacity-100" : "opacity-70"}
                      `}
                    >
                      <Image
                        loader={myImageLoader}
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </div>
  );
};

export default ImageLightbox;
