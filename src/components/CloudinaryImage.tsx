import React from 'react';

const CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? '';
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const WIDTHS = [400, 800, 1200, 1600];

type Props = {
  publicId: string;
  alt: string;
  width?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fit?: 'fill' | 'fit';
};

function buildUrl(publicId: string, w: number, fit: 'fill' | 'fit'): string {
  const c = fit === 'fill' ? 'c_fill' : 'c_fit';
  return `${BASE}/${c},w_${w},q_auto,f_auto/${publicId}`;
}

const CloudinaryImage: React.FC<Props> = ({
  publicId,
  alt,
  width = 800,
  className,
  loading = 'lazy',
  fit = 'fill',
}) => {
  if (!CLOUD) {
    return (
      <div className={className} style={{ background: '#eee', padding: '1rem' }}>
        Cloudinary cloud name not configured.
      </div>
    );
  }
  const srcSet = WIDTHS.map((w) => `${buildUrl(publicId, w, fit)} ${w}w`).join(', ');
  return (
    <img
      src={buildUrl(publicId, width, fit)}
      srcSet={srcSet}
      sizes={`(max-width: 768px) 100vw, ${width}px`}
      alt={alt}
      loading={loading}
      className={className}
    />
  );
};

export default CloudinaryImage;
