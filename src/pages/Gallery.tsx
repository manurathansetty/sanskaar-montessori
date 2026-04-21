import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Phone, MapPin } from 'lucide-react';
import CloudinaryImage from '../components/CloudinaryImage';
import SkeletonBox from '../components/SkeletonBox';
import { useCategoryImages } from '../hooks/useCategoryImages';
import type { SlotImage } from '../hooks/useSlotImages';
import { GALLERY_CATEGORIES, SITE } from '../content/site-content';

const SKELETON_COUNT = 3;

const Gallery: React.FC = () => {
  const { state } = useCategoryImages('gallery');

  const sections = GALLERY_CATEGORIES.map((cat) => {
    const images: SlotImage[] =
      state.status === 'success' ? state.slots[cat.id] ?? [] : [];
    return { slotId: cat.id, title: cat.label, description: cat.description, images };
  });

  const allImages = useMemo(
    () =>
      sections.flatMap((s) =>
        s.images.map((img) => ({ ...img, sectionTitle: s.title }))
      ),
    [sections]
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null || allImages.length === 0
          ? null
          : (i + 1) % allImages.length
      ),
    [allImages.length]
  );
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null || allImages.length === 0
          ? null
          : (i - 1 + allImages.length) % allImages.length
      ),
    [allImages.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, next, prev]);

  useEffect(() => {
    const rows = Array.from(
      document.querySelectorAll<HTMLDivElement>('.gallery-row')
    );
    const cleanups: Array<() => void> = [];

    rows.forEach((row) => {
      // Desktop: convert vertical wheel scroll to horizontal
      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        row.scrollLeft += e.deltaY;
      };
      row.addEventListener('wheel', onWheel, { passive: false });

      // Mobile: pull-bounce at edges
      let lastTouchX = 0;
      let pulled = 0;

      const reset = () => {
        if (pulled === 0) return;
        row.style.transition =
          'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.05)';
        row.style.transform = 'translateX(0)';
        pulled = 0;
      };

      const onTouchStart = (e: TouchEvent) => {
        lastTouchX = e.touches[0].clientX;
        pulled = 0;
        row.style.transition = 'none';
      };

      const onTouchMove = (e: TouchEvent) => {
        const x = e.touches[0].clientX;
        const dx = x - lastTouchX;
        lastTouchX = x;
        const max = row.scrollWidth - row.clientWidth;
        const atStart = row.scrollLeft <= 0;
        const atEnd = row.scrollLeft >= max - 1;
        const enteringPull = (atStart && dx > 0) || (atEnd && dx < 0);
        if (enteringPull || pulled !== 0) {
          pulled += dx / 3;
          if (atStart && pulled < 0) pulled = 0;
          if (atEnd && pulled > 0) pulled = 0;
          row.style.transform = `translateX(${pulled}px)`;
          if (pulled !== 0) e.preventDefault();
        }
      };

      row.addEventListener('touchstart', onTouchStart, { passive: true });
      row.addEventListener('touchmove', onTouchMove, { passive: false });
      row.addEventListener('touchend', reset);
      row.addEventListener('touchcancel', reset);

      cleanups.push(() => {
        row.removeEventListener('wheel', onWheel);
        row.removeEventListener('touchstart', onTouchStart);
        row.removeEventListener('touchmove', onTouchMove);
        row.removeEventListener('touchend', reset);
        row.removeEventListener('touchcancel', reset);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, [allImages.length]);

  const openByPublicId = (publicId: string) => {
    const idx = allImages.findIndex((p) => p.public_id === publicId);
    if (idx >= 0) setActiveIndex(idx);
  };

  return (
    <>
      <div className="page-header">
        <h1>{SITE.pages.gallery.header.title}</h1>
        <p>{SITE.pages.gallery.header.subtitle}</p>
      </div>

      {state.status === 'error' && (
        <section className="section">
          <div className="gallery-empty">Could not load gallery: {state.error}</div>
        </section>
      )}

      <section className="section gallery-categories">
        {sections.map((cat) => (
          <div key={cat.slotId} className="gallery-category">
            <div className="gallery-category-header">
              <h2>{cat.title}</h2>
              <p>{cat.description}</p>
            </div>

            {state.status === 'loading' && (
              <div className="gallery-row-wrap">
                <div className={`gallery-row gallery-row-${SKELETON_COUNT}`}>
                  {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <div key={i} className="gallery-item">
                      <SkeletonBox aspectRatio="4 / 3" borderRadius={8} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.status === 'success' && cat.images.length === 0 && (
              <div className="gallery-empty">No photos yet.</div>
            )}

            {state.status === 'success' && cat.images.length > 0 && (
              <div className="gallery-row-wrap">
                <div className={`gallery-row gallery-row-${cat.images.length}`}>
                  {cat.images.map((img) => (
                    <button
                      key={img.public_id}
                      className="gallery-item"
                      onClick={() => openByPublicId(img.public_id)}
                      aria-label={`Open ${cat.title} photo`}
                    >
                      <CloudinaryImage
                        publicId={img.public_id}
                        alt={cat.title}
                        width={800}
                        aspectRatio={img.width && img.height ? img.width / img.height : undefined}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {activeIndex !== null && allImages[activeIndex] && (
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={close} aria-label="Close">
            <X size={28} />
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>
          <img
            src={allImages[activeIndex].secure_url}
            alt={allImages[activeIndex].sectionTitle}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}

      <div className="cta-banner">
        <h2>{SITE.pages.gallery.ctaBanner.title}</h2>
        <p>{SITE.pages.gallery.ctaBanner.subtitle}</p>
        <div className="cta-banner-actions">
          <a href={`tel:${SITE.contact.primaryPhone}`} className="btn-cta">
            <Phone size={18} /> {SITE.contact.phones.find(p => p.tel === SITE.contact.primaryPhone)?.display ?? SITE.contact.primaryPhone}
          </a>
          <a
            href={SITE.contact.maps.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta btn-cta-outline"
          >
            <MapPin size={18} /> Get Directions
          </a>
        </div>
      </div>
    </>
  );
};

export default Gallery;
