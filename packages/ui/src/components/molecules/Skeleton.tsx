import { clsx } from 'clsx';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, width, height, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={clsx('skeleton', `skeleton--${variant}`, className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}
