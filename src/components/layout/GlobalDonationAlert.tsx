// src/components/GlobalDonationAlert.tsx
'use client';

export default function GlobalDonationAlert() {
  return (
    <iframe
      src="/api/donation-proxy?w=alert&u=c140txkndfjhrrdjh4vea8yi&t=30a1b480ba003411401c9271cc4983c4"
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-full max-w-3xl h-[600px]"
      style={{ border: 'none', background: 'transparent' }}
      allow="transparency"
    />
  );
}
