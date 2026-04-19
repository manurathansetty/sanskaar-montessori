import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from '../../components/CloudinaryImage';
import { useSlotImages } from '../../hooks/useSlotImages';
import type { Category, SlotDef } from '../../content/image-slots';

type Props = { category: Category; slot: SlotDef };

const AdminSlotSingle: React.FC<Props> = ({ category, slot }) => {
  const { state, refresh } = useSlotImages(category, slot.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const sigRes = await fetch('/api/images/upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ category, slot: slot.id }),
      });
      if (!sigRes.ok) throw new Error('Could not get upload signature');
      const sig = (await sigRes.json()) as {
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
        public_id: string;
        overwrite: boolean;
      };

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.api_key);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      fd.append('public_id', sig.public_id);
      fd.append('overwrite', 'true');

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`,
        { method: 'POST', body: fd }
      );
      if (!upRes.ok) {
        const txt = await upRes.text();
        throw new Error(`Cloudinary upload failed: ${txt}`);
      }
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const current =
    state.status === 'success' && state.images.length > 0 ? state.images[0] : null;

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>{slot.label}</h1>
        <Link to={`/admin/images/${category}`} style={styles.back}>
          ← Back to {category}
        </Link>
      </header>

      {state.status === 'loading' && <div>Loading…</div>}
      {state.status === 'error' && <div style={styles.error}>{state.error}</div>}
      {state.status === 'success' && (
        <>
          <div style={styles.preview}>
            {current ? (
              <CloudinaryImage publicId={current.public_id} alt={slot.label} width={800} fit="fit" />
            ) : (
              <div style={styles.empty}>No image yet — upload to set this slot.</div>
            )}
          </div>
          <div style={styles.controls}>
            <button
              style={styles.replaceBtn}
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Uploading…' : current ? '⬆ Replace image' : '⬆ Upload image'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onFilePick}
            />
            {error && <span style={styles.error}>{error}</span>}
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0 },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  preview: {
    border: '1px solid #e6e6e6',
    borderRadius: 8,
    padding: '1rem',
    background: '#fff',
    minHeight: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  controls: { display: 'flex', alignItems: 'center', gap: '1rem' },
  replaceBtn: {
    padding: '10px 16px',
    background: '#3a6a3a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  empty: { color: '#999' },
  error: { color: '#b00020', fontSize: 14 },
};

export default AdminSlotSingle;
