import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  /** Any CSS length. */
  width?: string;
  height?: string;
  shape?: 'text' | 'circle' | 'rect';
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width, height, shape = 'text', className, style }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, styles[shape], className ?? ''].filter(Boolean).join(' ')}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

/** Mirrors VehicleCard's geometry so the grid does not reflow when data lands. */
export function VehicleCardSkeleton() {
  return (
    <div className={styles.card}>
      <Skeleton shape="rect" className={styles.cardMedia} />
      <div className={styles.cardBody}>
        <Skeleton width="45%" height="1.4rem" />
        <Skeleton width="80%" height="1rem" />
        <div className={styles.cardSpecs}>
          <Skeleton width="70%" />
          <Skeleton width="60%" />
          <Skeleton width="65%" />
          <Skeleton width="55%" />
        </div>
        <Skeleton width="50%" height="0.9rem" />
      </div>
    </div>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </>
  );
}
