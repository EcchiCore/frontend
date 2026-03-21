import React from "react";
import cn from "classnames";
import Image from "next/image";

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({ className, children, ...props }) => (
  <div
    className={cn("relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200", className)}
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
                                                          width = 40,       // 👈 Default width
                                                          height = 40,      // 👈 Default height
                                                          ...props
                                                        }) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={cn("w-full h-full object-cover", className)}
    {...props}
  />
);

type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => (
  <div
    className={cn("flex items-center justify-center w-full h-full text-center bg-gray-300 text-gray-700", className)}
    {...props}
  >
    {children}
  </div>
);