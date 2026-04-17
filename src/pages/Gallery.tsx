import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Edit this list as you add photos to public/gallery/
const photos: { src: string; alt: string }[] = [
  { src: '/gallery/photo-01.jpg', alt: 'Children engaged in Montessori activity' },
  { src: '/gallery/photo-02.jpg', alt: 'Sanskaar Montessori classroom' },
  { src: '/gallery/photo-03.jpg', alt: 'Learning with Montessori materials' },
  { src: '/gallery/photo-04.jpg', alt: 'Outdoor play at Sanskaar' },
  { src: '/gallery/photo-05.jpg', alt: 'Art and creative expression' },
  { src: '/gallery/photo-06.jpg', alt: 'Storytime at Sanskaar Montessori' },
  { src: '/gallery/photo-07.jpg', alt: 'Sensory exploration activity' },
  { src: '/gallery/photo-08.jpg', alt: 'Children collaborating' },
  { src: '/gallery/photo-09.jpg', alt: 'Practical life skills' },
  { src: '/gallery/photo-10.jpg', alt: 'Cultural celebration' },
  { src: '/gallery/photo-11.jpg', alt: 'Exploring nature' },
  { src: '/gallery/photo-12.jpg', alt: 'Music and movement' },
  { src: '/gallery/photo-13.jpg', alt: 'Reading corner' },
  { src: '/gallery/photo-14.jpg', alt: 'Classroom environment' },
  { src: '/gallery/photo-15.jpg', alt: 'Hands-on learning' },
  { src: '/gallery/photo-16.jpg', alt: 'Festival celebration' },
  { src: '/gallery/photo-17.jpg', alt: 'Free-choice activity time' },
  { src: '/gallery/photo-18.jpg', alt: 'Snack time together' },
  { src: '/gallery/photo-19.jpg', alt: 'Group learning' },
  { src: '/gallery/photo-20.jpg', alt: 'Joyful moments at Sanskaar' },
];

const Gallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    []
  );
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null ? null : (i - 1 + photos.length) % photos.length
      ),
    []
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

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Gallery</h1>
        <p>Moments from life at Sanskaar Montessori</p>
      </div>

      {/* Gallery Grid */}
      <section className="section">
        <div className="gallery-grid">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              className="gallery-item"
              onClick={() => setActiveIndex(i)}
              aria-label={`Open ${photo.alt}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display =
                    'none';
                }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
          <button
            className="lightbox-close"
            onClick={close}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={32} />
          </button>
          <img
            src={photos[activeIndex].src}
            alt={photos[activeIndex].alt}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}

      {/* CTA */}
      <div className="cta-banner">
        <h2>Want to Visit Us?</h2>
        <p>Come experience Sanskaar Montessori in person.</p>
        <a href="tel:+919113805407" className="btn-cta">
          Call Us: +91 91138 05407
        </a>
      </div>
    </>
  );
};

export default Gallery;
