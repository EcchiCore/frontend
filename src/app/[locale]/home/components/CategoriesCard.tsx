// components/CategoriesCard.tsx
"use client";

import Link from 'next/link';

// Platform color mapping similar to GameCard
const getPlatformColor = (platform: string) => {
  const colors: Record<string, { bg: string, emoji: string }> = {
    'Windows': { bg: 'bg-blue-600/10 text-blue-600 hover:bg-blue-600/20', emoji: '🪟' },
    'Mac': { bg: 'bg-gray-600/10 text-gray-600 hover:bg-gray-600/20', emoji: '🍎' },
    'macOS': { bg: 'bg-gray-600/10 text-gray-600 hover:bg-gray-600/20', emoji: '🍎' },
    'Linux': { bg: 'bg-yellow-600/10 text-yellow-600 hover:bg-yellow-600/20', emoji: '🐧' },
    'Android': { bg: 'bg-green-600/10 text-green-600 hover:bg-green-600/20', emoji: '🤖' },
    'iOS': { bg: 'bg-gray-700/10 text-gray-700 hover:bg-gray-700/20', emoji: '📱' },
    'HTML': { bg: 'bg-orange-600/10 text-orange-600 hover:bg-orange-600/20', emoji: '🌐' },
    'Web': { bg: 'bg-orange-600/10 text-orange-600 hover:bg-orange-600/20', emoji: '🌐' },
    'Unity': { bg: 'bg-purple-600/10 text-purple-600 hover:bg-purple-600/20', emoji: '🎮' },
    'Unreal Engine': { bg: 'bg-cyan-600/10 text-cyan-600 hover:bg-cyan-600/20', emoji: '🎮' },
    'RenPy': { bg: 'bg-pink-600/10 text-pink-600 hover:bg-pink-600/20', emoji: '💖' },
  };
  return colors[platform] || { bg: 'bg-muted/50 text-muted-foreground hover:bg-muted', emoji: '📦' };
};

interface Platform {
  id: string;
  name: string;
  articleCount: number;
}

interface CategoriesCardProps {
  platforms: Platform[];
}

export default function CategoriesCard({ platforms }: CategoriesCardProps) {
  // Show top 10 platforms by article count
  const topPlatforms = platforms.slice(0, 10);

  if (!topPlatforms || topPlatforms.length === 0) {
    return (
      <div className="border border-border rounded p-2 bg-card">
        <div className="text-xs font-semibold mb-2 px-1 flex items-center space-x-2">
          <div className="w-0.5 h-4 bg-primary"></div>
          <span>แพลตฟอร์ม</span>
        </div>
        <div className="text-xs text-muted-foreground px-1">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded p-2 bg-card">
      <div className="text-xs font-semibold mb-2 px-1 flex items-center space-x-2">
        <div className="w-0.5 h-4 bg-primary"></div>
        <span>แพลตฟอร์ม</span>
      </div>
      <div className="space-y-0.5">
        {topPlatforms.map((platform) => {
          const colorConfig = getPlatformColor(platform.name);

          return (
            <Link
              key={platform.id}
              href={`/games?platform=${encodeURIComponent(platform.name)}`}
              className="block"
            >
              <div className={`flex items-center justify-between px-1.5 py-1 rounded transition-colors text-xs group ${colorConfig.bg}`}>
                <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                  <span className="text-sm flex-shrink-0">{colorConfig.emoji}</span>
                  <span className="font-medium transition-colors truncate">
                    {platform.name}
                  </span>
                </div>
                <span className="text-[10px] opacity-70 flex-shrink-0 ml-2">
                  {platform.articleCount.toLocaleString()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
