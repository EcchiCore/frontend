"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const getCategoryGroups = (t: any) => [
  {
    id: "platforms", name: t("platforms"), icon: "💻",
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
    id: "genres", name: t("genres"), icon: "🎮",
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
    id: "tags", name: t("popularTags"), icon: "🏷️",
    subcategories: [
      { name: "Anime", count: 923, slug: "anime" },
      { name: "3D", count: 789, slug: "3d" },
      { name: "2D", count: 654, slug: "2d" },
      { name: "Parody", count: 456, slug: "parody" },
      { name: "RenPy", count: 567, slug: "renpy" },
      { name: "Unity", count: 345, slug: "unity" },
    ]
  },
  {
    id: "content", name: t("content"), icon: "📋",
    subcategories: [
      { name: t("games"), count: 2345, slug: "games" },
      { name: t("mods"), count: 456, slug: "mods" },
      { name: t("patches"), count: 234, slug: "patches" },
      { name: t("saveFiles"), count: 189, slug: "saves" },
      { name: t("guides"), count: 123, slug: "guides" },
      { name: t("reviews"), count: 98, slug: "reviews" },
    ]
  },
];

export default function CategoryGrid() {
  const t = useTranslations("CategoryGrid");
  const categoryGroups = getCategoryGroups(t);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      {categoryGroups.map((group) => (
        <div
          key={group.id}
          className="border border-border rounded-xl p-2 bg-card hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/60">
            <span className="text-xs">{group.icon}</span>
            <h3 className="text-[11px] font-bold text-foreground truncate">{group.name}</h3>
          </div>
          <div className="space-y-0.5">
            {group.subcategories.map((subcat) => (
              <Link
                key={subcat.slug}
                href={`/games?${group.id === 'platforms' ? 'platform' : 'tag'}=${encodeURIComponent(subcat.name)}`}
                className="flex items-center justify-between px-1 py-0.5 hover:bg-primary/8 rounded transition-colors group"
              >
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors truncate">
                  {subcat.name}
                </span>
                <span className="text-[9px] text-muted-foreground/60 flex-shrink-0 ml-1 tabular-nums">
                  {subcat.count.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
