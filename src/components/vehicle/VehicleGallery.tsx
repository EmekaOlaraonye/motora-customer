import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListingStatus, VehicleImage } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { StatusBadge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import styles from './VehicleGallery.module.css';

/** Minimum horizontal travel, in pixels, before a drag counts as a swipe. */
const SWIPE_THRESHOLD = 45;

/** Touch swipe handling shared by the inline stage and the lightbox. */
function useSwipe(onNext: () => void, onPrevious: () => void) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  return {
    onTouchStart(event: React.TouchEvent) {
      startX.current = event.touches[0].clientX;
      startY.current = event.touches[0].clientY;
    },
    onTouchEnd(event: React.TouchEvent) {
      if (startX.current == null || startY.current == null) return;

      const deltaX = event.changedTouches[0].clientX - startX.current;
      const deltaY = event.changedTouches[0].clientY - startY.current;

      // Ignore mostly-vertical drags so the page can still be scrolled.
      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) onNext();
        else onPrevious();
      }

      startX.current = null;
      startY.current = null;
    },
  };
}

export interface VehicleGalleryProps {
  images: VehicleImage[];
  title: string;
  status: ListingStatus;
}

export function VehicleGallery({ images, title, status }: VehicleGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  const swipe = useSwipe(next, previous);

  // Arrow-key navigation, active whenever the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, next, previous]);

  if (count === 0) {
    return (
      <div className={styles.stage}>
        <SafeImage src="" alt={title} ratio="16 / 10" className={styles.stageImage} />
      </div>
    );
  }

  const current = images[index];

  function onStageKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setLightboxOpen(true);
    }
    if (event.key === 'ArrowRight') next();
    if (event.key === 'ArrowLeft') previous();
  }

  return (
    <div className={styles.gallery}>
      <div
        className={styles.stage}
        onClick={() => setLightboxOpen(true)}
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
        onKeyDown={onStageKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Open full-screen gallery"
      >
        <SafeImage
          key={current.id}
          src={current.url}
          alt={current.alt}
          ratio="16 / 10"
          className={styles.stageImage}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 1023px) 100vw, 800px"
        />

        <div className={styles.statusOverlay}>
          <StatusBadge status={status} overlay />
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={(event) => {
                event.stopPropagation();
                previous();
              }}
              aria-label="Previous photo"
            >
              <Icon name="chevron-left" size={22} />
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Next photo"
            >
              <Icon name="chevron-right" size={22} />
            </button>

            <span className={styles.counter}>
              <Icon name="image" size={14} />
              {index + 1} / {count}
            </span>
          </>
        ) : null}

        <span className={styles.expandButton}>
          <Icon name="expand" size={14} />
          View full screen
        </span>
      </div>

      {count > 1 ? (
        <div className={styles.thumbs}>
          {images.map((image, thumbIndex) => (
            <button
              key={image.id}
              type="button"
              className={[styles.thumb, thumbIndex === index ? styles.thumbActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => goTo(thumbIndex)}
              aria-label={`View photo ${thumbIndex + 1}`}
              aria-current={thumbIndex === index}
            >
              <SafeImage
                src={image.url}
                alt=""
                ratio="4 / 3"
                className={styles.thumbImage}
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}

      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} size="full" bare>
        <div className={styles.lightbox}>
          <div className={styles.lightboxHeader}>
            <span className={styles.lightboxTitle}>
              {title} — photo {index + 1} of {count}
            </span>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div
            className={styles.lightboxStage}
            onTouchStart={swipe.onTouchStart}
            onTouchEnd={swipe.onTouchEnd}
          >
            <img src={current.url} alt={current.alt} className={styles.lightboxImage} />

            {count > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.arrowPrev}`}
                  onClick={previous}
                  aria-label="Previous photo"
                  style={{ opacity: 1 }}
                >
                  <Icon name="chevron-left" size={22} />
                </button>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.arrowNext}`}
                  onClick={next}
                  aria-label="Next photo"
                  style={{ opacity: 1 }}
                >
                  <Icon name="chevron-right" size={22} />
                </button>
              </>
            ) : null}
          </div>

          <div className={styles.lightboxThumbs}>
            {images.map((image, thumbIndex) => (
              <button
                key={image.id}
                type="button"
                className={[
                  styles.lightboxThumb,
                  thumbIndex === index ? styles.lightboxThumbActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => goTo(thumbIndex)}
                aria-label={`View photo ${thumbIndex + 1}`}
              >
                <SafeImage src={image.url} alt="" ratio="4 / 3" sizes="72px" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
