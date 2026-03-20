"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const pills = [
  { icon: '🎮', label: 'ทั้งหมด',    href: '/games',                              param: '' },
  { icon: '💻', label: 'Windows',    href: '/games?platform=windows',             param: 'windows' },
  { icon: '🤖', label: 'Android',    href: '/games?platform=android',             param: 'android' },
  { icon: '🍎', label: 'macOS',      href: '/games?platform=macos',               param: 'macos' },
  { icon: '🐧', label: 'Linux',      href: '/games?platform=linux',               param: 'linux' },
  { icon: '📱', label: 'iOS',        href: '/games?platform=ios',                 param: 'ios' },
  { icon: '🌐', label: 'Web',        href: '/games?platform=web',                 param: 'web' },
  { icon: '💖', label: 'Visual Novel',href: '/games?tag=visual-novel',            param: 'visual-novel' },
  { icon: '⚔️', label: 'RPG',        href: '/games?tag=rpg',                      param: 'rpg' },
  { icon: '🎭', label: 'Simulation', href: '/games?tag=simulation',               param: 'simulation' },
  { icon: '🎌', label: 'Anime',      href: '/games?tag=anime',                    param: 'anime' },
  { icon: '🎲', label: 'Strategy',   href: '/games?tag=strategy',                 param: 'strategy' },
];

export default function CategoryPills() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {pills.map((pill) => (
        <Link
          key={pill.param}
          href={pill.href}
          className="flex-shrink-0 flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5 bg-card hover:border-primary/60 hover:bg-primary/8 transition-all duration-150 group"
        >
          <span className="text-sm">{pill.icon}</span>
          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
            {pill.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
