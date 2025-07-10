// src/app/components/SocialLinkItem.tsx
'use client'; // This is crucial to mark it as a Client Component

import Image from 'next/image';
import { useState } from 'react';

interface SocialLinkItemProps {
  href: string;
  platform: string;
  initialIconUrl: string | null; // The URL for the icon, can be null if parsing failed initially
  username: string;
}

export default function SocialLinkItem({ href, platform, initialIconUrl, username }: SocialLinkItemProps) {
  const [iconLoadError, setIconLoadError] = useState(false);

  const handleIconError = () => {
    setIconLoadError(true);
  };

  // Determine if we should show the DDG icon or a fallback
  const showDuckDuckGoIcon = initialIconUrl && !iconLoadError;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100/10"
      aria-label={`Visit ${username}'s ${platform} profile`}
      data-icon-failed={iconLoadError ? 'true' : undefined}
    >
      {showDuckDuckGoIcon ? (
        <Image
          src={initialIconUrl} // initialIconUrl is guaranteed to be non-null here
          alt="" // Decorative, as platform name is shown next to it
          width={16}
          height={16}
          className="flex-shrink-0"
          onError={handleIconError} // Event handler is now in a Client Component
        />
      ) : (
        // Fallback icon (if initialIconUrl was null or if loading failed)
        <span className="w-4 h-4 inline-flex items-center justify-center" aria-hidden="true">🔗</span>
      )}
      <span>{platform}</span>
    </a>
  );
}