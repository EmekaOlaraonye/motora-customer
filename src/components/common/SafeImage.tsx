import { useCallback, useState, type CSSProperties } from 'react';
import { Icon } from '../ui/Icon';
import styles from './SafeImage.module.css';

export interface SafeImageProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio value, e.g. "4 / 3". Reserves space before load. */
  ratio?: string;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  /** Shown inside the fallback when the photo cannot be loaded. */
  fallbackLabel?: string;
}

/**
 * Image with a shimmer placeholder and a branded fallback.
 *
 * Vehicle photography carries this product, so a failed image must still look
 * deliberate rather than broken.
 */
export function SafeImage({
  src,
  alt,
  ratio = '4 / 3',
  className,
  imageClassName,
  style,
  loading = 'lazy',
  fetchPriority,
  sizes,
  fallbackLabel = 'Photo unavailable',
}: SafeImageProps) {
  // Keyed by src: a source change implicitly resets the status without an
  // effect, which matters because a cached image fires `load` before effects
  // run and would otherwise be stuck at opacity 0.
  const [loadState, setLoadState] = useState<{ src: string; status: 'loaded' | 'error' }>();
  const status = loadState?.src === src ? loadState.status : 'loading';

  /**
   * An image restored from cache is already complete by the time React attaches
   * `onLoad`, so no event ever arrives. Checking on mount covers that case.
   */
  const captureNode = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node || !node.complete) return;
      setLoadState({ src, status: node.naturalWidth > 0 ? 'loaded' : 'error' });
    },
    [src],
  );

  return (
    <span
      className={[styles.wrap, className ?? ''].filter(Boolean).join(' ')}
      style={{ aspectRatio: ratio, ...style }}
    >
      {status === 'loading' ? <span className={styles.placeholder} /> : null}

      {status === 'error' ? (
        <span className={styles.fallback}>
          <Icon name="car" size={32} />
          <span className={styles.fallbackLabel}>{fallbackLabel}</span>
        </span>
      ) : (
        <img
          ref={captureNode}
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          sizes={sizes}
          decoding="async"
          draggable={false}
          className={[styles.image, status === 'loaded' ? styles.loaded : '', imageClassName ?? '']
            .filter(Boolean)
            .join(' ')}
          onLoad={() => setLoadState({ src, status: 'loaded' })}
          onError={() => setLoadState({ src, status: 'error' })}
        />
      )}
    </span>
  );
}
