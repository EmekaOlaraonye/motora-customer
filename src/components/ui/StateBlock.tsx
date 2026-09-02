import type { ReactNode } from 'react';
import type { ApiError } from '../../services/ApiError';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import styles from './StateBlock.module.css';

interface StateBlockProps {
  icon?: IconName;
  tone?: 'brand' | 'error' | 'neutral';
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  variant?: 'card' | 'compact' | 'bare';
}

/** Shared shell for empty, error and unavailable states. */
export function StateBlock({
  icon = 'info',
  tone = 'brand',
  title,
  description,
  actions,
  variant = 'card',
}: StateBlockProps) {
  const className = [
    styles.block,
    variant === 'compact' ? styles.compact : '',
    variant === 'bare' ? styles.bare : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="status">
      <span className={styles.iconWrap} data-tone={tone}>
        <Icon name={icon} size={28} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

export function EmptyState(props: Omit<StateBlockProps, 'tone'>) {
  return <StateBlock tone="neutral" {...props} />;
}

/**
 * Error presentation is driven by the ApiError code so customers get a message
 * that reflects what actually went wrong rather than a stack trace.
 */
export function ErrorState({
  error,
  onRetry,
  variant = 'card',
}: {
  error: ApiError;
  onRetry?: () => void;
  variant?: 'card' | 'compact' | 'bare';
}) {
  const isNetwork = error.code === 'network';

  return (
    <StateBlock
      variant={variant}
      icon={isNetwork ? 'alert' : 'alert'}
      tone="error"
      title={isNetwork ? 'No connection' : 'That did not load'}
      description={error.message}
      actions={
        onRetry ? (
          <Button variant="secondary" icon="arrow-right" iconPosition="end" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}
