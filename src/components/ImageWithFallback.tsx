"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AvatarImage } from "@/components/ui/avatar";
import imageLoader from '@/lib/imageLoader';

const PLACEHOLDER_IMAGE = "/placeholder-image.png";

interface ImageWithFallbackProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  type: "nextImage" | "avatarImage";
  width?: number;
  height?: number;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fill,
  style,
  type,
  width,
  height,
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
        width={width}
        height={height}
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
