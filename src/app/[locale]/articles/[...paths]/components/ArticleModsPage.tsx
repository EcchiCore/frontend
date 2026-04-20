"use client";

import { Link } from "@/i18n/navigation";
import React, { useState } from "react";
import Image from "next/image";

import { Download, Box, Search, ChevronRight, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    isAuthenticated?: boolean; 
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
        <div className="min-h-screen bg-background text-foreground">
            {/* Header with Tabs & Breadcrumbs */}
            <div className="container mx-auto px-4 py-6 md:py-8">
                
                {/* 1. Primary Navigation Tabs - Highest priority */}
                <div className="mb-4 border-b border-border/50">
                    <ArticleCommunityTabs slug={article.slug} />
                </div>

                {/* 2. Secondary Breadcrumbs - Sub-navigation */}
                <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <Link href="/games" className="hover:text-primary transition-colors">
                        All Games
                    </Link>
                    
                    {article.categories?.[0] && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                            <Link 
                                href={`/games?category=${encodeURIComponent(article.categories[0].name)}`}
                                className="hover:text-primary transition-colors"
                            >
                                {article.categories[0].name}
                            </Link>
                        </>
                    )}

                    <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                    <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
                        {article.title}
                    </Link>

                    <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                    <span className="text-primary">MODS</span>
                </nav>

                <h1 className="text-3xl md:text-4xl font-black mb-10 tracking-tight uppercase">
                    {article.title} <span className="text-primary/50">Community Mods</span>
                </h1>

                {/* Toolbar & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                    <div className="relative w-full md:max-w-md group">
                        <Input
                            placeholder="Search mods..."
                            className="pl-10 h-12 bg-muted/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Select defaultValue="all">
                            <SelectTrigger className="h-12 w-full md:w-[160px] bg-muted/50 border-none rounded-2xl">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>

                        {isAuthenticated && (
                            <AddModDialog slug={article.slug} articleId={article.id} />
                        )}
                    </div>
                </div>

                {/* Mods Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMods.map((mod, index) => (
                        <Card key={index} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-card">
                            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                                {mod.images && mod.images.length > 0 ? (
                                    <Image
                                        src={mod.images[0].url}
                                        alt={mod.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/50">
                                        <Box className="w-12 h-12 opacity-10" />
                                    </div>
                                )}
                                
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none font-bold shadow-sm">
                                        v{mod.version}
                                    </Badge>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            <CardContent className="p-5">
                                <div className="mb-3">
                                    <h3 className="font-bold text-xl leading-tight line-clamp-1 group-hover:text-primary transition-colors mb-1" title={mod.name}>
                                        {mod.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        by <span className="font-bold text-foreground hover:text-primary cursor-pointer">{mod.creditTo}</span>
                                    </p>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-5 leading-relaxed">
                                    {mod.description}
                                </p>

                                <div className="flex gap-2 flex-wrap mb-5 h-6 overflow-hidden">
                                    {mod.categories?.slice(0, 2).map((cat, idx) => (
                                        <span key={idx} className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                                            #{cat.name}
                                        </span>
                                    ))}
                                </div>

                                <Button className="w-full gap-2 bg-muted hover:bg-primary hover:text-white text-foreground transition-all h-12 rounded-xl border-none shadow-none" asChild>
                                    <a href={mod.downloadLink} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4" />
                                        Download Mod
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredMods.length === 0 && (
                    <div className="text-center py-32 bg-muted/20 rounded-[3rem] mt-8 border-2 border-dashed border-border">
                        <Box className="w-20 h-20 mx-auto mb-6 opacity-10 text-primary" />
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">No Mods Found</h3>
                        <p className="text-muted-foreground">Be the first one to create a mod for this game!</p>
                        {isAuthenticated && (
                            <div className="mt-8">
                                <AddModDialog slug={article.slug} articleId={article.id} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleModsPage;