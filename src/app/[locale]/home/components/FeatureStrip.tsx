"use client"

import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function FeatureStrip() {
  const t = useTranslations("homePage");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const tags = [
    {
      name: "ACTION",
      value: "action",
      gradient: "from-red-600 via-red-950 to-neutral-950 border-red-500/25 hover:border-red-500/50 shadow-red-950/20",
    },
    {
      name: "FANTASY",
      value: "fantasy",
      gradient: "from-violet-600 via-purple-950 to-neutral-950 border-purple-500/25 hover:border-purple-500/50 shadow-purple-950/20",
    },
    {
      name: "INDIE",
      value: "indie",
      gradient: "from-zinc-500 via-zinc-700 to-neutral-950 border-zinc-500/25 hover:border-zinc-500/50 shadow-zinc-950/20",
    },
    {
      name: "OPEN WORLD",
      value: "open world",
      gradient: "from-amber-500 via-yellow-950 to-neutral-950 border-amber-500/25 hover:border-amber-500/50 shadow-amber-950/20",
    },
    {
      name: "PLATFORMER",
      value: "platformer",
      gradient: "from-teal-500 via-emerald-950 to-neutral-950 border-emerald-500/25 hover:border-emerald-500/50 shadow-emerald-950/20",
    },
  ];

  const handleTagClick = (tagVal: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("tag", tagVal);
    params.delete("page"); // Reset page
    // Navigate with hash to scroll to the catalog
    router.push(`${pathname}?${params.toString()}#catalog`);
  };

  return (
    <div className="space-y-4 my-6">
      <h2 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-3.5 bg-primary rounded-full"></span>
        {t("otherTagsYouMayLike")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {tags.map((tag) => (
          <button
            key={tag.value}
            onClick={() => handleTagClick(tag.value)}
            className={`group relative h-20 rounded-xl overflow-hidden border bg-gradient-to-br ${tag.gradient} p-4 flex items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/40 active:scale-95 text-center cursor-pointer`}
          >
            {/* Ambient hover light */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Faded giant background text */}
            <span className="absolute text-4xl font-black tracking-tighter opacity-[0.03] select-none pointer-events-none group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500">
              {tag.name}
            </span>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-xs font-black tracking-widest text-white/80 group-hover:text-white transition-colors duration-300">
                {tag.name}
              </span>
            </div>
            
            {/* Glossy top-highlight border */}
            <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}
