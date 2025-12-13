// Server Component - renders article body HTML for SEO/SSR
// This component renders the article content that Google can index

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/types/article";
import { formatDate } from "@/lib/dateUtils";
import { encodeURLComponent } from "@/lib/utils";

interface ArticleBodyServerProps {
    article: Article;
}

// Comprehensive HTML sanitizer for SSR - removes all JavaScript and unnecessary attributes
// This ensures Google sees clean HTML without JS artifacts
function sanitizeHtml(html: string): string {
    if (!html) return "";

    let sanitized = html;

    // 1. Remove script tags completely
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // 2. Remove noscript tags
    sanitized = sanitized.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "");

    // 3. Remove all event handlers (onclick, onload, onerror, etc.)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "");

    // 4. Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, "");

    // 5. Remove data-* attributes (often contain JSON/state that looks like JS)
    sanitized = sanitized.replace(/\s+data-[a-z0-9-]+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s+data-[a-z0-9-]+\s*=\s*[^\s>]*/gi, "");

    // 6. Remove style attributes with potential JS (expression, behavior, etc.)
    sanitized = sanitized.replace(/style\s*=\s*["'][^"']*expression\([^"']*["']/gi, "");
    sanitized = sanitized.replace(/style\s*=\s*["'][^"']*behavior\s*:[^"']*["']/gi, "");
    sanitized = sanitized.replace(/style\s*=\s*["'][^"']*javascript:[^"']*["']/gi, "");

    // 7. Remove contenteditable attributes
    sanitized = sanitized.replace(/\s+contenteditable\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/\s+contenteditable\s*=\s*[^\s>]*/gi, "");

    // 8. Remove draggable, spellcheck and other interactive attributes
    sanitized = sanitized.replace(/\s+(draggable|spellcheck|tabindex)\s*=\s*["'][^"']*["']/gi, "");

    // 9. Remove empty paragraphs and excessive whitespace
    sanitized = sanitized.replace(/<p>\s*<\/p>/gi, "");
    sanitized = sanitized.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "");

    // 10. Remove Tiptap/ProseMirror specific classes that contain "ProseMirror"
    sanitized = sanitized.replace(/class\s*=\s*["'][^"']*ProseMirror[^"']*["']/gi, "");

    return sanitized;
}

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

export default function ArticleBodyServer({ article }: ArticleBodyServerProps) {
    const mainImageUrl = article.coverImage || article.mainImage || article.backgroundImage;

    return (
        <article className="article-ssr-content" data-ssr="true">
            {/* Title Section - SSR for SEO */}
            <header className="mb-8">
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight text-foreground mb-4">
                    {article.title}
                    {article.ver && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            v{article.ver}
                        </span>
                    )}
                </h1>

                {/* Creator/Author info */}
                {article.creators && article.creators.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Creator / Studio: <span className="font-semibold text-foreground">{article.creators[0]?.name}</span>
                    </p>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 mt-4">
                    {article.author.image && (
                        <Image
                            src={article.author.image}
                            alt={article.author.name || "Author"}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    )}
                    <div>
                        <Link
                            href={`/profiles/${encodeURLComponent(article.author.name)}`}
                            className="font-medium text-primary hover:underline"
                        >
                            {article.author.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            {formatDate(article.createdAt)}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Image - SSR for SEO */}
            {mainImageUrl && (
                <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
                    <Image
                        src={mainImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                    />
                </div>
            )}

            {/* Article Body - SSR HTML for SEO */}
            <div
                className="prose prose-lg max-w-none dark:prose-invert mb-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body) }}
            />

            {/* Tags - SSR for SEO */}
            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm font-semibold text-muted-foreground">Tags:</span>
                    {article.tags.map((tag, index) => (
                        <Link
                            key={index}
                            href={`/games?tag=${encodeURLComponent(tag.name)}`}
                            className="tag-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                            #{tag.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* Categories - SSR for SEO */}
            {article.categories && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm font-semibold text-muted-foreground">Categories:</span>
                    {article.categories.map((category, index) => (
                        <Link
                            key={index}
                            href={`/games?category=${encodeURLComponent(category.name)}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* Platforms - SSR for SEO */}
            {article.platforms && article.platforms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm font-semibold text-muted-foreground">Platforms:</span>
                    {article.platforms.map((platform, index) => (
                        <Link
                            key={index}
                            href={`/games?platform=${encodeURLComponent(platform.name)}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                        >
                            {platform.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* Description - SSR for SEO (hidden visually but available for crawlers) */}
            {article.description && (
                <meta itemProp="description" content={article.description} />
            )}
        </article>
    );
}
