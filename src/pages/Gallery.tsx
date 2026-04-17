import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Phone, MapPin } from 'lucide-react';

type Photo = { src: string; alt: string };
type Category = { title: string; description: string; photos: Photo[] };

const categories: Category[] = [
  {
    title: 'The Prepared Environment',
    description: 'Thoughtfully arranged Montessori classrooms',
    photos: [
      { src: '/gallery/classroom-01.jpg', alt: 'Sensorial shelf with knobbed cylinders' },
      { src: '/gallery/classroom-02.jpg', alt: 'Practical Life shelf with steel tableware' },
      { src: '/gallery/classroom-03.jpg', alt: 'Botany and zoology puzzles with globes' },
    ],
  },
  {
    title: 'Practical Life',
    description: 'Everyday skills that build independence',
    photos: [
      { src: '/gallery/practical-life-01.jpg', alt: 'Child pouring at a Montessori low table' },
      { src: '/gallery/practical-life-02.jpg', alt: 'Practical Life shelf with lock boards' },
    ],
  },
  {
    title: 'Language',
    description: 'Building words and confidence in Kannada and English',
    photos: [
      { src: '/gallery/language-kannada-02.jpg', alt: 'Building words with the Kannada movable alphabet' },
      { src: '/gallery/language-english-02.jpg', alt: 'Composing words with letter tiles' },
    ],
  },
  {
    title: 'Mathematics',
    description: 'Concrete-to-abstract number work',
    photos: [
      { src: '/gallery/mathematics-01.jpg', alt: 'Red and blue number rods' },
      { src: '/gallery/mathematics-02.jpg', alt: 'Spindle box work' },
      { src: '/gallery/mathematics-03.jpg', alt: 'Counting with colour-coded cubes' },
    ],
  },
  {
    title: 'Cultural Studies',
    description: 'Geography, biology and a sense of the world',
    photos: [
      { src: '/gallery/geography-01.jpg', alt: 'Exploring the globe' },
      { src: '/gallery/geography-02.jpg', alt: 'Friends learning geography together' },
    ],
  },
  {
    title: 'Art & Creative Expression',
    description: 'Printing, colouring and open-ended making',
    photos: [
      { src: '/gallery/art-craft-01.jpg', alt: 'Stamping and printing at the craft table' },
      { src: '/gallery/art-craft-02.jpg', alt: 'Creative work with crayons' },
    ],
  },
  {
    title: 'Story Time & Reading',
    description: 'Building a lifelong love for books',
    photos: [
      { src: '/gallery/story-time-01.jpg', alt: 'Teacher reading aloud to the class' },
      { src: '/gallery/story-time-02.jpg', alt: 'Children reading in a circle' },
      { src: '/gallery/story-time-03.jpg', alt: 'Quiet reading by the library shelves' },
    ],
  },
  {
    title: 'Summer Camp — Gardening',
    description: 'Little hands, growing things',
    photos: [
      { src: '/gallery/gardening-01.jpg', alt: 'Observing young plants in the garden' },
      { src: '/gallery/gardening-02.jpg', alt: 'Digging and sowing seeds' },
      { src: '/gallery/gardening-03.jpg', alt: 'Planting a rose together' },
    ],
  },
];

const Gallery: React.FC = () => {
  const allPhotos = useMemo(
    () => categories.flatMap((c) => c.photos),
    []
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % allPhotos.length)),
    [allPhotos.length]
  );
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length
      ),
    [allPhotos.length]
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
        const enteringPull =
          (atStart && dx > 0) || (atEnd && dx < 0);
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
        row.removeEventListener('touchstart', onTouchStart);
        row.removeEventListener('touchmove', onTouchMove);
        row.removeEventListener('touchend', reset);
        row.removeEventListener('touchcancel', reset);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  const openPhoto = (photo: Photo) => {
    const idx = allPhotos.findIndex((p) => p.src === photo.src);
    if (idx >= 0) setActiveIndex(idx);
  };

  return (
    <>
      <div className="page-header">
        <h1>Gallery</h1>
        <p>Moments from life at Sanskaar Montessori</p>
      </div>

      <section className="section gallery-categories">
        {categories.map((cat) => (
          <div key={cat.title} className="gallery-category">
            <div className="gallery-category-header">
              <h2>{cat.title}</h2>
              <p>{cat.description}</p>
            </div>
            <div
              className={`gallery-row gallery-row-${cat.photos.length}`}
            >
              {cat.photos.map((photo) => (
                <button
                  key={photo.src}
                  className="gallery-item"
                  onClick={() => openPhoto(photo)}
                  aria-label={`Open ${photo.alt}`}
                >
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

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
            src={allPhotos[activeIndex].src}
            alt={allPhotos[activeIndex].alt}
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

      <div className="cta-banner">
        <h2>Want to Visit Us?</h2>
        <p>Come experience Sanskaar Montessori in person.</p>
        <div className="cta-banner-actions">
          <a href="tel:+919113805407" className="btn-cta">
            <Phone size={18} /> +91 91138 05407
          </a>
          <a
            href="https://share.google/QyuzA210g7jqGHGS4"
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
