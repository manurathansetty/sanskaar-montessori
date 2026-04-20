import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, X, Save } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { slugify } from '../../lib/slugify';
import { EVENTS } from '../../content/site-content';
import type { EventConfig, EventPill, EventType } from '../../content/site-content';
import CloudinaryImage from '../../components/CloudinaryImage';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

const TYPES: EventType[] = ['featured', 'programme', 'admissions'];
const TYPE_LABELS: Record<EventType, string> = {
  featured: 'Featured', programme: 'Programme', admissions: 'Admissions',
};

const AdminEventEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new' || !id;
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [allEvents, setAllEvents] = useState<EventConfig[] | null>(null);
  const [form, setForm] = useState<EventConfig | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    fetch('/api/content/events', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() as Promise<EventConfig[]> : Promise.reject())
      .then((json) => {
        const sorted = (json as EventConfig[]).sort((a, b) => a.order - b.order);
        setAllEvents(sorted);
        const existing = isNew ? null : sorted.find((e) => e.id === id) ?? null;
        setForm(existing
          ? JSON.parse(JSON.stringify(existing))
          : { id: '', type: 'programme', eyebrow: '', title: '', lede: '', imageSlot: '', pills: [], tags: [], order: sorted.length + 1 }
        );
      })
      .catch(() => {
        setAllEvents([...EVENTS]);
        const existing = isNew ? null : EVENTS.find((e) => e.id === id) ?? null;
        setForm(existing
          ? JSON.parse(JSON.stringify(existing))
          : { id: '', type: 'programme', eyebrow: '', title: '', lede: '', imageSlot: '', pills: [], tags: [], order: EVENTS.length + 1 }
        );
      });
  }, [state.status, id, isNew]);

  if (state.status !== 'authenticated' || !allEvents || !form) {
    return <AdminLoadingScreen />;
  }

  const set = (updater: (f: EventConfig) => void) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as EventConfig;
      updater(next);
      return next;
    });
  };

  const onTitleChange = (val: string) => {
    set((f) => {
      f.title = val;
      if (isNew) {
        const slug = slugify(val);
        f.id = slug;
        if (!f.imageSlot || f.imageSlot === slugify(form.title)) f.imageSlot = slug;
      }
    });
  };

  const addPill = () => set((f) => f.pills.push({ label: '', value: '', icon: 'Tag' }));
  const removePill = (i: number) => set((f) => f.pills.splice(i, 1));
  const setPill = (i: number, key: keyof EventPill, val: string) =>
    set((f) => { (f.pills[i] as Record<string, string>)[key] = val; });

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    set((f) => f.tags.push(t));
    setTagInput('');
  };
  const removeTag = (t: string) => set((f) => { f.tags = f.tags.filter((x) => x !== t); });

  const save = async () => {
    if (!form.title.trim() || !form.lede.trim()) { toast.error('Title and lede are required.'); return; }
    setSaving(true);
    try {
      const others = allEvents.filter((e) => e.id !== (isNew ? '' : id));
      const newSlot = { ...form, id: form.id || slugify(form.title), imageSlot: form.imageSlot || slugify(form.title) };
      const list = isNew
        ? [...others, newSlot].map((e, i) => ({ ...e, order: i + 1 }))
        : [...others.filter((e) => e.id !== id), newSlot].sort((a, b) => a.order - b.order);

      const res = await fetch('/api/save/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(list),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (res.ok) {
        toast.success('Saved.');
        if (isNew) navigate(`/admin/events/${newSlot.id}`);
      } else {
        toast.error(saveErrorMessage(json.error ?? ''));
      }
    } catch {
      toast.error(saveErrorMessage(''));
    } finally {
      setSaving(false);
    }
  };

  const saveBtn = (
    <button className="adm-btn-primary" onClick={save} disabled={saving}
      style={{ cursor: saving ? 'not-allowed' : 'pointer' }}>
      <Save size={14} /> {saving ? 'Saving…' : 'Save'}
    </button>
  );

  return (
    <AdminPageShell backHref="/admin/events" backLabel="Events" rightAction={saveBtn} maxWidth={640}>
      <div style={s.heading}>
        <h1 style={s.h1}>{isNew ? 'New Event' : 'Edit Event'}</h1>
      </div>

      <div style={s.card}>
        {/* Title */}
        <label className="adm-label">Title
          <input className="adm-input" value={form.title} onChange={(e) => onTitleChange(e.target.value)} />
        </label>

        {/* Eyebrow */}
        <label className="adm-label">
          Eyebrow <span style={s.hint}>— short identifier above heading</span>
          <input className="adm-input" value={form.eyebrow}
            onChange={(e) => set((f) => { f.eyebrow = e.target.value; })} />
        </label>

        {/* Type */}
        <label className="adm-label">Type
          <select className="adm-input" value={form.type}
            onChange={(e) => set((f) => { f.type = e.target.value as EventType; })}>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </label>

        {/* Lede */}
        <label className="adm-label">Lede
          <textarea className="adm-input" style={s.textarea} value={form.lede}
            onChange={(e) => set((f) => { f.lede = e.target.value; })} />
        </label>

        {/* Image slot */}
        <div className="adm-label">
          <span>Image Slot</span>
          <div style={s.slotCode}>{form.imageSlot || <span style={{ color: '#9a9288' }}>auto-derived from title</span>}</div>
          {form.imageSlot && (
            <div style={{ marginTop: 10 }}>
              <div style={s.imgPreview}>
                <CloudinaryImage publicId={`sanskaar/events/${form.imageSlot}`} alt={form.eyebrow} width={480} />
              </div>
              <a href={`/admin/images/events/${form.imageSlot}`} target="_blank" rel="noopener noreferrer"
                style={s.imgLink}>Replace via image admin ↗</a>
            </div>
          )}
        </div>

        {/* Pills */}
        <div className="adm-label">
          <span>Pills</span>
          {form.pills.map((pill, i) => (
            <div key={i} style={s.pillRow}>
              <input className="adm-input" style={{ flex: 1 }} placeholder="Label" value={pill.label}
                onChange={(e) => setPill(i, 'label', e.target.value)} />
              <input className="adm-input" style={{ flex: 2 }} placeholder="Value" value={pill.value}
                onChange={(e) => setPill(i, 'value', e.target.value)} />
              <button style={s.iconBtn} onClick={() => removePill(i)}><X size={14} /></button>
            </div>
          ))}
          <button className="adm-btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 6 }} onClick={addPill}>
            <Plus size={13} /> Add pill
          </button>
        </div>

        {/* Tags */}
        <div className="adm-label">
          <span>Tags</span>
          {form.tags.length > 0 && (
            <div style={s.chips}>
              {form.tags.map((tag) => (
                <span key={tag} style={s.chip}>
                  {tag}
                  <button style={s.chipX} onClick={() => removeTag(tag)}><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input className="adm-input" style={{ flex: 1 }} placeholder="Type a tag and press Enter"
              value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
            <button className="adm-btn-secondary" onClick={addTag}>Add</button>
          </div>
        </div>
      </div>

      <div style={s.footer}>
        <button className="adm-btn-primary" onClick={save} disabled={saving}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
        <Link to="/admin/events" style={s.cancelLink}>Cancel</Link>
      </div>
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:  { padding: '4rem', textAlign: 'center', color: '#9a9288' },
  heading:  { marginBottom: '1.5rem' },
  h1:       { margin: 0, fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  hint:     { fontWeight: 400, color: '#9a9288', fontSize: 10, textTransform: 'none', letterSpacing: 0 },
  card:     { background: '#fffdf8', border: '1.5px solid #e8e2d6', borderRadius: 14, padding: '1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 20 },
  textarea: { minHeight: 80, resize: 'vertical' as const },
  slotCode: { padding: '9px 12px', background: '#f5f0e8', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', color: '#5a4a3a', letterSpacing: '0.02em' },
  imgPreview: { maxWidth: 260, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e8e2d6' },
  imgLink:  { display: 'inline-block', marginTop: 6, fontSize: 13, color: '#1d4a1d', textDecoration: 'none' },
  pillRow:  { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' },
  iconBtn:  { width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2ddd4', background: '#faf7f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b3a1a', flexShrink: 0 },
  chips:    { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip:     { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#e8f0e8', borderRadius: 20, fontSize: 12, color: '#2e6b30', fontWeight: 600 },
  chipX:    { background: 'none', border: 'none', cursor: 'pointer', color: '#2e6b30', display: 'flex', alignItems: 'center', padding: 0 },
  footer:   { marginTop: '1.5rem', display: 'flex', gap: 12, alignItems: 'center' },
  cancelLink: { fontSize: 14, color: '#9a9288', textDecoration: 'none' },
};

export default AdminEventEdit;
