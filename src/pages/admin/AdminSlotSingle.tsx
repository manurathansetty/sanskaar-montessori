import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, Lock } from 'lucide-react';
import CloudinaryImage from '../../components/CloudinaryImage';
import { useSlotImages } from '../../hooks/useSlotImages';
import type { Category, SlotDef } from '../../content/image-slots';
import AdminPageShell from '../../components/AdminPageShell';

const LOCKED_CATEGORIES = new Set<string>(['founders', 'home']);

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
        signature: string; timestamp: number; api_key: string;
        cloud_name: string; folder: string; public_id: string; overwrite: boolean;
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
        throw new Error(`Upload failed: ${txt}`);
      }
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const current = state.status === 'success' && state.images.length > 0 ? state.images[0] : null;
  const locked = LOCKED_CATEGORIES.has(category);

  const uploadBtn = locked ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9a9288', fontWeight: 600 }}>
      <Lock size={13} /> Locked — contact developer
    </div>
  ) : (
    <button className="adm-btn-primary" onClick={() => fileRef.current?.click()} disabled={busy}
      style={{ cursor: busy ? 'not-allowed' : 'pointer' }}>
      {busy ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</> : <><Upload size={14} /> {current ? 'Replace image' : 'Upload image'}</>}
    </button>
  );

  return (
    <AdminPageShell
      backHref={`/admin/images/${category}`}
      backLabel={category[0].toUpperCase() + category.slice(1)}
      rightAction={state.status === 'success' ? uploadBtn : undefined}
      maxWidth={680}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>{slot.label}</h1>
        <p style={s.sub}>Single image slot · replace to update</p>
      </div>

      {state.status === 'loading' && <div style={s.loading}>Loading…</div>}
      {state.status === 'error' && <div style={s.errBox}>{state.error}</div>}

      {state.status === 'success' && (
        <>
          <div style={current ? s.preview : s.emptyBox}>
            {current ? (
              <CloudinaryImage publicId={current.public_id} alt={slot.label} width={800} fit="fit" />
            ) : (
              <div style={s.emptyInner}>
                <Upload size={28} style={{ color: '#c8c0b4', marginBottom: 8 }} />
                <div style={s.emptyText}>No image yet</div>
                <div style={s.emptySub}>Upload a photo to fill this slot</div>
              </div>
            )}
          </div>

          {!current && !locked && (
            <div style={{ marginTop: '1.25rem' }}>
              <button className="adm-btn-primary" onClick={() => fileRef.current?.click()} disabled={busy}>
                <Upload size={14} /> Upload image
              </button>
            </div>
          )}

          {error && <div style={s.errBox}>{error}</div>}

          {!locked && <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFilePick} />}
        </>
      )}
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:   { padding: '3rem', textAlign: 'center', color: '#9a9288' },
  heading:   { marginBottom: '1.5rem' },
  h1:        { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:       { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  preview:   {
    background: '#fffdf8', border: '1.5px solid #e8e2d6', borderRadius: 14,
    overflow: 'hidden', minHeight: 200,
  },
  emptyBox:  {
    background: '#fffdf8', border: '2px dashed #e2ddd4', borderRadius: 14,
    minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyInner: { textAlign: 'center' },
  emptyText:  { fontSize: 15, fontWeight: 600, color: '#9a9288', marginBottom: 4 },
  emptySub:   { fontSize: 13, color: '#c0b8ae' },
  errBox:    {
    marginTop: '1rem', padding: '10px 14px', background: '#fdf0e8',
    border: '1px solid #f0cdb8', borderRadius: 10, fontSize: 13, color: '#9b3a1a',
  },
};

export default AdminSlotSingle;
