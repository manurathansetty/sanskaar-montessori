import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, X, Save } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { SITE } from '../../content/site-content';
import type { SiteContent, PhoneEntry } from '../../content/site-content';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

const PAGES = ['home', 'gallery', 'events', 'founders'] as const;
type PageKey = typeof PAGES[number];

const AdminSettings: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<PageKey>>(new Set<PageKey>(['home']));

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    fetch('/api/content/site', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() as Promise<SiteContent> : Promise.reject())
      .then((json) => setData(deepClone(json)))
      .catch(() => setData(deepClone(SITE)));
  }, [state.status]);

  if (state.status !== 'authenticated' || !data) {
    return <AdminLoadingScreen />;
  }

  const set = (updater: (d: SiteContent) => void) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = deepClone(prev);
      updater(next);
      return next;
    });
  };

  const togglePage = (key: PageKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const addPhone = () => set((d) => d.contact.phones.push({ tel: '', display: '', label: 'Mobile' }));
  const removePhone = (i: number) => set((d) => {
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
      if (res.ok) toast.success('Saved.');
      else toast.error(saveErrorMessage(json.error ?? ''));
    } catch {
      toast.error(saveErrorMessage(''));
    } finally {
      setSaving(false);
    }
  };

  const saveBtn = (
    <button className="adm-btn-primary" onClick={save} disabled={saving}
      style={{ cursor: saving ? 'not-allowed' : 'pointer' }}>
      <Save size={14} /> {saving ? 'Saving…' : 'Save All'}
    </button>
  );

  return (
    <AdminPageShell backHref="/admin" backLabel="Dashboard" rightAction={saveBtn} maxWidth={680}>
      <div style={s.heading}>
        <h1 style={s.h1}>Site Settings</h1>
        <p style={s.sub}>School info, contact details, and page text</p>
      </div>

      {/* School */}
      <section className="adm-section">
        <div style={s.sectionTitle}>School</div>
        <label className="adm-label" style={{ marginBottom: 14 }}>Name
          <input className="adm-input" value={data.school.name}
            onChange={(e) => set((d) => { d.school.name = e.target.value; })} />
        </label>
        <label className="adm-label">Tagline
          <input className="adm-input" value={data.school.tagline}
            onChange={(e) => set((d) => { d.school.tagline = e.target.value; })} />
        </label>
      </section>

      {/* Contact */}
      <section className="adm-section">
        <div style={s.sectionTitle}>Contact</div>
        <div style={s.subsection}>Phone Numbers</div>
        {data.contact.phones.map((p, i) => (
          <div key={i} style={s.phoneRow}>
            <label style={s.radioLabel}>
              <input type="radio" name="primaryPhone" checked={data.contact.primaryPhone === p.tel}
                onChange={() => set((d) => { d.contact.primaryPhone = p.tel; })} />
              <span style={s.radioText}>Primary</span>
            </label>
            <input className="adm-input" style={{ flex: 1 }} placeholder="+919113805407" value={p.tel}
              onChange={(e) => set((d) => { (d.contact.phones[i] as PhoneEntry).tel = e.target.value; })} />
            <input className="adm-input" style={{ flex: 1 }} placeholder="+91 91138 05407" value={p.display}
              onChange={(e) => set((d) => { (d.contact.phones[i] as PhoneEntry).display = e.target.value; })} />
            <select className="adm-input" style={{ width: 110 }} value={p.label}
              onChange={(e) => set((d) => { (d.contact.phones[i] as PhoneEntry).label = e.target.value; })}>
              <option value="Mobile">Mobile</option>
              <option value="Landline">Landline</option>
            </select>
            <button style={s.iconBtn} onClick={() => removePhone(i)} title="Remove"><X size={14} /></button>
          </div>
        ))}
        <button className="adm-btn-secondary" style={{ marginTop: 4, marginBottom: 18 }} onClick={addPhone}>
          <Plus size={13} /> Add phone
        </button>

        <label className="adm-label" style={{ marginBottom: 14 }}>Registration Form URL
          <input className="adm-input" value={data.contact.registrationFormUrl}
            onChange={(e) => set((d) => { d.contact.registrationFormUrl = e.target.value; })} />
        </label>
        <label className="adm-label" style={{ marginBottom: 14 }}>Maps Share URL
          <input className="adm-input" value={data.contact.maps.shareUrl}
            onChange={(e) => set((d) => { d.contact.maps.shareUrl = e.target.value; })} />
        </label>
        <label className="adm-label">Maps Embed Src
          <input className="adm-input" value={data.contact.maps.embedSrc}
            onChange={(e) => set((d) => { d.contact.maps.embedSrc = e.target.value; })} />
        </label>
      </section>

      {/* Pages */}
      <section className="adm-section">
        <div style={s.sectionTitle}>Pages</div>
        {PAGES.map((key) => (
          <div key={key} style={s.pageBlock}>
            <button style={s.pageToggle} onClick={() => togglePage(key)}>
              {expanded.has(key)
                ? <ChevronDown size={15} style={{ flexShrink: 0 }} />
                : <ChevronRight size={15} style={{ flexShrink: 0 }} />}
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
            {expanded.has(key) && (
              <div style={s.pageFields}>
                {key === 'home' ? (
                  <>
                    <label className="adm-label" style={{ marginBottom: 12 }}>Hero Badge
                      <input className="adm-input" value={data.pages.home.heroBadge}
                        onChange={(e) => set((d) => { d.pages.home.heroBadge = e.target.value; })} />
                    </label>
                    <label className="adm-label">Hero Description
                      <input className="adm-input" value={data.pages.home.heroDescription}
                        onChange={(e) => set((d) => { d.pages.home.heroDescription = e.target.value; })} />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="adm-label" style={{ marginBottom: 12 }}>Header Title
                      <input className="adm-input"
                        value={(data.pages[key] as { header: { title: string } }).header.title}
                        onChange={(e) => set((d) => { (d.pages[key] as { header: { title: string } }).header.title = e.target.value; })} />
                    </label>
                    <label className="adm-label" style={{ marginBottom: 12 }}>Header Subtitle
                      <input className="adm-input"
                        value={(data.pages[key] as { header: { subtitle: string } }).header.subtitle}
                        onChange={(e) => set((d) => { (d.pages[key] as { header: { subtitle: string } }).header.subtitle = e.target.value; })} />
                    </label>
                    <label className="adm-label" style={{ marginBottom: 12 }}>CTA Title
                      <input className="adm-input"
                        value={(data.pages[key] as { ctaBanner: { title: string } }).ctaBanner.title}
                        onChange={(e) => set((d) => { (d.pages[key] as { ctaBanner: { title: string } }).ctaBanner.title = e.target.value; })} />
                    </label>
                    <label className="adm-label">CTA Subtitle
                      <input className="adm-input"
                        value={(data.pages[key] as { ctaBanner: { subtitle: string } }).ctaBanner.subtitle}
                        onChange={(e) => set((d) => { (d.pages[key] as { ctaBanner: { subtitle: string } }).ctaBanner.subtitle = e.target.value; })} />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </section>



    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:      { padding: '4rem', textAlign: 'center', color: '#9a9288' },
  heading:      { marginBottom: '1.75rem' },
  h1:           { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:          { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#5a6e5a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 },
  subsection:   { fontSize: 12, fontWeight: 700, color: '#9a9288', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' },
  phoneRow:     { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  radioLabel:   { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
  radioText:    { fontSize: 12, fontWeight: 600, color: '#5a6e5a', whiteSpace: 'nowrap' as const },
  iconBtn:      { width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2ddd4', background: '#faf7f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b3a1a', flexShrink: 0 },
  pageBlock:    { borderBottom: '1px solid #f0ece4', paddingBottom: 10, marginBottom: 10 },
  pageToggle:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '4px 0', color: '#1a3a1a', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' },
  pageFields:   { paddingLeft: 22, paddingTop: 12, paddingBottom: 4, display: 'flex', flexDirection: 'column', gap: 0 },
};

export default AdminSettings;
