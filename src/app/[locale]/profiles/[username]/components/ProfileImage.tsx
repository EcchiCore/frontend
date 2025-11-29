"use client";

import Image from 'next/image';
import myImageLoader from '@/lib/imageLoader';

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

interface ProfileImageProps {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  username: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, width, height, username: _username }) => {
  return (
    <Image
      loader={myImageLoader}
      src={src || PLACEHOLDER_IMAGE}
      alt={alt}
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, 128px"
      className="rounded-full"
      priority
      onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
    />
  );
};

export default ProfileImage;