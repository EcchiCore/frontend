"use client";

import Link from 'next/link';
import Image from 'next/image';
import imageLoader from '@/lib/imageLoader';
import { useState } from 'react';
import type { SponsoredArticle } from '@chanomhub/sdk';
import { Megaphone } from 'lucide-react';

interface SponsoredArticlesProps {
    articles: SponsoredArticle[];
}

export default function SponsoredArticles({ articles }: SponsoredArticlesProps) {
    const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

    const handleImageError = (id: number) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-2 pb-2">
            {/* Section Header */}
            <div className="flex items-center space-x-2 mb-2 px-1">
                <div className="w-0.5 h-5 bg-amber-500"></div>
                <Megaphone className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground">Sponsored</h3>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {articles.map((sponsored) => {
                    const article = sponsored.article;
                    // Cover image fallback: sponsored.coverImage → article.coverImage → article.mainImage
                    const src = sponsored.coverImage || article.coverImage || article.mainImage || null;
                    const hasError = imageErrors[sponsored.id];

                    return (
                        <Link
                            key={sponsored.id}
                            href={`/articles/${article.slug}?id=${article.id}`}
                            className="group"
                        >
                            <div className="relative border border-border rounded-lg overflow-hidden hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/10 transition-all bg-card">
                                {/* Image */}
                                <div className="relative w-full h-28 bg-muted">
                                    {src && !hasError ? (
                                        <Image
                                            loader={imageLoader}
                                            src={src}
                                            alt={article.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover"
                                            onError={() => handleImageError(sponsored.id)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                            <Megaphone className="w-8 h-8 text-amber-500/50" />
                                        </div>
                                    )}

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    {/* Sponsored Badge */}
                                    <div className="absolute top-1.5 right-1.5 z-10">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 bg-amber-600/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
                                            Sponsored
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-2">
                                    <h4 className="text-foreground text-xs font-semibold line-clamp-2 group-hover:text-amber-500 transition-colors leading-tight">
                                        {article.title}
                                    </h4>
                                    {article.description && (
                                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                                            {article.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
