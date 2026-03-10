// src/components/DonationSidebarWidget.tsx
'use client';

export default function DonationSidebarWidget() {
  return (
    <div className="border border-border rounded p-2 bg-card text-foreground">
      <div className="text-xs font-semibold mb-2 px-1 flex items-center space-x-2">
        <div className="w-0.5 h-4 bg-primary"></div>
        <span>สนับสนุนเรา</span>
      </div>
      <div className="w-full flex flex-col items-center">
        <p className="text-xs text-muted-foreground mb-2 text-center">สามารถโดเนทเพื่อให้เราสนับสนุนเล็กน้อยได้</p>
        <iframe
          src="/api/donation-proxy?w=leaderboard&u=c140txkndfjhrrdjh4vea8yi&t=30a1b480ba003411401c9271cc4983c4"
          width="100%"
          height="450"
          style={{ border: 'none', background: 'transparent' }}
          allow="transparency"
          className="rounded-md"
        />
      </div>
    </div>
  );
}
