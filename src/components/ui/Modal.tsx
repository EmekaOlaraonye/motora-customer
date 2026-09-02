import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Icon } from './Icon';
import styles from './Overlay.module.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Escape-to-close plus a focus trap — shared by Modal and Drawer. */
function useOverlayBehaviour(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    container?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !container) return;

      const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusTo.current?.focus?.();
    };
  }, [open, onClose]);

  return containerRef;
}

interface BaseOverlayProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Rendered in a sticky footer. */
  footer?: ReactNode;
  labelledBy?: string;
}

export interface ModalProps extends BaseOverlayProps {
  size?: 'default' | 'wide' | 'full';
  /** Hides the chrome so the gallery lightbox can own the whole surface. */
  bare?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'default',
  bare = false,
}: ModalProps) {
  const containerRef = useOverlayBehaviour(open, onClose);

  const onBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const className = [
    styles.modal,
    size === 'wide' ? styles.modalWide : '',
    size === 'full' ? styles.modalFull : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div
      className={`${styles.backdrop} ${styles.modalBackdrop}`}
      onMouseDown={onBackdropClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {!bare && title ? (
          <header className={styles.header}>
            <div>
              <h2 className={styles.title}>{title}</h2>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </header>
        ) : null}

        {bare ? children : <div className={styles.body}>{children}</div>}
      </div>
    </div>,
    document.body,
  );
}

export interface DrawerProps extends BaseOverlayProps {}

/** Side sheet used for filters and the mobile menu. */
export function Drawer({ open, onClose, title, subtitle, children, footer }: DrawerProps) {
  const containerRef = useOverlayBehaviour(open, onClose);

  const onBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${styles.drawerBackdrop}`}
      onMouseDown={onBackdropClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className={styles.drawerBody}>{children}</div>

        {footer ? <footer className={styles.drawerFooter}>{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
