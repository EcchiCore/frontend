'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-[#0d0f17] text-foreground flex overflow-hidden relative">
      {/* Left Form Side-Panel Container */}
      <div className="w-full md:w-[420px] lg:w-[460px] flex-shrink-0 bg-[#11131c] border-r border-border/40 z-10 flex flex-col h-full overflow-y-auto">
        {children}
      </div>

      {/* Right Artwork / Background Showcase Area */}
      <div className="hidden md:block flex-1 relative h-full bg-[#0d0f17] overflow-hidden">
        {/* Background Image Artwork */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/2122.png')` }}
        />

        {/* Soft Vignette & Seamless Left Overlay Fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#11131c] via-[#11131c]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-transparent to-black/30 pointer-events-none" />

        {/* Decorative Brand Showcase Watermark */}
        <div className="absolute bottom-10 right-10 text-right z-10 pointer-events-none">
          <h2 className="text-3xl font-black tracking-widest text-white/40 uppercase">ChanomHub</h2>
          <p className="text-xs text-white/30 tracking-wider">Explore Games, Mods & Content</p>
        </div>
      </div>
    </div>
  );
};
