"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';



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
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-border/20 hover:shadow-2xl transition-shadow duration-300">
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
                    
                    {/* Enhanced Overlay สำหรับข้อความ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
                      <div className="max-w-4xl">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-2xl leading-tight truncate">
                          {article.title}
                        </h2>
                        <p className="text-md md:text-lg lg:text-xl text-white/95 max-w-3xl drop-shadow-lg leading-relaxed line-clamp-2">
                          {article.description}
                        </p>

                      </div>
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
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all duration-300 shadow-xl z-10 backdrop-blur-sm hover:scale-110 group"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-5 w-5 text-gray-800 group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all duration-300 shadow-xl z-10 backdrop-blur-sm hover:scale-110 group"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-5 w-5 text-gray-800 group-hover:text-primary transition-colors" />
              </button>

              {/* Enhanced Dots indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-white scale-125 shadow-xl ring-2 ring-white/50' 
                        : 'bg-white/50 hover:bg-white/80 hover:scale-110'
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
