"use client";
import React from "react";
import Image from "next/image";
import { SidebarLeftProps } from "./Interfaces";
import myImageLoader from "../../../lib/imageLoader";

const SidebarLeft: React.FC<SidebarLeftProps> = ({
                                                   article,
                                                   topCommenters,
                                                   isDarkBackground,
                                                 }) => {
  const mainImageUrl =
    typeof article.mainImage === "string"
      ? article.mainImage
      : article.mainImage?.url || "/default-image.jpg";

  return (
    <aside className="hidden md:block">
      <div
        className={`rounded-2xl shadow-xl overflow-hidden sticky top-20 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
          isDarkBackground
            ? "bg-gradient-to-br from-base-100/95 to-base-100/90 border-base-300/20"
            : "bg-gradient-to-br from-base-200/95 to-base-100/90 border-base-300/30"
        }`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="relative p-6">
          {/* Image section with enhanced styling */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image
              loader={myImageLoader}
              src={mainImageUrl}
              alt="ภาพหลักของบทความ"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 300px"
              loading="eager"
            />
            {/* Decorative corner accents */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-primary/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
          </div>

          {/* Description with enhanced typography */}
          <div className="relative mb-8">
            <p className={`text-sm leading-relaxed text-base-content/80 relative z-10`}>
              {article.description}
            </p>
            {/* Subtle accent line */}
            <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-primary/60 to-secondary/60 rounded-full" />
          </div>

          {/* Top commenters section */}
          {topCommenters.length > 0 && (
            <div className="relative">
              {/* Section header with enhanced styling */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-base-content bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ผู้แสดงความคิดเห็นสูงสุด
                </h3>
              </div>

              {/* Commenters list with enhanced cards */}
              <div className="space-y-4">
                {topCommenters.map((commenter, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer group ${
                      isDarkBackground
                        ? "hover:bg-base-300/20 hover:shadow-lg"
                        : "hover:bg-base-300/30 hover:shadow-lg"
                    }`}
                  >
                    {/* Enhanced avatar with ranking */}
                    <div className="relative">
                      <div
                        className={`relative flex size-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                            : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                                ? "bg-gradient-to-br from-amber-600 to-amber-800"
                                : isDarkBackground
                                  ? "bg-gradient-to-br from-primary/30 to-secondary/30"
                                  : "bg-gradient-to-br from-primary/20 to-secondary/20"
                        }`}
                      >
                        <span className={`font-bold text-lg ${index < 3 ? "text-white" : "text-primary"}`}>
                          {commenter.username[0].toUpperCase()}
                        </span>
                      </div>
                      {/* Ranking badge */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* User info with enhanced styling */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base-content group-hover:text-primary transition-colors duration-300">
                        {commenter.username}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <p className="text-sm text-base-content/70">
                            {commenter.count} ความคิดเห็น
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover arrow indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative bottom accent */}
              <div className="mt-6 flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;