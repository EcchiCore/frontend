"use client";

/**
 * ArticlePageLayout — Visual layout skeleton for the article detail page.
 * Inspired by the Steam Workshop page style.
 *
 * Layout overview:
 * ┌─────────────────────────────────────────────────────┐
 * │  [Tab: Workshop] [Discussions] [Mods]               │  ← Community navigation tabs
 * │  Breadcrumb: All Games > Category > Title  [⏱ 5min] │
 * ├──────────────────────────────────┬──────────────────┤
 * │  MAIN CONTENT (~65%)             │ SIDEBAR (~35%)   │
 * │                                  │                  │
 * │  ┌──────────────────────────┐    │ ┌──────────────┐ │
 * │  │  Gallery (16:10)         │    │ │ Author card  │ │
 * │  │  [Main image]            │    │ │ avatar, bio  │ │
 * │  │  [thumb][thumb][thumb]   │    │ │ follow/bkmrk │ │
 * │  └──────────────────────────┘    │ └──────────────┘ │
 * │                                  │ ┌──────────────┐ │
 * │  Title  [#CODE]    [PREMIUM?]    │ │ DOWNLOAD BTN │ │
 * │                                  │ └──────────────┘ │
 * │  ┌── Description block ──────┐   │ ┌──────────────┐ │
 * │  │  italic excerpt           │   │ │ Article Info │ │
 * │  └───────────────────────────┘   │ │ size/dates   │ │
 * │                                  │ │ version/stat │ │
 * │  [Video preview optional]        │ └──────────────┘ │
 * │                                  │ ┌──────────────┐ │
 * │  [Original source links]         │ │ Platforms    │ │
 * │                                  │ └──────────────┘ │
 * │  Article body (prose)            │ ┌──────────────┐ │
 * │                                  │ │ Tags         │ │
 * │  [Locked / Unlocked banner]      │ └──────────────┘ │
 * │                                  │ ┌──────────────┐ │
 * │  [Like] [Bookmark] [Share]       │ │ Categories   │ │
 * │                                  │ └──────────────┘ │
 * │  ─────────────────────────────   │                  │
 * │  Top Commenters section          │                  │
 * │                                  │                  │
 * │  ─────────────────────────────   │                  │
 * │  Comments section                │                  │
 * └──────────────────────────────────┴──────────────────┘
 * ┌─────────────────────────────────────────────────────┐
 * │  ── Related Articles (horizontal scroll) ────────── │
 * └─────────────────────────────────────────────────────┘
 */

import React from "react";

// ─── Skeleton primitives ────────────────────────────────────────────────────

const Sk = {
  /** Animated shimmer block */
  Block: ({ className = "" }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className}`}
      aria-hidden="true"
    />
  ),
  /** Circle shimmer */
  Circle: ({ size = 10 }: { size?: number }) => (
    <div
      className="animate-pulse rounded-full bg-white/5 flex-shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  ),
  /** Pill / Badge shimmer */
  Badge: ({ w = 16 }: { w?: number }) => (
    <div
      className="animate-pulse rounded-full bg-white/5 h-6"
      style={{ width: `${w * 4}px` }}
      aria-hidden="true"
    />
  ),
};

// ─── Sub-sections ───────────────────────────────────────────────────────────

/** Top navigation tabs: Workshop / Discussions / Mods */
const TabsRow = () => (
  <div className="border-b border-white/10 mb-4">
    <div className="flex gap-1">
      {["Workshop", "Discussions", "Mods"].map((label, i) => (
        <button
          key={label}
          className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            i === 0
              ? "border-[#e63946] text-white"
              : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

/** Breadcrumb: All Games > Category > Title + reading time */
const Breadcrumb = () => (
  <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/30">
    <span className="hover:text-white/60 cursor-pointer transition-colors">All Games</span>
    <span className="opacity-40">›</span>
    <Sk.Block className="h-3 w-16 rounded" />
    <span className="opacity-40">›</span>
    <Sk.Block className="h-3 w-32 rounded" />
    <div className="ml-auto flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded text-[9px]">
      <span className="opacity-40">⏱</span>
      <Sk.Block className="h-2 w-10 rounded" />
    </div>
  </nav>
);

/** Main image gallery + thumbnails strip */
const Gallery = () => (
  <div className="mb-8">
    {/* Main image */}
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-white/5 shadow-2xl"
      style={{ aspectRatio: "16/10" }}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent" />
      {/* Counter badge */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white/60 border border-white/10">
        1 / 5
      </div>
      {/* Zoom icon */}
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
        <span className="text-white text-xs">⛶</span>
      </div>
      {/* Prev / Next arrows (shown on hover) */}
      <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-black/70 transition-all">
        ‹
      </button>
      <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-black/70 transition-all">
        ›
      </button>
    </div>

    {/* Thumbnail strip */}
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`relative flex-shrink-0 w-20 sm:w-24 aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
            i === 0
              ? "ring-2 ring-[#e63946] ring-offset-2 ring-offset-[#0f0f17] scale-105"
              : "opacity-50 hover:opacity-80"
          }`}
        >
          <div className="absolute inset-0 animate-pulse bg-white/5" />
          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/60 text-white/50">
            {i + 1}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Article title row with sequential code badge */
const TitleRow = () => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div className="flex-1 space-y-2">
      <Sk.Block className="h-9 w-3/4 rounded-xl" />
      <div className="flex items-center gap-3">
        <Sk.Block className="h-4 w-16 rounded" />
        <span className="text-white/20 text-xs">·</span>
        <Sk.Block className="h-4 w-20 rounded" />
      </div>
    </div>
    {/* Sequential code badge */}
    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-semibold self-start">
      ★ <Sk.Block className="h-4 w-16 rounded bg-violet-500/20" />
    </div>
  </div>
);

/** Description block with left border */
const DescriptionBlock = () => (
  <div className="mb-8 p-5 rounded-2xl bg-[#e63946]/5 border-l-4 border-[#e63946] space-y-2">
    <Sk.Block className="h-4 w-full rounded" />
    <Sk.Block className="h-4 w-5/6 rounded" />
    <Sk.Block className="h-4 w-3/4 rounded" />
  </div>
);

/** Article body prose area */
const ArticleBody = () => (
  <div className="mb-10 space-y-3">
    {[100, 90, 95, 80, 85, 70, 90].map((w, i) => (
      <Sk.Block key={i} className={`h-4 rounded`} style={{ width: `${w}%` }} />
    ))}
    <div className="mt-6 space-y-2">
      <Sk.Block className="h-5 w-48 rounded" />
      {[85, 75, 90].map((w, i) => (
        <Sk.Block key={i} className="h-4 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  </div>
);

/** Like / Bookmark / Share interaction bar */
const InteractionBar = () => (
  <div className="flex flex-wrap gap-3 mb-8">
    {[
      { icon: "♥", label: "Like", accent: true },
      { icon: "🔖", label: "Bookmark", accent: false },
      { icon: "⇪", label: "Share", accent: false },
    ].map(({ icon, label, accent }) => (
      <button
        key={label}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
          accent
            ? "border-[#e63946]/40 bg-[#e63946]/10 text-[#e63946] hover:bg-[#e63946]/20"
            : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
        }`}
      >
        <span>{icon}</span> {label}
      </button>
    ))}
  </div>
);

/** Top commenters section */
const TopCommenters = () => (
  <div className="mb-8 p-6 rounded-2xl bg-white/3 border border-white/5">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e63946] to-violet-500 flex items-center justify-center text-white text-sm">
        💬
      </div>
      <div className="space-y-1">
        <Sk.Block className="h-5 w-36 rounded" />
        <Sk.Block className="h-3 w-52 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
        >
          <div className="relative">
            <Sk.Circle size={48} />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0f0f17] border border-white/10 flex items-center justify-center text-[10px]">
              {["🏆", "🥈", "🥉"][i]}
            </div>
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            <Sk.Block className="h-4 w-24 rounded" />
            <Sk.Block className="h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Comments section */
const CommentsSection = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Sk.Block className="h-6 w-32 rounded" />
    </div>
    {/* Comment input */}
    <div className="flex gap-3 mb-6">
      <Sk.Circle size={40} />
      <div className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5" />
    </div>
    {/* Comment items */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/3 border border-white/5">
        <Sk.Circle size={36} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sk.Block className="h-4 w-24 rounded" />
            <Sk.Block className="h-3 w-16 rounded" />
          </div>
          <Sk.Block className="h-4 w-full rounded" />
          <Sk.Block className="h-4 w-4/5 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Right Sidebar cards ────────────────────────────────────────────────────

const SidebarCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 ${className}`}
  >
    {children}
  </div>
);

/** Author card */
const AuthorCard = () => (
  <SidebarCard>
    <div className="flex items-center gap-3 mb-4">
      <div className="relative">
        <Sk.Circle size={52} />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0f0f17]" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <Sk.Block className="h-5 w-28 rounded" />
        <Sk.Block className="h-3 w-36 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <button className="w-full h-9 rounded-xl border border-white/10 bg-white/5 text-white/50 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all">
        + Follow
      </button>
      <button className="w-full h-9 rounded-xl border border-white/10 bg-white/5 text-white/50 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all">
        🔖 Bookmark
      </button>
    </div>
  </SidebarCard>
);

/** Download button card */
const DownloadCard = () => (
  <SidebarCard>
    <button className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:shadow-cyan-500/30 hover:scale-[1.02]">
      ⬇ View Downloads
    </button>
  </SidebarCard>
);

/** Article info card */
const ArticleInfoCard = () => (
  <SidebarCard>
    <div className="flex items-center gap-2 mb-4">
      <span className="text-white/40 text-sm">👁</span>
      <span className="text-white/70 text-sm font-semibold">Article Info</span>
    </div>
    <div className="space-y-2.5">
      {[
        { label: "Views", value: null, highlight: true },
        { label: "File Size", value: null, highlight: false },
        { label: "Posted", value: null, highlight: false },
        { label: "Updated", value: null, highlight: false },
        { label: "Version", value: null, highlight: false },
        { label: "Status", value: null, highlight: false },
      ].map(({ label, highlight }, i) => (
        <div key={i} className={`flex justify-between items-center ${i === 0 ? "pb-2.5 border-b border-white/8" : ""}`}>
          <span className={`text-xs ${highlight ? "font-medium text-white/70" : "text-white/40"}`}>
            {label}
          </span>
          {highlight ? (
            <Sk.Block className="h-4 w-12 rounded bg-[#e63946]/20" />
          ) : i === 4 ? (
            <Sk.Badge w={12} />
          ) : i === 5 ? (
            <div className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-bold">
              PUBLISHED
            </div>
          ) : (
            <Sk.Block className="h-3 w-20 rounded" />
          )}
        </div>
      ))}
    </div>
  </SidebarCard>
);

/** Generic tag/badge list card */
const TagListCard = ({
  title,
  icon,
  count = 4,
  variant = "default",
}: {
  title: string;
  icon: string;
  count?: number;
  variant?: "default" | "hash" | "category";
}) => (
  <SidebarCard>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-white/40 text-sm">{icon}</span>
      <span className="text-white/70 text-sm font-semibold">{title}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`px-3 py-1 rounded-full border text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 ${
            variant === "hash"
              ? "border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
              : variant === "category"
              ? "border-[#e63946]/30 bg-[#e63946]/10 text-[#e63946]/80 hover:bg-[#e63946]/20"
              : "border-white/15 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
          }`}
        >
          <Sk.Block className="h-3 rounded bg-current/20" style={{ width: `${40 + i * 12}px` }} />
        </div>
      ))}
    </div>
  </SidebarCard>
);

/** Related articles horizontal scroll */
const RelatedArticles = () => (
  <div className="mt-16">
    <div className="border-t border-white/8 pt-10 mb-6">
      <Sk.Block className="h-7 w-44 rounded-xl mb-2" />
      <Sk.Block className="h-4 w-64 rounded" />
    </div>
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-52 rounded-2xl border border-white/8 bg-white/3 overflow-hidden hover:border-white/15 hover:bg-white/5 transition-all duration-200 cursor-pointer group"
        >
          <div
            className="relative w-full animate-pulse bg-white/5 group-hover:bg-white/8 transition-colors"
            style={{ aspectRatio: "16/10" }}
          />
          <div className="p-3 space-y-2">
            <Sk.Block className="h-4 w-full rounded" />
            <Sk.Block className="h-3 w-3/4 rounded" />
            <div className="flex items-center justify-between pt-1">
              <Sk.Badge w={10} />
              <Sk.Block className="h-3 w-12 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Layout Component ──────────────────────────────────────────────────

/**
 * ArticlePageLayout
 *
 * A pure layout skeleton for the article detail page.
 * No data props required — shows animated shimmer placeholders.
 * Replace skeleton blocks with real data components once approved.
 */
export default function ArticlePageLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f17] text-white overflow-x-hidden">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-white/5 z-50">
        <div className="h-full bg-[#e63946] w-1/3 transition-all duration-300" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* ── Community tabs ─────────────────── */}
        <TabsRow />

        {/* ── Breadcrumb ─────────────────────── */}
        <Breadcrumb />

        {/* ── Main grid ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* ── Left: Main content ─────────────── */}
          <main className="min-w-0 space-y-0">
            {/* Gallery */}
            <Gallery />

            {/* Title + badge */}
            <TitleRow />

            {/* Description */}
            <DescriptionBlock />

            {/* Article body */}
            <ArticleBody />

            {/* Interaction bar */}
            <InteractionBar />

            {/* Top commenters */}
            <TopCommenters />

            {/* Comments */}
            <CommentsSection />
          </main>

          {/* ── Right: Sidebar ─────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <AuthorCard />
            <DownloadCard />
            <ArticleInfoCard />
            <TagListCard title="Platforms" icon="🖥" count={3} variant="default" />
            <TagListCard title="Tags" icon="🏷" count={5} variant="hash" />
            <TagListCard title="Categories" icon="📁" count={3} variant="category" />
          </aside>
        </div>

        {/* ── Related articles ─────────────────── */}
        <RelatedArticles />
      </div>
    </div>
  );
}
