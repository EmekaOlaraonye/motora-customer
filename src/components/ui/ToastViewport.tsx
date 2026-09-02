import { createPortal } from 'react-dom';
import { useToast, type ToastTone } from '../../context/ToastContext';
import { Icon, type IconName } from './Icon';
import styles from './ToastViewport.module.css';

const TONE_ICONS: Record<ToastTone, IconName> = {
  success: 'check',
  error: 'alert',
  info: 'info',
};

/** Renders the toast stack. Mounted once, near the root of the app. */
export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.viewport} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.tone]}`}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span className={styles.iconWrap}>
            <Icon name={TONE_ICONS[toast.tone]} size={18} />
          </span>

          <div className={styles.content}>
            <p className={styles.title}>{toast.title}</p>
            {toast.description ? <p className={styles.description}>{toast.description}</p> : null}
          </div>

          <button
            type="button"
            className={styles.dismiss}
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
