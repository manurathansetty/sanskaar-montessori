import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { SITE } from '../../content/site-content';
import type { SiteContent, PhoneEntry } from '../../content/site-content';

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

const PAGES = ['home', 'gallery', 'events', 'founders'] as const;
type PageKey = typeof PAGES[number];

const AdminSettings: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<SiteContent>(deepClone(SITE));
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<PageKey>>(new Set<PageKey>(['home']));

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
  }

  const set = (updater: (d: SiteContent) => void) => {
    setData((prev) => {
      const next = deepClone(prev);
      updater(next);
      return next;
    });
  };

  const togglePage = (key: PageKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addPhone = () =>
    set((d) => d.contact.phones.push({ tel: '', display: '', label: 'Mobile' }));

  const removePhone = (i: number) =>
    set((d) => {
      d.contact.phones.splice(i, 1);
      if (!d.contact.phones.find((p) => p.tel === d.contact.primaryPhone)) {
        d.contact.primaryPhone = d.contact.phones[0]?.tel ?? '';
      }
    });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/save/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (res.ok) {
        toast.success('Saved.');
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
          <h1 style={s.title}>Settings</h1>
          <Link to="/admin" style={s.back}>← Dashboard</Link>
        </div>
        <button style={s.saveBtn} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </header>

      {/* School */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>School</h2>
        <label style={s.label}>Name
          <input style={s.input} value={data.school.name}
            onChange={(e) => set((d) => { d.school.name = e.target.value; })} />
        </label>
        <label style={s.label}>Tagline
          <input style={s.input} value={data.school.tagline}
            onChange={(e) => set((d) => { d.school.tagline = e.target.value; })} />
        </label>
      </section>

      {/* Contact */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Contact</h2>
        <div style={s.subsectionTitle}>Phone Numbers</div>
        {data.contact.phones.map((p, i) => (
          <div key={i} style={s.phoneRow}>
            <label style={s.radioLabel}>
              <input type="radio" name="primaryPhone" checked={data.contact.primaryPhone === p.tel}
                onChange={() => set((d) => { d.contact.primaryPhone = p.tel; })} />
              Primary
            </label>
            <input style={{ ...s.input, flex: 1 }} placeholder="tel e.g. +919113805407" value={p.tel}
              onChange={(e) => set((d) => { (d.contact.phones[i] as PhoneEntry).tel = e.target.value; })} />
            <input style={{ ...s.input, flex: 1 }} placeholder="display e.g. +91 91138 05407" value={p.display}
              onChange={(e) => set((d) => { (d.contact.phones[i] as PhoneEntry).display = e.target.value; })} />
            <input style={{ ...s.input, width: 100 }} placeholder="label" value={p.label}
              onChange={(e) => set((d) => { (d.contact.phones[i] as PhoneEntry).label = e.target.value; })} />
            <button style={s.removeBtn} onClick={() => removePhone(i)} title="Remove">×</button>
          </div>
        ))}
        <button style={s.addBtn} onClick={addPhone}>+ Add phone</button>

        <label style={s.label}>Registration Form URL
          <input style={s.input} value={data.contact.registrationFormUrl}
            onChange={(e) => set((d) => { d.contact.registrationFormUrl = e.target.value; })} />
        </label>
        <label style={s.label}>Maps Share URL
          <input style={s.input} value={data.contact.maps.shareUrl}
            onChange={(e) => set((d) => { d.contact.maps.shareUrl = e.target.value; })} />
        </label>
        <label style={s.label}>Maps Embed Src
          <input style={s.input} value={data.contact.maps.embedSrc}
            onChange={(e) => set((d) => { d.contact.maps.embedSrc = e.target.value; })} />
        </label>
      </section>

      {/* Pages */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Pages</h2>
        {PAGES.map((key) => (
          <div key={key} style={s.pageBlock}>
            <button style={s.pageToggle} onClick={() => togglePage(key)}>
              {expanded.has(key) ? '▾' : '▸'} {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
            {expanded.has(key) && (
              <div style={s.pageFields}>
                {key === 'home' ? (
                  <>
                    <label style={s.label}>Hero Badge
                      <input style={s.input} value={data.pages.home.heroBadge}
                        onChange={(e) => set((d) => { d.pages.home.heroBadge = e.target.value; })} />
                    </label>
                    <label style={s.label}>Hero Description
                      <input style={s.input} value={data.pages.home.heroDescription}
                        onChange={(e) => set((d) => { d.pages.home.heroDescription = e.target.value; })} />
                    </label>
                  </>
                ) : (
                  <>
                    <label style={s.label}>Header Title
                      <input style={s.input} value={(data.pages[key] as { header: { title: string } }).header.title}
                        onChange={(e) => set((d) => { (d.pages[key] as { header: { title: string } }).header.title = e.target.value; })} />
                    </label>
                    <label style={s.label}>Header Subtitle
                      <input style={s.input} value={(data.pages[key] as { header: { subtitle: string } }).header.subtitle}
                        onChange={(e) => set((d) => { (d.pages[key] as { header: { subtitle: string } }).header.subtitle = e.target.value; })} />
                    </label>
                    <label style={s.label}>CTA Title
                      <input style={s.input} value={(data.pages[key] as { ctaBanner: { title: string } }).ctaBanner.title}
                        onChange={(e) => set((d) => { (d.pages[key] as { ctaBanner: { title: string } }).ctaBanner.title = e.target.value; })} />
                    </label>
                    <label style={s.label}>CTA Subtitle
                      <input style={s.input} value={(data.pages[key] as { ctaBanner: { subtitle: string } }).ctaBanner.subtitle}
                        onChange={(e) => set((d) => { (d.pages[key] as { ctaBanner: { subtitle: string } }).ctaBanner.subtitle = e.target.value; })} />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      <div style={{ height: 80 }} />
      <div style={s.stickyFooter}>
        <button style={s.saveBtn} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrapper:      { maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' },
  title:        { margin: 0 },
  back:         { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  saveBtn:      { padding: '10px 22px', background: '#3a6a3a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  section:      { background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' },
  sectionTitle: { margin: '0 0 1rem', fontSize: 16, fontWeight: 700 },
  subsectionTitle: { fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 8 },
  label:        { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#444', marginBottom: 12 },
  input:        { padding: '8px 10px', fontSize: 14, border: '1px solid #ddd', borderRadius: 6, outline: 'none' },
  phoneRow:     { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  radioLabel:   { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, whiteSpace: 'nowrap' },
  removeBtn:    { fontSize: 18, lineHeight: 1, background: 'none', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: '2px 8px', color: '#c00' },
  addBtn:       { fontSize: 13, color: '#3a6a3a', background: 'none', border: '1px dashed #3a6a3a', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', marginTop: 4, marginBottom: 16 },
  pageBlock:    { borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 },
  pageToggle:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '4px 0' },
  pageFields:   { paddingLeft: 16, paddingTop: 8 },
  stickyFooter: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e6e6e6', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end' },
};

export default AdminSettings;
