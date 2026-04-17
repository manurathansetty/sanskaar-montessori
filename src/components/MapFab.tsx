import React, { useEffect, useState } from 'react';
import { MapPin, X, ExternalLink } from 'lucide-react';

const SHARE_URL = 'https://share.google/QyuzA210g7jqGHGS4';
// Replace with the iframe src from Google Maps → Share → "Embed a map"
const EMBED_SRC =
  'https://maps.google.com/maps?q=Sanskaar+Montessori&output=embed';

const MapFab: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        className="map-fab"
        onClick={() => setOpen(true)}
        aria-label="Find us on the map"
      >
        <MapPin size={24} />
        <span className="map-fab-label">Find Us</span>
      </button>

      {open && (
        <div
          className="map-modal"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Sanskaar Montessori location"
        >
          <div className="map-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <h3>Visit Sanskaar Montessori</h3>
              <button
                className="map-modal-close"
                onClick={() => setOpen(false)}
                aria-label="Close map"
              >
                <X size={22} />
              </button>
            </div>
            <iframe
              src={EMBED_SRC}
              title="Sanskaar Montessori location"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="map-modal-footer">
              <a
                href={SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link"
              >
                Open in Google Maps <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapFab;
