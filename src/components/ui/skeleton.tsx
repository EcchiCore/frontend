import * as React from "react";
import ContentLoader, { IContentLoaderProps } from "react-content-loader";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card" | "list" | "custom";
  width?: number | string;
  height?: number | string;
  speed?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  animate?: boolean;
  children?: React.ReactNode;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "rectangular",
      width = "100%",
      height = 20,
      speed = 2,
      backgroundColor = "#f3f3f3",
      foregroundColor = "#ecebeb",
      animate = true,
      children,
    },
    ref
  ) => {
    const contentLoaderProps: IContentLoaderProps = {
      speed,
      width,
      height,
      backgroundColor,
      foregroundColor,
      animate,
    };

    const renderVariant = () => {
      switch (variant) {
        case "text":
          return (
            <ContentLoader {...contentLoaderProps}>
              <rect x="0" y="0" rx="4" ry="4" width="100%" height="100%" />
            </ContentLoader>
          );

        case "circular":
          const size = typeof width === "number" ? width : 40;
          return (
            <ContentLoader {...contentLoaderProps} width={size} height={size}>
              <circle cx={size / 2} cy={size / 2} r={size / 2} />
            </ContentLoader>
          );

        case "card":
          return (
            <ContentLoader {...contentLoaderProps}>
              <rect x="0" y="0" rx="8" ry="8" width="100%" height="200" />
              <rect x="0" y="220" rx="4" ry="4" width="80%" height="16" />
              <rect x="0" y="250" rx="4" ry="4" width="60%" height="12" />
            </ContentLoader>
          );

        case "list":
          return (
            <ContentLoader {...contentLoaderProps}>
              <circle cx="40" cy="40" r="20" />
              <rect x="80" y="25" rx="4" ry="4" width="200" height="12" />
              <rect x="80" y="45" rx="4" ry="4" width="150" height="10" />
            </ContentLoader>
          );

        case "custom":
          return (
            <ContentLoader {...contentLoaderProps}>
              {children}
            </ContentLoader>
          );

        case "rectangular":
        default:
          return (
            <ContentLoader {...contentLoaderProps}>
              <rect x="0" y="0" rx="6" ry="6" width="100%" height="100%" />
            </ContentLoader>
          );
      }
    };

    return (
      <div ref={ref} className={cn("", className)}>
        {renderVariant()}
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton components for common use cases
const TextSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ width = "100%", height = 16, ...props }, ref) => (
  <Skeleton ref={ref} variant="text" width={width} height={height} {...props} />
));
TextSkeleton.displayName = "TextSkeleton";

const CircularSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ width = 40, height = 40, ...props }, ref) => (
  <Skeleton ref={ref} variant="circular" width={width} height={height} {...props} />
));
CircularSkeleton.displayName = "CircularSkeleton";

const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ width = 300, height = 280, ...props }, ref) => (
  <Skeleton ref={ref} variant="card" width={width} height={height} {...props} />
));
CardSkeleton.displayName = "CardSkeleton";

const ListSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "variant">
>(({ width = 300, height = 80, ...props }, ref) => (
  <Skeleton ref={ref} variant="list" width={width} height={height} {...props} />
));
ListSkeleton.displayName = "ListSkeleton";

export {
  Skeleton,
  TextSkeleton,
  CircularSkeleton,
  CardSkeleton,
  ListSkeleton
};