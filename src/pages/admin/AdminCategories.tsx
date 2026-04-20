import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { slugify } from '../../lib/slugify';
import { GALLERY_CATEGORIES } from '../../content/site-content';
import type { GalleryCategory } from '../../content/site-content';

type Counts = Record<string, number>;

const AdminCategories: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cats, setCats] = useState<GalleryCategory[]>(() =>
    [...GALLERY_CATEGORIES].sort((a, b) => a.order - b.order)
  );
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
    // Fetch photo counts
    fetch('/api/images/category?category=gallery', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data: { slots: Record<string, unknown[]> }) => {
        const c: Counts = {};
        for (const [id, imgs] of Object.entries(data.slots ?? {})) {
          c[id] = imgs.length;
        }
        setCounts(c);
        setUncategorizedCount(c['uncategorized'] ?? 0);
      })
      .catch(() => {});
  }, [state]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
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

  const startEdit = (c: GalleryCategory) => {
    setEditingId(c.id);
    setEditLabel(c.label);
    setEditDesc(c.description);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const next = cats.map((c) =>
      c.id === editingId ? { ...c, label: editLabel, description: editDesc } : c
    );
    setCats(next);
    setEditingId(null);
    await saveCats(next);
  };

  const deleteCategory = async (id: string, label: string, count: number) => {
    const msg = count > 0
      ? `${count} photo(s) will move to Uncategorized. This cannot be undone. Delete "${label}"?`
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
        setCats((prev) => prev.filter((c) => c.id !== id));
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

  return (
    <div style={s.wrapper}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Gallery Categories</h1>
          <Link to="/admin/images/gallery" style={s.back}>← Gallery slots</Link>
        </div>
        <button style={s.addBtn} onClick={() => setAdding(true)}>+ Add Category</button>
      </header>

      {adding && (
        <div style={s.addForm}>
          <input style={s.input} placeholder="Category name" value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }} />
          <input style={s.input} placeholder="Description (optional)" value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.saveBtn} onClick={addCategory} disabled={saving}>Add</button>
            <button style={s.cancelBtn} onClick={() => { setAdding(false); setAddLabel(''); setAddDesc(''); }}>Cancel</button>
          </div>
          {addLabel && <div style={s.slugPreview}>ID: {slugify(addLabel)}</div>}
        </div>
      )}

      <div style={s.list}>
        {cats.map((cat, i) => (
          <div
            key={cat.id}
            style={s.card}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <span style={s.handle}>⠿</span>
            {editingId === cat.id ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input style={s.input} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
                <input style={s.input} value={editDesc} placeholder="Description" onChange={(e) => setEditDesc(e.target.value)} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.saveBtn} onClick={commitEdit} disabled={saving}>Save</button>
                  <button style={s.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={s.cardTitle}>{cat.label}</div>
                {cat.description && <div style={s.cardDesc}>{cat.description}</div>}
                <div style={s.photoCount}>{counts[cat.id] ?? 0} photo(s)</div>
              </div>
            )}
            {editingId !== cat.id && (
              <div style={s.cardActions}>
                <button style={s.editBtn} onClick={() => startEdit(cat)}>Edit</button>
                <button
                  style={s.deleteBtn}
                  disabled={!!deleting}
                  onClick={() => deleteCategory(cat.id, cat.label, counts[cat.id] ?? 0)}
                >
                  {deleting === cat.id ? '…' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Uncategorized — read-only */}
        <div style={{ ...s.card, background: '#f9f9f9', opacity: 0.8 }}>
          <span style={s.handle} />
          <div style={{ flex: 1 }}>
            <div style={s.cardTitle}>Uncategorized</div>
            <div style={s.cardDesc}>Orphaned photos from deleted categories</div>
            <div style={s.photoCount}>{uncategorizedCount} photo(s)</div>
          </div>
          <Link to="/admin/images/gallery/uncategorized" style={s.editBtn}>View</Link>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrapper:      { maxWidth: 720, margin: '2rem auto', padding: '0 1rem 4rem' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:        { margin: 0 },
  back:         { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  addBtn:       { padding: '10px 18px', background: '#3a6a3a', color: '#fff', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  addForm:      { background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10, padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 8 },
  input:        { padding: '8px 10px', fontSize: 14, border: '1px solid #ddd', borderRadius: 6, outline: 'none' },
  slugPreview:  { fontSize: 12, color: '#888' },
  list:         { display: 'flex', flexDirection: 'column', gap: 8 },
  card:         { display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10, cursor: 'grab' },
  handle:       { fontSize: 20, color: '#aaa', userSelect: 'none', flexShrink: 0 },
  cardTitle:    { fontWeight: 600, fontSize: 15 },
  cardDesc:     { fontSize: 13, color: '#666', marginTop: 2 },
  photoCount:   { fontSize: 12, color: '#999', marginTop: 4 },
  cardActions:  { display: 'flex', gap: 8, flexShrink: 0 },
  editBtn:      { padding: '6px 14px', fontSize: 13, color: '#3a6a3a', border: '1px solid #3a6a3a', borderRadius: 6, background: 'none', cursor: 'pointer', textDecoration: 'none' },
  deleteBtn:    { padding: '6px 14px', fontSize: 13, color: '#c00', border: '1px solid #f5c6cb', borderRadius: 6, background: 'none', cursor: 'pointer' },
  saveBtn:      { padding: '8px 18px', background: '#3a6a3a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  cancelBtn:    { padding: '8px 12px', background: 'none', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
};

export default AdminCategories;
