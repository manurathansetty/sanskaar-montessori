import React, { useState, useCallback, useRef } from 'react';
import { Upload, Trash2, GripVertical, RefreshCw, Lock } from 'lucide-react';
import CloudinaryImage from '../../components/CloudinaryImage';
import { useSlotImages, type SlotImage } from '../../hooks/useSlotImages';
import type { Category, SlotDef } from '../../content/image-slots';
import AdminPageShell from '../../components/AdminPageShell';

const LOCKED_CATEGORIES = new Set<string>(['founders', 'home']);

type Props = { category: Category; slot: SlotDef };

const AdminSlotCollection: React.FC<Props> = ({ category, slot }) => {
  const { state, refresh } = useSlotImages(category, slot.id);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setUploadError(null);
    setUploadProgress({ done: 0, total: files.length });

    let errorMsg: string | null = null;
    for (let i = 0; i < files.length; i++) {
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
          cloud_name: string; folder: string; context?: string;
        };

        const fd = new FormData();
        fd.append('file', files[i]);
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
          throw new Error(`Upload failed (${files[i].name}): ${txt}`);
        }

        setUploadProgress({ done: i + 1, total: files.length });
      } catch (err) {
        errorMsg = (err as Error).message;
        break;
      }
    }

    setUploadProgress(null);
    if (errorMsg) setUploadError(errorMsg);
    await refresh();
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
  const onDragEnter = (id: string) => setDragOverId(id);
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverId(null);
  };
  const onDragEnd = () => { setDragId(null); setDragOverId(null); };

  const onDrop = useCallback(
    async (targetId: string) => {
      setDragOverId(null);
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

  const locked = LOCKED_CATEGORIES.has(category);
  const uploading = uploadProgress !== null;
  const uploadLabel = uploadProgress
    ? uploadProgress.total === 1
      ? 'Uploading…'
      : `Uploading ${uploadProgress.done + 1} / ${uploadProgress.total}…`
    : null;

  const uploadBtn = locked ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9a9288', fontWeight: 600 }}>
      <Lock size={13} /> Locked — contact developer
    </div>
  ) : (
    <button className="adm-btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}
      style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
      {uploading
        ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> {uploadLabel}</>
        : <><Upload size={14} /> Upload photos</>}
    </button>
  );

  return (
    <AdminPageShell
      backHref={`/admin/images/${category}`}
      backLabel={category[0].toUpperCase() + category.slice(1)}
      rightAction={uploadBtn}
      maxWidth={960}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .adm-photo-card {
          position: relative;
          border: 1.5px solid #e8e2d6;
          border-radius: 12px;
          overflow: hidden;
          background: #fffdf8;
          cursor: grab;
          transition: box-shadow 0.18s, transform 0.18s, border-color 0.15s, opacity 0.15s;
        }
        .adm-photo-card:hover { box-shadow: 0 6px 18px rgba(29,40,29,0.12); }
        .adm-photo-card.dragging { opacity: 0.4; transform: scale(0.96); }
        .adm-photo-card.drag-over { border-color: #4a7c59; box-shadow: 0 0 0 2px rgba(74,124,89,0.25); transform: scale(1.03); }
        .adm-del-btn {
          position: absolute; top: 8px; right: 8px;
          width: 30px; height: 30px; border-radius: 50%;
          border: none; background: rgba(0,0,0,0.55);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.15s;
        }
        .adm-photo-card:hover .adm-del-btn { opacity: 1; }
        .adm-drag-handle {
          position: absolute; top: 8px; left: 8px;
          background: rgba(0,0,0,0.45); border-radius: 6px; padding: 3px 4px;
          color: #fff; opacity: 0; transition: opacity 0.15s;
          display: flex; align-items: center;
          pointer-events: none;
        }
        .adm-photo-card:hover .adm-drag-handle { opacity: 1; }
      `}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>{slot.label}</h1>
        <p style={s.sub}>Drag to reorder · hover to delete</p>
      </div>

      {uploadError && <div style={s.errBox}>{uploadError}</div>}

      {state.status === 'loading' && <div style={s.loading}>Loading…</div>}
      {state.status === 'error' && <div style={s.errBox}>{state.error}</div>}

      {state.status === 'success' && state.images.length === 0 && (
        <div style={s.emptyBox}>
          <Upload size={28} style={{ color: '#c8c0b4', marginBottom: 8 }} />
          <div style={s.emptyText}>No photos yet</div>
          <div style={s.emptySub}>Click "Upload photos" to get started</div>
        </div>
      )}

      {state.status === 'success' && state.images.length > 0 && (
        <div style={s.grid}>
          {state.images.map((img: SlotImage) => (
            <div
              key={img.public_id}
              className={[
                'adm-photo-card',
                dragId === img.public_id ? 'dragging' : '',
                dragOverId === img.public_id && dragId !== img.public_id ? 'drag-over' : '',
              ].filter(Boolean).join(' ')}
              draggable={!locked}
              onDragStart={() => !locked && onDragStart(img.public_id)}
              onDragOver={onDragOver}
              onDragEnter={() => !locked && onDragEnter(img.public_id)}
              onDragLeave={onDragLeave}
              onDragEnd={onDragEnd}
              onDrop={() => !locked && onDrop(img.public_id)}
              style={locked ? { cursor: 'default' } : undefined}
            >
              <CloudinaryImage publicId={img.public_id} alt={slot.label} width={400} />
              {!locked && <div className="adm-drag-handle"><GripVertical size={14} /></div>}
              {!locked && (
                <button className="adm-del-btn" onClick={() => onDelete(img.public_id)}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!locked && (
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onFilePick} />
      )}
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:   { padding: '3rem', textAlign: 'center', color: '#9a9288' },
  heading:   { marginBottom: '1.75rem' },
  h1:        { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:       { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' },
  emptyBox:  {
    background: '#fffdf8', border: '2px dashed #e2ddd4', borderRadius: 14,
    minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  emptyText:  { fontSize: 15, fontWeight: 600, color: '#9a9288', marginBottom: 4 },
  emptySub:   { fontSize: 13, color: '#c0b8ae' },
  errBox:    {
    marginBottom: '1rem', padding: '10px 14px', background: '#fdf0e8',
    border: '1px solid #f0cdb8', borderRadius: 10, fontSize: 13, color: '#9b3a1a',
  },
};

export default AdminSlotCollection;
