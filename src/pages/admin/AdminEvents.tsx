import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Pencil, Trash2, Plus, CalendarClock } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { EVENTS } from '../../content/site-content';
import type { EventConfig } from '../../content/site-content';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  featured:   { bg: '#e8f0e8', color: '#2e6b30' },
  programme:  { bg: '#e8f0f5', color: '#2a5a7a' },
  admissions: { bg: '#fdf3e7', color: '#7a4a1a' },
};

const AdminEvents: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventConfig[] | null>(null);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    fetch('/api/content/events', { credentials: 'same-origin' })
      .then((r) => r.ok ? r.json() as Promise<EventConfig[]> : Promise.reject())
      .then((json) => setEvents((json as EventConfig[]).sort((a, b) => a.order - b.order)))
      .catch(() => setEvents([...EVENTS].sort((a, b) => a.order - b.order)));
  }, [state.status]);

  if (state.status !== 'authenticated' || !events) {
    return <AdminLoadingScreen />;
  }

  const saveEvents = async (list: EventConfig[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/save/events', {
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
    const next = [...events];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    const reordered = next.map((e, idx) => ({ ...e, order: idx + 1 }));
    setEvents(reordered);
    saveEvents(reordered);
    dragIndex.current = null;
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    const next = events.filter((e) => e.id !== id).map((e, idx) => ({ ...e, order: idx + 1 }));
    setEvents(next);
    await saveEvents(next);
  };

  const addBtn = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Link to="/admin/upcoming-events" className="adm-btn-secondary">
        <CalendarClock size={13} /> Upcoming Events
      </Link>
      <Link to="/admin/events/new" className="adm-btn-primary">
        <Plus size={14} /> Add Event
      </Link>
    </div>
  );

  return (
    <AdminPageShell backHref="/admin" backLabel="Dashboard" rightAction={addBtn} maxWidth={680}>
      <style>{`
        .adm-event-row {
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
        .adm-event-row:hover { box-shadow: 0 4px 16px rgba(29,40,29,0.09); }
        .adm-event-row.drag-over { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(29,40,29,0.14); }
      `}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>Events & Programmes</h1>
        <p style={s.sub}>Drag to reorder · changes save automatically</p>
      </div>

      <div style={s.list}>
        {events.map((event, i) => {
          const tc = TYPE_COLORS[event.type] ?? TYPE_COLORS.programme;
          return (
            <div
              key={event.id}
              className="adm-event-row"
              style={{ animationDelay: `${i * 0.05}s` }}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
            >
              <GripVertical size={17} style={{ color: '#c8c0b4', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.eventEyebrow}>{event.eyebrow}</div>
                <div style={s.eventTitle}>{event.title}</div>
                <span style={{ ...s.badge, background: tc.bg, color: tc.color }}>{event.type}</span>
              </div>
              <div style={s.actions}>
                <Link to={`/admin/events/${event.id}`} className="adm-btn-secondary">
                  <Pencil size={12} /> Edit
                </Link>
                <button className="adm-btn-danger" onClick={() => deleteEvent(event.id)} disabled={saving}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div style={s.emptyBox}>No events yet. Click "Add Event" to create one.</div>
        )}
      </div>
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:      { padding: '4rem', textAlign: 'center', color: '#9a9288' },
  heading:      { marginBottom: '1.75rem' },
  h1:           { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:          { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  list:         { display: 'flex', flexDirection: 'column', gap: 8 },
  eventEyebrow: { fontSize: 11, fontWeight: 700, color: '#9a9288', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 },
  eventTitle:   { fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 5 },
  badge:        { display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 700 },
  actions:      { display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' },
  emptyBox:     { padding: '2.5rem', textAlign: 'center', color: '#9a9288', background: '#fffdf8', border: '1.5px dashed #e2ddd4', borderRadius: 14 },
};

export default AdminEvents;
