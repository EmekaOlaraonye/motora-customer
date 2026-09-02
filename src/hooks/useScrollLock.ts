import { useEffect } from 'react';

let lockCount = 0;

/**
 * Prevents the page behind a drawer or modal from scrolling. Reference-counted
 * so nested overlays do not release the lock early.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    const { body } = document;
    // Compensate for the scrollbar so the layout does not jump on desktop.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (lockCount === 1) {
      body.dataset.scrollLocked = 'true';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        delete body.dataset.scrollLocked;
        body.style.paddingRight = '';
      }
    };
  }, [active]);
}
