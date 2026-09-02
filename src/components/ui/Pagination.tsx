import { Icon } from './Icon';
import styles from './Pagination.module.css';

/**
 * Builds a compact page list: first, last, the current page and its
 * neighbours, with ellipses standing in for the rest.
 */
function pageItems(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const items: (number | 'gap')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push('gap');
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push('gap');

  items.push(total);
  return items;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Shown beneath the controls, e.g. "Showing 13–24 of 87 vehicles". */
  summary?: string;
}

export function Pagination({ page, totalPages, onPageChange, summary }: PaginationProps) {
  if (totalPages <= 1) {
    return summary ? <p className={styles.summary}>{summary}</p> : null;
  }

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.page}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={18} />
      </button>

      {pageItems(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={[styles.page, item === page ? styles.current : ''].filter(Boolean).join(' ')}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.page}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <Icon name="chevron-right" size={18} />
      </button>

      {summary ? <p className={styles.summary}>{summary}</p> : null}
    </nav>
  );
}
