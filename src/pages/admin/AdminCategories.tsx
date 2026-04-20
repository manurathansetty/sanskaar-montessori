import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { slugify } from '../../lib/slugify';
import { GALLERY_CATEGORIES } from '../../content/site-content';
import type { GalleryCategory } from '../../content/site-content';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

type Counts = Record<string, number>;

const AdminCategories: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cats, setCats] = useState<GalleryCategory[] | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [addLabel, setAddLabel] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    fetch('/api/content/gallery-categories', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() as Promise<GalleryCategory[]> : Promise.reject())
      .then((json) => setCats((json as GalleryCategory[]).sort((a, b) => a.order - b.order)))
      .catch(() => setCats([...GALLERY_CATEGORIES].sort((a, b) => a.order - b.order)));
  }, [state.status]);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    fetch('/api/images/category?category=gallery', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data: { slots: Record<string, unknown[]> }) => {
        const c: Counts = {};
        for (const [id, imgs] of Object.entries(data.slots ?? {})) c[id] = imgs.length;
        setCounts(c);
        setUncategorizedCount(c['uncategorized'] ?? 0);
      })
      .catch(() => {});
  }, [state.status]);

  if (state.status !== 'authenticated' || !cats) {
    return <AdminLoadingScreen />;
  }

  const saveCats = async (list: GalleryCategory[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/save/gallery-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(list),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (res.ok) toast.success('Saved.');
      else toast.error(saveErrorMessage(json.error ?? ''));
    } catch {
      toast.error(saveErrorMessage(''));
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (i: number) => { dragIndex.current = i; };
  const handleDrop = (i: number) => {
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const next = [...cats];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    const reordered = next.map((c, idx) => ({ ...c, order: idx + 1 }));
    setCats(reordered);
    saveCats(reordered);
    dragIndex.current = null;
  };

  const startEdit = (c: GalleryCategory) => { setEditingId(c.id); setEditLabel(c.label); setEditDesc(c.description); };
  const commitEdit = async () => {
    if (!editingId) return;
    const next = cats.map((c) => c.id === editingId ? { ...c, label: editLabel, description: editDesc } : c);
    setCats(next);
    setEditingId(null);
    await saveCats(next);
  };

  const deleteCategory = async (id: string, label: string, count: number) => {
    const msg = count > 0
      ? `${count} photo(s) will move to Uncategorized. Delete "${label}"?`
      : `Delete category "${label}"?`;
    if (!window.confirm(msg)) return;
    setDeleting(id);
    try {
      const res = await fetch('/api/categories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id }),
      });
      const json = await res.json() as { ok?: boolean; moved?: number; error?: string };
      if (res.ok) {
        setCats((prev) => prev ? prev.filter((c) => c.id !== id) : prev);
        if (json.moved) setUncategorizedCount((n) => n + (json.moved ?? 0));
        toast.success(`Deleted. ${json.moved ?? 0} photo(s) moved to Uncategorized.`);
      } else {
        toast.error(saveErrorMessage(json.error ?? ''));
      }
    } catch {
      toast.error(saveErrorMessage(''));
    } finally {
      setDeleting(null);
    }
  };

  const addCategory = async () => {
    const label = addLabel.trim();
    if (!label) return;
    const id = slugify(label);
    if (cats.find((c) => c.id === id) || id === 'uncategorized') {
      toast.error('A category with that name already exists.');
      return;
    }
    const newCat: GalleryCategory = { id, label, description: addDesc.trim(), order: cats.length + 1 };
    const next = [...cats, newCat];
    setCats(next);
    setAddLabel('');
    setAddDesc('');
    setAdding(false);
    await saveCats(next);
  };

  const addBtn = (
    <button className="adm-btn-primary" onClick={() => setAdding(true)}>
      <Plus size={14} /> Add Category
    </button>
  );

  return (
    <AdminPageShell backHref="/admin/images/gallery" backLabel="Gallery slots" rightAction={addBtn} maxWidth={680}>
      <style>{`
        .adm-cat-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.25rem;
          background: #fffdf8;
          border: 1.5px solid #e8e2d6;
          border-radius: 14px;
          cursor: grab;
          transition: box-shadow 0.18s, transform 0.18s;
          animation: admFadeUp 0.35s ease both;
        }
        .adm-cat-row:hover { box-shadow: 0 4px 16px rgba(29,40,29,0.09); }
      `}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>Gallery Categories</h1>
        <p style={s.sub}>Drag to reorder · click to edit</p>
      </div>

      {adding && (
        <div style={s.addCard}>
          <div style={s.addTitle}>New Category</div>
          <input className="adm-input" placeholder="Category name" value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }} />
          <input className="adm-input" placeholder="Description (optional)" value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)} />
          {addLabel && <div style={s.slugPreview}>ID: <code>{slugify(addLabel)}</code></div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="adm-btn-primary" onClick={addCategory} disabled={saving}>Add</button>
            <button className="adm-btn-secondary" onClick={() => { setAdding(false); setAddLabel(''); setAddDesc(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.list}>
        {cats.map((cat, i) => (
          <div
            key={cat.id}
            className="adm-cat-row"
            style={{ animationDelay: `${i * 0.04}s` }}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <GripVertical size={17} style={{ color: '#c8c0b4', flexShrink: 0 }} />

            {editingId === cat.id ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input className="adm-input" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
                <input className="adm-input" value={editDesc} placeholder="Description"
                  onChange={(e) => setEditDesc(e.target.value)} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-btn-primary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={commitEdit} disabled={saving}>
                    <Check size={13} /> Save
                  </button>
                  <button className="adm-btn-secondary" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => setEditingId(null)}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.catLabel}>{cat.label}</div>
                {cat.description && <div style={s.catDesc}>{cat.description}</div>}
                <div style={s.photoCount}>{counts[cat.id] ?? 0} photo{(counts[cat.id] ?? 0) !== 1 ? 's' : ''}</div>
              </div>
            )}

            {editingId !== cat.id && (
              <div style={s.actions}>
                <button className="adm-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => startEdit(cat)}>
                  <Pencil size={12} /> Edit
                </button>
                <button className="adm-btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}
                  disabled={!!deleting}
                  onClick={() => deleteCategory(cat.id, cat.label, counts[cat.id] ?? 0)}>
                  {deleting === cat.id ? '…' : <><Trash2 size={12} /></>}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Uncategorized — read-only */}
        <div style={s.uncatRow}>
          <div style={{ width: 17, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={s.catLabel}>Uncategorized</div>
            <div style={s.catDesc}>Orphaned photos from deleted categories</div>
            <div style={s.photoCount}>{uncategorizedCount} photo{uncategorizedCount !== 1 ? 's' : ''}</div>
          </div>
          <Link to="/admin/images/gallery/uncategorized" className="adm-btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            View
          </Link>
        </div>
      </div>
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:     { padding: '4rem', textAlign: 'center', color: '#9a9288' },
  heading:     { marginBottom: '1.75rem' },
  h1:          { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:         { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  addCard:     { background: '#fffdf8', border: '1.5px solid #e8e2d6', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 10 },
  addTitle:    { fontSize: 13, fontWeight: 700, color: '#5a6e5a', textTransform: 'uppercase', letterSpacing: '0.06em' },
  slugPreview: { fontSize: 12, color: '#9a9288' },
  list:        { display: 'flex', flexDirection: 'column', gap: 8 },
  catLabel:    { fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  catDesc:     { fontSize: 13, color: '#9a9288', fontWeight: 500 },
  photoCount:  { fontSize: 12, color: '#c0b8ae', marginTop: 3, fontWeight: 600 },
  actions:     { display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' },
  uncatRow:    { display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', background: '#f8f5ef', border: '1.5px dashed #e2ddd4', borderRadius: 14, opacity: 0.85 },
};

export default AdminCategories;
