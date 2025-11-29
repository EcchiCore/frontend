"use client";

import Link from 'next/link';

// Mock data for category structure - replace with real API data later
const categoryGroups = [
    {
        id: "platforms",
        name: "แพลตฟอร์ม",
        icon: "💻",
        subcategories: [
            { name: "Windows", count: 1234, slug: "windows" },
            { name: "Android", count: 892, slug: "android" },
            { name: "macOS", count: 456, slug: "macos" },
            { name: "Linux", count: 234, slug: "linux" },
            { name: "iOS", count: 189, slug: "ios" },
            { name: "Web", count: 156, slug: "web" },
        ]
    },
    {
        id: "genres",
        name: "ประเภท",
        icon: "🎮",
        subcategories: [
            { name: "RPG", count: 567, slug: "rpg" },
            { name: "Visual Novel", count: 892, slug: "visual-novel" },
            { name: "Simulation", count: 345, slug: "simulation" },
            { name: "Action", count: 278, slug: "action" },
            { name: "Adventure", count: 456, slug: "adventure" },
            { name: "Strategy", count: 123, slug: "strategy" },
        ]
    },
    {
        id: "tags",
        name: "แท็กยอดนิยม",
        icon: "🏷️",
        subcategories: [
            { name: "3D", count: 789, slug: "3d" },
            { name: "2D", count: 654, slug: "2d" },
            { name: "Anime", count: 923, slug: "anime" },
            { name: "Parody", count: 456, slug: "parody" },
            { name: "Unity", count: 345, slug: "unity" },
            { name: "RenPy", count: 567, slug: "renpy" },
        ]
    },
    {
        id: "content",
        name: "เนื้อหา",
        icon: "📋",
        subcategories: [
            { name: "เกม", count: 2345, slug: "games" },
            { name: "มอด", count: 456, slug: "mods" },
            { name: "แพตช์", count: 234, slug: "patches" },
            { name: "เซฟไฟล์", count: 189, slug: "saves" },
            { name: "คู่มือ", count: 123, slug: "guides" },
            { name: "รีวิว", count: 98, slug: "reviews" },
        ]
    }
];

export default function CategoryGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {categoryGroups.map((group) => (
                <div key={group.id} className="border border-border rounded p-2 bg-card">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-border/50">
                        <span className="text-base">{group.icon}</span>
                        <h3 className="text-xs font-semibold text-foreground">{group.name}</h3>
                    </div>

                    {/* Subcategories */}
                    <div className="space-y-0.5">
                        {group.subcategories.map((subcat) => (
                            <Link
                                key={subcat.slug}
                                href={`/games?${group.id === 'platforms' ? 'platform' : 'tag'}=${encodeURIComponent(subcat.name)}`}
                                className="block"
                            >
                                <div className="flex items-center justify-between px-1.5 py-1 hover:bg-accent/50 rounded transition-colors text-xs group">
                                    <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                        {subcat.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                                        {subcat.count.toLocaleString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
