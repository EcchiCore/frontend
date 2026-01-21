"use client";
import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Trophy, Medal, Award } from "lucide-react";
import { SidebarLeftProps } from "./Interfaces";

const SidebarLeft: React.FC<SidebarLeftProps> = ({
  article,
  topCommenters,
}) => {

  const imageUrl = article.coverImage || article.mainImage || article.backgroundImage || null;
  const mainImageUrl = imageUrl;

  const getRankingIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-3 h-3 text-yellow-500" />;
      case 1:
        return <Medal className="w-3 h-3 text-gray-500" />;
      case 2:
        return <Award className="w-3 h-3 text-amber-600" />;
      default:
        return <span className="text-xs font-bold">{index + 1}</span>;
    }
  };

  const getRankingColors = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-orange-500";
      case 1:
        return "from-gray-300 to-gray-500";
      case 2:
        return "from-amber-600 to-amber-800";
      default:
        return "from-primary to-secondary";
    }
  };

  return (
    <aside className="hidden md:block">
      <Card className="sticky top-20 overflow-hidden shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardContent className="p-0">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative p-6">
            {/* Enhanced Image Section */}
            {mainImageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src={mainImageUrl}
                  alt="ภาพหลักของบทความ"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                  loading="eager"
                />

                {/* Decorative corner accent */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-primary/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Video Preview Section - Demo */}
            <div className="relative w-full rounded-lg overflow-hidden mb-6 group">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Video Preview
              </h3>
              <video
                controls
                className="w-full rounded-lg bg-black shadow-md"
                preload="metadata"
              >
                <source
                  src="https://vidoes.chanomhub.com/file/Chanomhub-Vidoes/20-1-26_2.webm?Authorization=4_0051e50adc6bddd0000000001_01c1e6d3_f3aa13_acct_M803cRTXDpM8g_fqY8ZYrBjl__c="
                  type="video/webm"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Article Description */}
            <div className="relative mb-6">
              <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-primary/60 to-secondary/60 rounded-full" />
              <p className="text-sm leading-relaxed text-muted-foreground relative z-10 pl-1">
                {article.description}
              </p>
            </div>

            {/* Top Commenters Section */}
            {topCommenters.length > 0 && (
              <>
                <Separator className="mb-6" />

                <div className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      ผู้แสดงความคิดเห็นสูงสุด
                    </h3>
                  </div>

                  {/* Commenters List */}
                  <div className="space-y-3">
                    {topCommenters.map((commenter, index) => (
                      <Card
                        key={index}
                        className="p-3 transition-all duration-300 hover:scale-105 cursor-pointer group border-none shadow-sm hover:shadow-md bg-muted/30 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          {/* Enhanced Avatar with Ranking */}
                          <div className="relative">
                            <Avatar className={`h-12 w-12 bg-gradient-to-br ${getRankingColors(index)} shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
                              <AvatarFallback className={`font-bold text-lg ${index < 3 ? "text-white" : "text-primary"} bg-transparent`}>
                                {commenter.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Ranking Badge */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                              {getRankingIcon(index)}
                            </div>
                          </div>

                          {/* User Information */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                              {commenter.username}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {commenter.count} ความคิดเห็น
                              </Badge>
                            </div>
                          </div>

                          {/* Hover Indicator */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Decorative Bottom Accent */}
                  <div className="flex justify-center pt-4">
                    <Separator className="w-16 bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default SidebarLeft;