import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { slugify } from '../../lib/slugify';
import { EVENTS } from '../../content/site-content';
import type { EventConfig, EventPill, EventType } from '../../content/site-content';
import CloudinaryImage from '../../components/CloudinaryImage';

const TYPES: EventType[] = ['featured', 'programme', 'admissions'];
const TYPE_LABELS: Record<EventType, string> = {
  featured: 'Featured', programme: 'Programme', admissions: 'Admissions',
};

function blank(): EventConfig {
  return {
    id: '', type: 'programme', eyebrow: '', title: '', lede: '',
    imageSlot: '', pills: [], tags: [], order: EVENTS.length + 1,
  };
}

const AdminEventEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new' || !id;
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const existing = isNew ? null : EVENTS.find((e) => e.id === id) ?? null;
  const [form, setForm] = useState<EventConfig>(() =>
    existing ? JSON.parse(JSON.stringify(existing)) : blank()
  );
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
  }

  const set = (updater: (f: EventConfig) => void) => {
    setForm((prev) => {
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
    if (!form.title.trim() || !form.lede.trim()) {
      toast.error('Title and lede are required.');
      return;
    }
    setSaving(true);
    try {
      const others = EVENTS.filter((e) => e.id !== (isNew ? '' : id));
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

  return (
    <div style={s.wrapper}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>{isNew ? 'New Event' : 'Edit Event'}</h1>
          <Link to="/admin/events" style={s.back}>← Events</Link>
        </div>
      </header>

      <div style={s.form}>
        <label style={s.label}>Title
          <input style={s.input} value={form.title} onChange={(e) => onTitleChange(e.target.value)} />
        </label>

        <label style={s.label}>Eyebrow <span style={s.hint}>(short identifier shown above heading)</span>
          <input style={s.input} value={form.eyebrow} onChange={(e) => set((f) => { f.eyebrow = e.target.value; })} />
        </label>

        <label style={s.label}>Type
          <select style={s.input} value={form.type} onChange={(e) => set((f) => { f.type = e.target.value as EventType; })}>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </label>

        <label style={s.label}>Lede
          <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={form.lede}
            onChange={(e) => set((f) => { f.lede = e.target.value; })} />
        </label>

        <div style={s.label}>
          <span>Image slot: <code>{form.imageSlot || '(auto-derived from title)'}</code></span>
          {form.imageSlot && (
            <>
              <div style={{ marginTop: 8, maxWidth: 240 }}>
                <CloudinaryImage publicId={`sanskaar/events/${form.imageSlot}`} alt={form.eyebrow} width={480} />
              </div>
              <a
                href={`/admin/images/events/${form.imageSlot}`}
                target="_blank"
                rel="noopener noreferrer"
                style={s.link}
              >
                Replace via image admin ↗
              </a>
            </>
          )}
        </div>

        <div style={s.label}>
          <span>Pills</span>
          {form.pills.map((pill, i) => (
            <div key={i} style={s.pillRow}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Label" value={pill.label}
                onChange={(e) => setPill(i, 'label', e.target.value)} />
              <input style={{ ...s.input, flex: 2 }} placeholder="Value" value={pill.value}
                onChange={(e) => setPill(i, 'value', e.target.value)} />
              <button style={s.removeBtn} onClick={() => removePill(i)}>×</button>
            </div>
          ))}
          <button style={s.addBtn} onClick={addPill}>+ Add pill</button>
        </div>

        <div style={s.label}>
          <span>Tags</span>
          <div style={s.chips}>
            {form.tags.map((tag) => (
              <span key={tag} style={s.chip}>
                {tag}
                <button style={s.chipX} onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              style={{ ...s.input, flex: 1 }}
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            />
            <button style={s.addBtn} onClick={addTag}>Add</button>
          </div>
        </div>

        <div style={s.formFooter}>
          <button style={s.saveBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <Link to="/admin/events" style={s.cancelBtn}>Cancel</Link>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrapper:    { maxWidth: 680, margin: '2rem auto', padding: '0 1rem 4rem' },
  header:     { marginBottom: '2rem' },
  title:      { margin: 0 },
  back:       { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  form:       { background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 20 },
  label:      { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#333' },
  hint:       { fontWeight: 400, color: '#888', marginLeft: 4 },
  input:      { padding: '8px 10px', fontSize: 14, border: '1px solid #ddd', borderRadius: 6, outline: 'none', fontFamily: 'inherit' },
  link:       { fontSize: 13, color: '#3a6a3a', marginTop: 4 },
  pillRow:    { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' },
  removeBtn:  { fontSize: 18, background: 'none', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: '2px 8px', color: '#c00', flexShrink: 0 },
  addBtn:     { alignSelf: 'flex-start', fontSize: 13, color: '#3a6a3a', background: 'none', border: '1px dashed #3a6a3a', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' },
  chips:      { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip:       { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#e8f5e9', borderRadius: 20, fontSize: 13, color: '#2e7d32' },
  chipX:      { background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d32', fontSize: 14, lineHeight: 1 },
  formFooter: { display: 'flex', gap: 12, alignItems: 'center', paddingTop: 8 },
  saveBtn:    { padding: '10px 24px', background: '#3a6a3a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn:  { fontSize: 14, color: '#666', textDecoration: 'none' },
};

export default AdminEventEdit;
