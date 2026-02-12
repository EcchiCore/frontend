"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Box, User, Tag, Plus, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types/article";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ArticleModsSectionProps {
    mods: NonNullable<Article["mods"]>;
    isDarkBackground?: boolean;
    isAuthenticated?: boolean;
    articleId?: number; // Needed for submission link potentially
    articleSlug?: string;
}

const ArticleModsSection: React.FC<ArticleModsSectionProps> = ({
    mods: initialMods,
    isDarkBackground,
    isAuthenticated = false,
    articleSlug
}) => {

    // MOCK DATA for demonstration if empty
    const mockMods = [
        {
            name: "Community Patch v1.2",
            version: "1.2.0",
            creditTo: "ModderX",
            description: "Fixes various bugs and improves performance. A must-have for all players.",
            status: "APPROVED",
            categories: [{ name: "Patch" }, { name: "Fix" }],
            downloadLink: "#",
            images: [] as any[]
        },
        {
            name: "HD Texture Pack",
            version: "1.0",
            creditTo: "ArtMaster",
            description: "Replaces all textures with high-resolution 4k alternatives.",
            status: "APPROVED",
            categories: [{ name: "Graphics" }],
            downloadLink: "#",
            images: [{ url: "https://placehold.co/600x400/png" }]
        }
    ];

    // Use mock data if real mods are empty purely for the user to see the UI
    const displayMods = (initialMods && initialMods.length > 0) ? initialMods : mockMods;
    const hasRealMods = initialMods && initialMods.length > 0;

    return (
        <div className="mt-8 mb-8" id="mods-section">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Box className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">มอดจากชุมชน</h2>
                    <Badge variant="secondary" className="ml-2">
                        {displayMods.length}
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2" asChild>
                        <Link href={`/articles/${articleSlug}/mods`}>
                            <Box className="w-4 h-4" />
                            ดูทั้งหมด
                        </Link>
                    </Button>
                    {isAuthenticated ? (
                        <Button size="sm" variant="outline" className="gap-2" asChild>
                            <Link href={`/upload/mod?target=${articleSlug}`}>
                                <Plus className="w-4 h-4" />
                                ส่งมอด
                            </Link>
                        </Button>
                    ) : (
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => alert("กรุณาเข้าสู่ระบบเพื่อส่งมอด")}>
                            <Plus className="w-4 h-4" />
                            ส่งมอด
                        </Button>
                    )}

                </div>
            </div>

            {!hasRealMods && (
                <Alert className="mb-6 bg-muted/50 border-dashed">
                    <Box className="h-4 w-4" />
                    <AlertTitle>ยังไม่มีมอดที่ถูกส่งเข้ามา</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        มอดด้านล่างเป็นเพียงตัวอย่าง เป็นคนแรกที่ส่งมอดสำหรับบทความนี้เลย!
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayMods.map((mod, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row h-full">
                            {/* Mod Image */}
                            <div className="relative w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-muted/50 border-r">
                                {mod.images && mod.images.length > 0 ? (
                                    <Image
                                        src={mod.images[0].url}
                                        alt={mod.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, 128px"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                        <Box className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Mod Details */}
                            <div className="flex flex-col flex-1 p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 flex-1 mr-2">
                                        <h3 className="font-semibold text-lg truncate" title={mod.name}>
                                            {mod.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1 shrink-0">
                                                <Tag className="w-3 h-3" /> v{mod.version}
                                            </span>
                                            <span className="shrink-0">•</span>
                                            <span className="flex items-center gap-1 shrink-0 truncate">
                                                <User className="w-3 h-3" /> {mod.creditTo}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={mod.status === 'APPROVED' ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-5 shrink-0">
                                        {mod.status}
                                    </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                                    {mod.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <div className="flex gap-1 flex-wrap">
                                        {mod.categories?.slice(0, 2).map((cat, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] px-1 h-5">
                                                {cat.name}
                                            </Badge>
                                        ))}
                                        {mod.categories?.length > 2 && (
                                            <span className="text-[10px] text-muted-foreground self-center">+{mod.categories.length - 2}</span>
                                        )}
                                    </div>

                                    <Button size="sm" className="gap-2 shrink-0 ml-2" asChild>
                                        <a href={mod.downloadLink} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4" />
                                            ติดตั้ง
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Call to action card if few mods */}
                {displayMods.length < 4 && (
                    <Card className="flex flex-col items-center justify-center p-6 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors text-center h-full min-h-[140px]">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-1">สร้างมอดใหม่?</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                            แบ่งปันมอดของคุณกับชุมชน
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/upload/mod?target=${articleSlug}`}>
                                เริ่มอัปโหลด
                            </Link>
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ArticleModsSection;
