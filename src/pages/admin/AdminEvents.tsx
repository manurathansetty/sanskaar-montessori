import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useToast } from '../../hooks/useToast';
import { saveErrorMessage } from '../../lib/adminErrors';
import { EVENTS } from '../../content/site-content';
import type { EventConfig } from '../../content/site-content';

const AdminEvents: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventConfig[]>(() =>
    [...EVENTS].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
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
    const next = events
      .filter((e) => e.id !== id)
      .map((e, idx) => ({ ...e, order: idx + 1 }));
    setEvents(next);
    await saveEvents(next);
  };

  return (
    <div style={s.wrapper}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Events</h1>
          <Link to="/admin" style={s.back}>← Dashboard</Link>
        </div>
        <Link to="/admin/events/new" style={s.addBtn}>+ Add Event</Link>
      </header>

      <div style={s.list}>
        {events.map((event, i) => (
          <div
            key={event.id}
            style={s.card}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <span style={s.handle} title="Drag to reorder">⠿</span>
            <div style={s.cardBody}>
              <div style={s.cardTitle}>{event.eyebrow}</div>
              <div style={s.cardSub}>{event.title}</div>
              <span style={s.typeBadge}>{event.type}</span>
            </div>
            <div style={s.cardActions}>
              <Link to={`/admin/events/${event.id}`} style={s.editBtn}>Edit</Link>
              <button style={s.deleteBtn} onClick={() => deleteEvent(event.id)} disabled={saving}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrapper:     { maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title:       { margin: 0 },
  back:        { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  addBtn:      { padding: '10px 18px', background: '#3a6a3a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  list:        { display: 'flex', flexDirection: 'column', gap: 8 },
  card:        { display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10, cursor: 'grab' },
  handle:      { fontSize: 20, color: '#aaa', userSelect: 'none' },
  cardBody:    { flex: 1 },
  cardTitle:   { fontWeight: 600, fontSize: 15 },
  cardSub:     { fontSize: 13, color: '#666', marginTop: 2 },
  typeBadge:   { display: 'inline-block', marginTop: 4, fontSize: 11, padding: '2px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 4, fontWeight: 600 },
  cardActions: { display: 'flex', gap: 8, flexShrink: 0 },
  editBtn:     { padding: '6px 14px', fontSize: 13, color: '#3a6a3a', border: '1px solid #3a6a3a', borderRadius: 6, textDecoration: 'none' },
  deleteBtn:   { padding: '6px 14px', fontSize: 13, color: '#c00', border: '1px solid #f5c6cb', borderRadius: 6, background: 'none', cursor: 'pointer' },
};

export default AdminEvents;
