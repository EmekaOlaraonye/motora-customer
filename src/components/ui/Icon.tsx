import type { ReactElement, SVGProps } from 'react';

/**
 * Inline icon set.
 *
 * Bundling the handful of icons the product needs avoids an icon dependency and
 * keeps every glyph on the same 24px grid and stroke weight, which is what makes
 * an interface feel drawn by one hand.
 */

export type IconName =
  | 'search'
  | 'filter'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-left'
  | 'close'
  | 'menu'
  | 'heart'
  | 'phone'
  | 'mail'
  | 'whatsapp'
  | 'check'
  | 'shield-check'
  | 'map-pin'
  | 'calendar'
  | 'gauge'
  | 'fuel'
  | 'gearbox'
  | 'car'
  | 'star'
  | 'share'
  | 'image'
  | 'alert'
  | 'info'
  | 'clock'
  | 'eye'
  | 'users'
  | 'expand'
  | 'external'
  | 'trash'
  | 'grid'
  | 'garage'
  | 'paint'
  | 'engine'
  | 'sliders';

const PATHS: Record<IconName, ReactElement> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  filter: <path d="M3.5 5h17l-6.8 7.8V19l-3.4 1.8v-8z" />,
  'chevron-down': <path d="m6 9.5 6 6 6-6" />,
  'chevron-up': <path d="m6 14.5 6-6 6 6" />,
  'chevron-left': <path d="m14.5 6-6 6 6 6" />,
  'chevron-right': <path d="m9.5 6 6 6-6 6" />,
  'arrow-right': <path d="M4 12h15m-6-6 6 6-6 6" />,
  'arrow-left': <path d="M20 12H5m6-6-6 6 6 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  heart: <path d="M12 20.4S3.6 14.9 3.6 9.3A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.4 2.9c0 5.6-8.4 11.1-8.4 11.1Z" />,
  phone: <path d="M6.4 3h3.1l1.5 4-2 1.4a12.2 12.2 0 0 0 5.6 5.6l1.4-2 4 1.5v3.1a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 3.4 5.2 2 2 0 0 1 5.4 3Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7.2 8.2 5.8 8.2-5.8" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.3 20.7 4.6 16.6A8.6 8.6 0 1 1 8 20l-4.7.7Z" />
      <path d="M9.2 9.3c.3 2.4 3.1 5.2 5.5 5.5l1-1.3 1.9.9-.3 1.5c-2.9.6-7.1-3.6-6.5-6.5l1.5-.3.9 1.9z" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  'shield-check': (
    <>
      <path d="M12 3.2 19 6v6c0 4.4-2.9 7.6-7 8.8-4.1-1.2-7-4.4-7-8.8V6z" />
      <path d="m9.2 12 2 2 3.6-3.6" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 20.8s6.8-5.5 6.8-10.8a6.8 6.8 0 1 0-13.6 0c0 5.3 6.8 10.8 6.8 10.8Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.2" y="5" width="17.6" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.2 10h17.6" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17.5a8 8 0 1 1 16 0" />
      <path d="m12.6 15.6 3.4-4.6" />
      <circle cx="12" cy="17.5" r="1.4" />
    </>
  ),
  fuel: <path d="M12 3.2s5.6 5.7 5.6 9.6a5.6 5.6 0 0 1-11.2 0C6.4 8.9 12 3.2 12 3.2Z" />,
  gearbox: (
    <>
      <circle cx="12" cy="4.6" r="1.6" />
      <path d="M12 6.2v12M6 9h12M6 9v4.5M12 9v4.5M18 9v4.5" />
    </>
  ),
  car: (
    <>
      <path d="M4.2 17.5v-4.7L6.3 7.8h11.4l2.1 5v4.7" />
      <path d="M4.2 12.8h15.6" />
      <circle cx="8" cy="17.5" r="1.7" />
      <circle cx="16" cy="17.5" r="1.7" />
    </>
  ),
  star: <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17.1l-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z" />,
  share: (
    <>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="17" cy="6" r="2.4" />
      <circle cx="17" cy="18" r="2.4" />
      <path d="m8.2 10.9 6.5-3.6M8.2 13.1l6.5 3.6" />
    </>
  ),
  image: (
    <>
      <rect x="3.2" y="5" width="17.6" height="14" rx="2.5" />
      <circle cx="8.6" cy="10" r="1.5" />
      <path d="m4.2 17.2 4.8-4 3.8 3 3-2.2 4 3.2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.2 2.9 19.8h18.2z" />
      <path d="M12 10v4.2M12 17.4v.1" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 11.2v5.6M12 7.8v.1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 6.8v5.4l3.4 2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.6 12S6.1 5.6 12 5.6 21.4 12 21.4 12 17.9 18.4 12 18.4 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.9" />
    </>
  ),
  users: (
    <>
      <circle cx="9.2" cy="8" r="3.2" />
      <path d="M3 19.2a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16.6 5.3a3.2 3.2 0 0 1 0 5.4M17.7 13.6a5.6 5.6 0 0 1 3.5 5.6" />
    </>
  ),
  expand: <path d="M8.5 3.5H3.5v5M15.5 3.5h5v5M20.5 15.5v5h-5M3.5 15.5v5h5" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
    </>
  ),
  trash: <path d="M4 6.5h16M9.5 6.5v-2h5v2M6.5 6.5 7.6 20h8.8l1.1-13.5" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.8" />
    </>
  ),
  garage: (
    <>
      <path d="M4 20.5V9.2L12 4l8 5.2v11.3" />
      <path d="M2.2 20.5h19.6" />
      <path d="M8.5 20.5v-6h7v6" />
    </>
  ),
  paint: (
    <>
      <path d="M12 20.8a8.8 8.8 0 1 1 8.8-8.8c0 2-1.6 3-3.2 3h-1.7a2 2 0 0 0-1.4 3.4 2 2 0 0 1-2.5 2.4Z" />
      <circle cx="8.2" cy="11.2" r="1" />
      <circle cx="12" cy="8.4" r="1" />
      <circle cx="15.8" cy="11.2" r="1" />
    </>
  ),
  engine: (
    <>
      <path d="M4 10h2V8h4v2h4l2.5 2.5H20v5h-2v2H8v-2H5.5L4 16z" />
      <path d="M11 6h4" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9" />
      <circle cx="15" cy="7.5" r="2.1" />
      <circle cx="9" cy="16.5" r="2.1" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Pixel size for both axes. */
  size?: number;
  /** Accessible label. Omit for decorative icons — they are hidden from AT. */
  title?: string;
}

export function Icon({ name, size = 20, title, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
