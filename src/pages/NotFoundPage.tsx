import { ButtonLink } from '../components/ui/Button';
import styles from './SimplePage.module.css';

export function NotFoundPage() {
  return (
    <div className={`container ${styles.notFound} page-enter`}>
      <span className={styles.notFoundCode}>404</span>
      <h1 className={styles.notFoundTitle}>This page took a wrong turn</h1>
      <p className={styles.notFoundText}>
        The page you were looking for is not here. It may have moved, or the link may have been
        mistyped. Everything currently for sale is still one click away.
      </p>
      <div className={styles.ctaRow}>
        <ButtonLink to="/vehicles" variant="primary" size="lg" icon="search">
          Browse cars
        </ButtonLink>
        <ButtonLink to="/" variant="secondary" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
