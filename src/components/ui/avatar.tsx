"use client";

import React, { useState } from "react";
import cn from "classnames";
import Image from "next/image";

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({ className, children, ...props }) => (
  <div
    className={cn("relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 shrink-0", className)}
    {...props}
  >
    {children}
  </div>
);

type AvatarImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  className,
  width = 128,
  height = 128,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("absolute inset-0 w-full h-full object-cover z-10", className)}
      onError={() => setError(true)}
      {...props}
    />
  );
};

type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => (
  <div
    className={cn("absolute inset-0 flex items-center justify-center w-full h-full text-center bg-gray-300 text-gray-700", className)}
    {...props}
  >
    {children}
  </div>
);
