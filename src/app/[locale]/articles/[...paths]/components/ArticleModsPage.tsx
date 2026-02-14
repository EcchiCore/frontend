"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Box, User, Tag, Plus, Upload, Search, Filter, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Article } from "@/types/article";

import ArticleCommunityTabs from "./ArticleCommunityTabs";
import { AddModDialog } from "./AddModDialog";

import { useAppSelector } from "@/store/hooks";

interface ArticleModsPageProps {
    article: Article;
    mods: NonNullable<Article["mods"]>;
    isAuthenticated?: boolean; // Kept for backward compatibility if needed, but we'll prefer Redux
}

const ArticleModsPage: React.FC<ArticleModsPageProps> = ({
    article,
    mods: initialMods,
    isAuthenticated: propIsAuthenticated = false,
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const isAuthenticated = propIsAuthenticated || !!user;
    const [searchTerm, setSearchTerm] = useState("");

    const displayMods = initialMods;

    const filteredMods = displayMods.filter(mod =>
        mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#1b2838] text-[#c6d4df]">
            {/* Search Header roughly matching Steam's style */}
            <div className="bg-[#171a21] pt-6 pb-0">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-[#8F98A0] hover:text-white mb-2 text-sm uppercase font-bold tracking-wider">
                        <Link href={`/articles/${article.slug}`}>
                            {article.title}
                        </Link>
                        <span>&gt;</span>
                        <span>Workshop</span>
                    </div>
                    <h1 className="text-2xl text-white font-medium mb-6 uppercase tracking-widest">
                        {article.title} Workshop
                    </h1>
                </div>

                <ArticleCommunityTabs slug={article.slug} />
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Steam-like Toolbar */}
                <div className="bg-[#2a475e] p-1 flex flex-col md:flex-row gap-2 mb-6 rounded-sm">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search "
                            className="bg-[#1b2838] border-none text-white placeholder:text-[#67c1f5] h-9 focus-visible:ring-1 focus-visible:ring-[#67c1f5]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#67c1f5]" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="h-9 text-[#67c1f5] hover:text-white hover:bg-white/10 text-xs font-bold bg-[#1b2838]">
                            <Search className="w-4 h-4 mr-2" />
                        </Button>
                        {/* Add Mod Button */}
                        {isAuthenticated && (
                            <AddModDialog slug={article.slug} articleId={article.id} />
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-4 border-b border-[#3c4e66] pb-2">
                    <h2 className="text-sm font-bold text-[#f3f3f3]">Most Popular</h2>

                    <div className="flex gap-4 text-xs">
                        <Select defaultValue="week">
                            <SelectTrigger className="w-[140px] h-7 bg-transparent border-none text-[#67c1f5] hover:text-white p-0">
                                <SelectValue placeholder="Time range" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#3d4450] border-[#171a21] text-[#c6d4df]">
                                <SelectItem value="week">One Week</SelectItem>
                                <SelectItem value="month">One Month</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mods Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMods.map((mod, index) => (
                        <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-muted-foreground/20">
                            <div className="relative aspect-video bg-muted overflow-hidden">
                                {mod.images && mod.images.length > 0 ? (
                                    <Image
                                        src={mod.images[0].url}
                                        alt={mod.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/50">
                                        <Box className="w-12 h-12 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                                        v{mod.version}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-4">
                                <div className="mb-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors" title={mod.name}>
                                            {mod.name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        โดย <span className="font-medium text-foreground">{mod.creditTo}</span>
                                    </p>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                                    {mod.description}
                                </p>

                                <div className="flex gap-1 flex-wrap mb-4 h-11 overflow-hidden">
                                    {mod.categories?.slice(0, 3).map((cat, idx) => (
                                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 h-5 bg-muted/30">
                                            {cat.name}
                                        </Badge>
                                    ))}
                                </div>

                                <Button className="w-full gap-2 group-hover:bg-primary" asChild>
                                    <a href={mod.downloadLink} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4" />
                                        ติดตั้ง
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredMods.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Box className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold mb-2">ไม่พบมอดที่คุณค้นหา</h3>
                        <p>ลองค้นหาด้วยคำค้นอื่น หรือเป็นคนแรกที่สร้างมอดนี้!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleModsPage;
