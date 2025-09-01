"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AvatarImage } from "@/components/ui/avatar";
import imageLoader from '@/app/[locale]/lib/imageLoader';

const PLACEHOLDER_IMAGE = "/placeholder-image.png";

interface ImageWithFallbackProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  type: "nextImage" | "avatarImage";
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fill,
  style,
  type,
}) => {
  const [imageSrc, setImageSrc] = useState(src || PLACEHOLDER_IMAGE);

  const handleError = () => {
    setImageSrc(PLACEHOLDER_IMAGE);
  };

  if (type === "nextImage") {
    return (
      <Image
        loader={imageLoader}
        src={imageSrc}
        alt={alt}
        className={className}
        fill={fill}
        style={style}
        onError={handleError}
      />
    );
  } else {
    return (
      <AvatarImage
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleError}
      />
    );
  }
};

export default ImageWithFallback;
