"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function TagPills() {
  const t = useTranslations("homePage");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const tags = [
    { name: "ACTION", value: "action" },
    { name: "FANTASY", value: "fantasy" },
    { name: "INDIE", value: "indie" },
    { name: "OPEN WORLD", value: "open world" },
    { name: "PLATFORMER", value: "platformer" },
    { name: "RPG", value: "rpg" },
    { name: "VISUAL NOVEL", value: "visual novel" },
    { name: "SIMULATION", value: "simulation" },
  ];

  const handleTagClick = (tagVal: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("tag", tagVal);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}#catalog`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 justify-center">
      {tags.map((tag) => (
        <button
          key={tag.value}
          onClick={() => handleTagClick(tag.value)}
          className="px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground bg-muted/50 border border-border/50 rounded-full hover:text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-200 cursor-pointer"
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
