import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'navy'
  | 'overlay'
  | 'overlayBrand';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: IconName;
  /** Small status dot instead of an icon. */
  dot?: boolean;
  pill?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  tone = 'neutral',
  icon,
  dot = false,
  pill = false,
  size = 'md',
  className,
}: BadgeProps) {
  const resolved = [
    styles.badge,
    styles[tone],
    pill ? styles.pill : '',
    size === 'sm' ? styles.sm : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={resolved}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} /> : null}
      {children}
    </span>
  );
}

/**
 * Listing availability, expressed consistently everywhere it appears.
 * Green is reserved for genuinely positive states so it keeps its meaning.
 */
export function StatusBadge({
  status,
  overlay = false,
  size = 'md',
}: {
  status: 'available' | 'reserved' | 'sold';
  overlay?: boolean;
  size?: 'sm' | 'md';
}) {
  if (status === 'available') {
    return (
      <Badge tone={overlay ? 'overlay' : 'success'} dot pill size={size}>
        Available
      </Badge>
    );
  }

  if (status === 'reserved') {
    return (
      <Badge tone={overlay ? 'overlay' : 'warning'} dot pill size={size}>
        Reserved
      </Badge>
    );
  }

  return (
    <Badge tone={overlay ? 'overlay' : 'danger'} dot pill size={size}>
      Sold
    </Badge>
  );
}

/** Applied only to garages the platform has actually checked. */
export function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge tone="brand" icon="shield-check" pill size={size}>
      Verified garage
    </Badge>
  );
}
