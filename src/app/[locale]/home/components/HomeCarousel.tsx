"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

interface Article {
  id: number;
  title: string;
  slug: string;
  mainImage: string;
  description: string;
}

interface HomeCarouselProps {
  articles: Article[];
  loading: boolean;
}

export default function HomeCarousel({ articles, loading }: HomeCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  // Next slide
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  }, [articles.length]);

  // Previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  // Handle image error
  const handleImageError = (articleId: number, imageUrl: string) => {
    console.error(`Failed to load image for article ${articleId}:`, imageUrl);
    setImageErrors(prev => ({ ...prev, [articleId]: true }));
  };

  // Auto-slide
  useEffect(() => {
    if (articles.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [articles, nextSlide]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mb-12">
        <div className="relative bg-gray-200 rounded-xl shadow-lg h-96 md:h-[500px] animate-pulse"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 mb-12">
        <div className="relative bg-gray-100 rounded-xl shadow-lg h-96 md:h-[500px] flex items-center justify-center">
          <p className="text-gray-500">No articles available</p>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 mb-12">
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {articles.map((article, index) => (
              <div className="w-full flex-shrink-0" key={article.id}>
                <Link href={`/articles/${article.slug}`}>
                  <div className="relative w-full h-96 md:h-[500px]">
                    {/* แสดงภาพหรือ fallback สีเทา */}
                    {article.mainImage && !imageErrors[article.id] ? (
                      <Image
                        src={article.mainImage}
                        alt={article.title}
                        fill
                        sizes="100vw"
                        style={{ objectFit: 'cover' }}
                        priority={index <= 1}
                        onError={() => handleImageError(article.id, article.mainImage)}
                        onLoad={() => console.log(`✅ Image loaded successfully for article ${article.id}`)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <div className="text-4xl mb-2">🖼️</div>
                          <div className="text-sm opacity-75">Image not available</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay สำหรับข้อความ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        {article.title}
                      </h2>
                      <p className="text-md md:text-lg text-white/90 max-w-2xl drop-shadow-md">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation buttons - แสดงเฉพาะเมื่อมีมากกว่า 1 slide */}
          {articles.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg z-10 backdrop-blur-sm"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg z-10 backdrop-blur-sm"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      currentSlide === index 
                        ? 'bg-white scale-110 shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
