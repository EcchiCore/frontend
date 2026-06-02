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
        <div className="absolute inset-0 bg-slate-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>
      )}

      {/* Fallback gradient background */}
      {hasError && (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent"></div>
        </div>
      )}

      {/* Main image */}
      {!hasError && (
        <Image
          loader={myImageLoader}
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-all duration-1000 ${
            isLoaded ? 'opacity-40 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'
          }`}
          priority
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
        />
      )}

      {/* Premium Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      <div className="absolute inset-0 bg-slate-950/30"></div>
      
      {/* Subtle Noise/Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
}