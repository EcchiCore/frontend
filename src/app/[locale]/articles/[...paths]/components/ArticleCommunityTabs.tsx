"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface ArticleCommunityTabsProps {
    slug: string;
    commentCount?: number;
    className?: string;
    variant?: "default" | "inline";
}

const ArticleCommunityTabs: React.FC<ArticleCommunityTabsProps> = ({
    slug,
    commentCount,
    className,
    variant = "default"
}) => {
    const pathname = usePathname();
    const isWorkshop = pathname.includes('/mods');
    const isDiscussions = pathname.includes('/discussions');
    const isOverview = !isWorkshop && !isDiscussions;

    const tabs = [
        {
            label: "หน้าเกม", // Game Page (was All)
            href: `/articles/${slug}`,
            isActive: isOverview,
        },
        {
            label: "แชร์ภาพ", // Share Images (New)
            href: `#`,
            isActive: false,
        },
        {
            label: "พูดคุย", // Discussions
            href: `/articles/${slug}/discussions`, // Dedicated page
            count: commentCount,
            isActive: isDiscussions,
        },
        {
            label: "มอด", // Mods (was Workshop)
            href: `/articles/${slug}/mods`,
            isActive: isWorkshop,
        },
    ];

    if (variant === "inline") {
        return (
            <div className={cn("flex items-center gap-1 overflow-x-auto no-scrollbar", className)}>
                {tabs.map((tab, index) => (
                    <Link
                        key={index}
                        href={tab.href}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center",
                            tab.isActive
                                ? "bg-primary/20 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className="ml-1.5 text-xs opacity-70">
                                {tab.count}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("border-b border-white/10 bg-[#1b2838] text-[#939393] text-sm font-medium overflow-x-auto", className)}>
            <div className="container mx-auto px-4">
                <div className="flex items-center h-[46px] whitespace-nowrap">
                    {tabs.map((tab, index) => (
                        <Link
                            key={index}
                            href={tab.href}
                            className={cn(
                                "px-4 h-full flex items-center border-b-4 border-transparent hover:text-white transition-colors",
                                tab.isActive
                                    ? "border-[#1a9fff] text-white bg-white/5"
                                    : "hover:bg-white/5"
                            )}
                        >
                            <span className="uppercase tracking-wide">{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className="ml-1.5 text-xs text-[#626366] group-hover:text-white">
                                    {tab.count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArticleCommunityTabs;
