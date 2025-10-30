"use client";

import Image from "next/image";
import { useState } from "react";
import myImageLoader from "@/lib/imageLoader";

interface BackgroundImageProps {
  src: string;
  alt: string;
}

export default function BackgroundImage({ src, alt }: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>
      )}

      {/* Fallback gradient background */}
      {hasError && (
        <div className="w-full h-full bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-indigo-600/40 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30"></div>
          {/* Geometric patterns for fallback */}
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-lg rotate-45 animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Main image */}
      {!hasError && (
        <Image
          loader={myImageLoader}
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } hover:scale-105`}
          priority
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
        />
      )}

      {/* Overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>

      {/* Animated particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-300/40 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-ping delay-2000"></div>
      </div>
    </div>
  );
}