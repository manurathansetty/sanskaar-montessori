import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from '../../components/CloudinaryImage';
import { useSlotImages, type SlotImage } from '../../hooks/useSlotImages';
import type { Category, SlotDef } from '../../content/image-slots';

type Props = { category: Category; slot: SlotDef };

const AdminSlotCollection: React.FC<Props> = ({ category, slot }) => {
  const { state, refresh } = useSlotImages(category, slot.id);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploading(true);
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
        context?: string;
      };

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.api_key);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      if (sig.context) fd.append('context', sig.context);

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
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (publicId: string) => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ public_id: publicId }),
      });
      if (!res.ok) throw new Error('Delete failed');
      await refresh();
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = useCallback(
    async (targetId: string) => {
      if (!dragId || dragId === targetId || state.status !== 'success') return;
      const order = state.images.map((i) => i.public_id);
      const fromIdx = order.indexOf(dragId);
      const toIdx = order.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, dragId);
      const orderings = order.map((public_id, i) => ({ public_id, sort: i + 1 }));
      setDragId(null);
      try {
        const res = await fetch('/api/images/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ orderings }),
        });
        if (!res.ok) throw new Error('Reorder failed');
        await refresh();
      } catch (err) {
        window.alert((err as Error).message);
      }
    },
    [dragId, state, refresh]
  );

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>{slot.label}</h1>
        <Link to={`/admin/images/${category}`} style={styles.back}>
          ← Back to {category}
        </Link>
      </header>

      <div style={styles.controls}>
        <button
          style={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '⬆ Upload photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFilePick}
        />
        {uploadError && <span style={styles.error}>{uploadError}</span>}
      </div>

      {state.status === 'loading' && <div>Loading…</div>}
      {state.status === 'error' && <div style={styles.error}>{state.error}</div>}
      {state.status === 'success' && state.images.length === 0 && (
        <div style={styles.empty}>No photos yet. Upload to get started.</div>
      )}
      {state.status === 'success' && state.images.length > 0 && (
        <div style={styles.grid}>
          {state.images.map((img: SlotImage) => (
            <div
              key={img.public_id}
              style={styles.card}
              draggable
              onDragStart={() => onDragStart(img.public_id)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(img.public_id)}
            >
              <CloudinaryImage publicId={img.public_id} alt={slot.label} width={400} />
              <button style={styles.deleteBtn} onClick={() => onDelete(img.public_id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <p style={styles.hint}>Tip: drag a photo onto another to reorder.</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0 },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  controls: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  uploadBtn: {
    padding: '10px 16px',
    background: '#3a6a3a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  card: {
    position: 'relative',
    border: '1px solid #e6e6e6',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
    cursor: 'grab',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  empty: { padding: '2rem', textAlign: 'center', color: '#999', border: '1px dashed #ddd', borderRadius: 8 },
  error: { color: '#b00020', fontSize: 14 },
  hint: { fontSize: 13, color: '#999', marginTop: '1.5rem' },
};

export default AdminSlotCollection;
