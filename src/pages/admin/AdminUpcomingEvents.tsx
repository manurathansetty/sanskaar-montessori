import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Save, GripVertical, Trash2,
  DoorOpen, CalendarDays, CalendarClock, Star, Heart, Sun, Users, Sparkles,
  School, Baby, Palette, BookOpen, Sprout, Music, Trophy, Leaf, Globe,
  Camera, Gift, Mic2, Paintbrush, FlameKindling, TreePine, Landmark, Hourglass,
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { SITE } from '../../content/site-content';
import type { SiteContent, UpcomingEvent } from '../../content/site-content';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

export const UPCOMING_ICON_MAP: Record<string, React.ReactElement<{ size?: number }>> = {
  DoorOpen:      <DoorOpen size={40} />,
  CalendarDays:  <CalendarDays size={40} />,
  CalendarClock: <CalendarClock size={40} />,
  Star:          <Star size={40} />,
  Heart:         <Heart size={40} />,
  Sun:           <Sun size={40} />,
  Users:         <Users size={40} />,
  Sparkles:      <Sparkles size={40} />,
  School:        <School size={40} />,
  Baby:          <Baby size={40} />,
  Palette:       <Palette size={40} />,
  BookOpen:      <BookOpen size={40} />,
  Sprout:        <Sprout size={40} />,
  Music:         <Music size={40} />,
  Trophy:        <Trophy size={40} />,
  Leaf:          <Leaf size={40} />,
  Globe:         <Globe size={40} />,
  Camera:        <Camera size={40} />,
  Gift:          <Gift size={40} />,
  Mic2:          <Mic2 size={40} />,
  Paintbrush:    <Paintbrush size={40} />,
  FlameKindling: <FlameKindling size={40} />,
  TreePine:      <TreePine size={40} />,
  Landmark:      <Landmark size={40} />,
  Hourglass:     <Hourglass size={40} />,
};

const ICON_OPTIONS = Object.keys(UPCOMING_ICON_MAP).map((name) => ({
  name,
  preview: React.cloneElement(UPCOMING_ICON_MAP[name], { size: 18 }),
}));

function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

const AdminUpcomingEvents: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<UpcomingEvent[] | null>(null);
  const [saving, setSaving] = useState(false);
  const dragIndex = React.useRef<number | null>(null);

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    fetch('/api/content/site', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() as Promise<{ upcomingEvents?: UpcomingEvent[] }> : Promise.reject())
      .then((json) => setEvents(deepClone(json.upcomingEvents ?? [])))
      .catch(() => setEvents(deepClone(SITE.upcomingEvents ?? [])));
  }, [state.status]);

  if (state.status !== 'authenticated' || !events) return <AdminLoadingScreen />;

  const set = (updater: (list: UpcomingEvent[]) => void) => {
    setEvents((prev) => {
      if (!prev) return prev;
      const next = deepClone(prev);
      updater(next);
      return next;
    });
  };

  const save = async (list: UpcomingEvent[]) => {
    setSaving(true);
    try {
      const payload: SiteContent = { ...deepClone(SITE), upcomingEvents: list };
      const res = await fetch('/api/save/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
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

  const addEvent = () => set((list) => list.push({ title: '', subtitle: '', date: '', description: '', icon: 'DoorOpen', link: '' }));

  const removeEvent = (i: number) => {
    const next = deepClone(events);
    next.splice(i, 1);
    setEvents(next);
    save(next);
  };

  const handleDragStart = (i: number) => { dragIndex.current = i; };
  const handleDrop = (i: number) => {
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const next = deepClone(events);
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setEvents(next);
    save(next);
    dragIndex.current = null;
  };

  const saveBtn = (
    <button className="adm-btn-primary" onClick={() => save(events)} disabled={saving}
      style={{ cursor: saving ? 'not-allowed' : 'pointer' }}>
      <Save size={14} /> {saving ? 'Saving…' : 'Save All'}
    </button>
  );

  return (
    <AdminPageShell backHref="/admin/events" backLabel="Events & Programmes" rightAction={saveBtn} maxWidth={680}>
      <style>{`
        .adm-ue-card {
          background: #fffdf8;
          border: 1.5px solid #e8e2d6;
          border-radius: 14px;
          overflow: hidden;
          animation: admFadeUp 0.35s ease both;
        }
        .adm-ue-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.85rem 1.25rem;
          background: #f8f5ef;
          border-bottom: 1.5px solid #e8e2d6;
          cursor: grab;
        }
        .adm-ue-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
      `}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>Upcoming Events</h1>
        <p style={s.sub}>Shown on the Events page · hidden when list is empty</p>
      </div>

      <div style={s.list}>
        {events.map((ev, i) => (
          <div
            key={i}
            className="adm-ue-card"
            style={{ animationDelay: `${i * 0.06}s` }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <div
              className="adm-ue-header"
              draggable
              onDragStart={() => handleDragStart(i)}
            >
              <GripVertical size={15} style={{ color: '#c8c0b4', flexShrink: 0 }} />
              <span style={s.cardIndex}>Event {i + 1}</span>
              <div style={{ flex: 1 }} />
              <button style={s.iconBtn} onClick={() => removeEvent(i)} title="Remove event">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="adm-ue-body">
              <label className="adm-label">
                Icon
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select className="adm-input" style={{ flex: 1 }} value={ev.icon ?? 'DoorOpen'}
                    onChange={(e) => set((list) => { list[i].icon = e.target.value; })}>
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.name} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                  <div style={s.iconPreview}>
                    {UPCOMING_ICON_MAP[ev.icon ?? 'DoorOpen']
                      ? React.cloneElement(UPCOMING_ICON_MAP[ev.icon ?? 'DoorOpen'], { size: 22 })
                      : <DoorOpen size={22} />}
                  </div>
                </div>
              </label>

              <label className="adm-label">Title
                <input className="adm-input" value={ev.title}
                  onChange={(e) => set((list) => { list[i].title = e.target.value; })} />
              </label>

              <label className="adm-label">
                Subtitle
                <span style={s.hint}> — tagline shown below the heading (optional)</span>
                <input className="adm-input" value={ev.subtitle ?? ''}
                  onChange={(e) => set((list) => { list[i].subtitle = e.target.value || undefined; })} />
              </label>

              <label className="adm-label">
                Date
                <span style={s.hint}> — e.g. "April 2026" or "Dates to be announced"</span>
                <input className="adm-input" value={ev.date}
                  onChange={(e) => set((list) => { list[i].date = e.target.value; })} />
              </label>

              <label className="adm-label">
                Description
                <span style={s.hint}> — blank line between paragraphs</span>
                <textarea className="adm-input" style={s.textarea} value={ev.description}
                  onChange={(e) => set((list) => { list[i].description = e.target.value; })} />
              </label>

              <label className="adm-label">
                Link
                <span style={s.hint}> — optional URL (leave blank to omit)</span>
                <input className="adm-input" value={ev.link ?? ''}
                  onChange={(e) => set((list) => { list[i].link = e.target.value || undefined; })} />
              </label>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div style={s.emptyBox}>
            No upcoming events — the section is hidden on the website.<br />
            Click "+ Add Event" to create one.
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button className="adm-btn-secondary" onClick={addEvent}>
          <Plus size={13} /> Add Event
        </button>
      </div>

      {events.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <button className="adm-btn-primary" onClick={() => save(events)} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      )}
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  heading:   { marginBottom: '1.75rem' },
  h1:        { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:       { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  list:      { display: 'flex', flexDirection: 'column', gap: 12 },
  cardIndex: { fontSize: 11, fontWeight: 700, color: '#9a9288', textTransform: 'uppercase', letterSpacing: '0.07em' },
  hint:      { fontWeight: 400, color: '#9a9288', fontSize: 10, textTransform: 'none', letterSpacing: 0 },
  textarea:  { minHeight: 110, resize: 'vertical' as const },
  iconPreview: { width: 44, height: 44, borderRadius: 10, background: '#f0ece4', border: '1.5px solid #e2ddd4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a6e5a', flexShrink: 0 },
  iconBtn:   { width: 28, height: 28, borderRadius: 7, border: '1.5px solid #e2ddd4', background: '#faf7f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b3a1a', flexShrink: 0 },
  emptyBox:  { padding: '2rem', textAlign: 'center', color: '#9a9288', background: '#fffdf8', border: '1.5px dashed #e2ddd4', borderRadius: 14, lineHeight: 1.7, fontSize: 14 },
};

export default AdminUpcomingEvents;
