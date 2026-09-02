import logoUrl from '../../assets/motora-logo.webp';
import styles from './Logo.module.css';

/** Intrinsic size of the asset, used to reserve space and avoid layout shift. */
const NATURAL_WIDTH = 440;
const NATURAL_HEIGHT = 143;

export interface LogoProps {
  /** Rendered height in pixels; width follows the artwork's aspect ratio. */
  height?: number;
  /**
   * Wraps the logo in a navy plate. Required on light surfaces, where the
   * white half of the wordmark would otherwise disappear.
   */
  plate?: boolean;
  /** Set on the one logo that acts as the page's brand heading. */
  alt?: string;
  className?: string;
}

export function Logo({ height = 28, plate = false, alt = 'Motora', className }: LogoProps) {
  const width = Math.round((height * NATURAL_WIDTH) / NATURAL_HEIGHT);

  const image = (
    <img
      src={logoUrl}
      alt={alt}
      width={width}
      height={height}
      style={{ height, width }}
      className={[styles.logo, className ?? ''].filter(Boolean).join(' ')}
      draggable={false}
    />
  );

  return plate ? <span className={styles.plate}>{image}</span> : image;
}
