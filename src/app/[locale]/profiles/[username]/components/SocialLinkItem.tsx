// src/app/components/SocialLinkItem.tsx
'use client'; // This is crucial to mark it as a Client Component

import Image from 'next/image';
import { useState, useEffect } from 'react';
import imageLoader from '@/app/[locale]/lib/imageLoader';

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

interface SocialLinkItemProps {
  href: string;
  platform: string;
  initialIconUrl: string | null; // The URL for the icon, can be null if parsing failed initially
  username: string;
}

export default function SocialLinkItem({ href, platform, initialIconUrl, username }: SocialLinkItemProps) {
  const [currentIconUrl, setCurrentIconUrl] = useState(initialIconUrl || PLACEHOLDER_IMAGE);

  useEffect(() => {
    setCurrentIconUrl(initialIconUrl || PLACEHOLDER_IMAGE);
  }, [initialIconUrl]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100/10"
      aria-label={`Visit ${username}'s ${platform} profile`}
    >
      <Image
        loader={imageLoader}
        src={currentIconUrl}
        alt=""
        width={16}
        height={16}
        className="flex-shrink-0"
        onError={() => setCurrentIconUrl(PLACEHOLDER_IMAGE)}
      />
      <span>{platform}</span>
    </a>
  );
}