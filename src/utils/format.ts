/**
 * Display formatting helpers.
 *
 * All money on this platform is Botswana Pula. Prices are stored as whole
 * numbers of Pula (no thebe) and rendered with the local "P" prefix rather
 * than the ISO code, which is how prices are written on forecourts here.
 */

const groupedNumber = new Intl.NumberFormat('en-BW');

/** P320,000 */
export function formatPrice(amount: number): string {
  return `P${groupedNumber.format(Math.round(amount))}`;
}

/** P320k — for tight spaces such as chips and map pins. */
export function formatPriceCompact(amount: number): string {
  if (amount >= 1_000_000) return `P${(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `P${Math.round(amount / 1_000)}k`;
  return `P${amount}`;
}

/** 84,500 km */
export function formatMileage(km: number): string {
  return `${groupedNumber.format(km)} km`;
}

/** 84.5k km — compact variant for cards. */
export function formatMileageCompact(km: number): string {
  if (km >= 1_000) return `${(km / 1_000).toFixed(km >= 10_000 ? 0 : 1)}k km`;
  return `${km} km`;
}

/** 2.8L */
export function formatEngine(litres: number): string {
  return `${litres.toFixed(1)}L`;
}

/** Compact plain number with thousands separators. */
export function formatNumber(value: number): string {
  return groupedNumber.format(value);
}

/** "3 days ago" / "Today" — relative time for listing freshness. */
export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'Last month';
  return `${Math.floor(days / 30)} months ago`;
}

/** 12 August 2024 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Strips everything but digits so a number can be used in a tel: link. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Builds a wa.me deep link with an optional pre-filled message. */
export function toWhatsAppHref(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}

/** "2019 Toyota Fortuner 2.8 GD-6" */
export function vehicleTitle(vehicle: {
  year: number;
  make: string;
  model: string;
  variant?: string;
}): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.variant]
    .filter(Boolean)
    .join(' ');
}

/** "Toyota Fortuner" — used where the year is displayed separately. */
export function vehicleName(vehicle: { make: string; model: string }): string {
  return `${vehicle.make} ${vehicle.model}`;
}

/** Turns any string into a URL-safe slug segment. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Pluralises a count: pluralise(1, 'vehicle') -> "1 vehicle". */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${groupedNumber.format(count)} ${count === 1 ? singular : plural}`;
}
