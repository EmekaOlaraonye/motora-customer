import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'ghost' | 'success' | 'onDark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

function classes({
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconOnly,
  className,
}: CommonProps & { iconOnly?: boolean }) {
  return [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    iconOnly ? styles.iconOnly : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  loading?: boolean;
  loadingLabel?: string;
}

export function Button({
  variant,
  size,
  icon,
  iconPosition = 'start',
  fullWidth,
  className,
  loading = false,
  loadingLabel,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const iconOnly = !children && Boolean(icon);
  const iconSize = size === 'lg' ? 20 : 18;

  return (
    <button
      className={classes({ variant, size, fullWidth, iconOnly, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {children ? (
            <span className={styles.loadingLabel}>{loadingLabel ?? children}</span>
          ) : null}
        </>
      ) : (
        <>
          {icon && iconPosition === 'start' ? <Icon name={icon} size={iconSize} /> : null}
          {children}
          {icon && iconPosition === 'end' ? <Icon name={icon} size={iconSize} /> : null}
        </>
      )}
    </button>
  );
}

export interface ButtonLinkProps extends CommonProps {
  to: string;
  /** Renders an <a> instead of a router Link — for tel:, mailto: and wa.me. */
  external?: boolean;
  target?: string;
  rel?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

/** Visually identical to Button, but navigates. */
export function ButtonLink({
  to,
  external = false,
  variant,
  size,
  icon,
  iconPosition = 'start',
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const iconOnly = !children && Boolean(icon);
  const iconSize = size === 'lg' ? 20 : 18;

  const content = (
    <>
      {icon && iconPosition === 'start' ? <Icon name={icon} size={iconSize} /> : null}
      {children}
      {icon && iconPosition === 'end' ? <Icon name={icon} size={iconSize} /> : null}
    </>
  );

  const resolved = classes({ variant, size, fullWidth, iconOnly, className });

  if (external) {
    return (
      <a href={to} className={resolved} {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={resolved} {...props}>
      {content}
    </Link>
  );
}
