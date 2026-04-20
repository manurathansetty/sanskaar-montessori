import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Images, CalendarDays, Users, Home, ChevronRight, Lock } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { CATEGORIES, SLOTS } from '../../content/image-slots';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

const LOCKED = new Set(['founders', 'home']);

const META: Record<string, { label: string; icon: React.ReactNode; accent: string; sub: string }> = {
  gallery:  { label: 'Gallery',  icon: <Images size={20} />,       accent: '#2e6b30', sub: 'Classroom life & activities'    },
  events:   { label: 'Events',   icon: <CalendarDays size={20} />, accent: '#4a7a4a', sub: 'Event hero images'              },
  founders: { label: 'Founders', icon: <Users size={20} />,        accent: '#8a7060', sub: 'Founder profile photos'         },
  home:     { label: 'Home',     icon: <Home size={20} />,         accent: '#8a7060', sub: 'Hero & home page visuals'       },
};

const AdminImages: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <AdminLoadingScreen />;
  }

  return (
    <AdminPageShell backHref="/admin" backLabel="Dashboard" maxWidth={680}>
      <style>{`
        .adm-img-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 1.1rem 1.25rem;
          background: #fffdf8;
          border: 1.5px solid #e8e2d6;
          border-left: 4px solid var(--acc);
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(29,40,29,0.05);
          transition: transform 0.18s, box-shadow 0.18s;
          animation: admFadeUp 0.35s ease both;
        }
        .adm-img-card:not(.locked):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(29,40,29,0.10);
        }
        .adm-img-card.locked { opacity: 0.72; }
        .adm-img-card:nth-child(1) { animation-delay: 0.04s; }
        .adm-img-card:nth-child(2) { animation-delay: 0.09s; }
        .adm-img-card:nth-child(3) { animation-delay: 0.14s; }
        .adm-img-card:nth-child(4) { animation-delay: 0.19s; }
        .adm-img-icon {
          width: 44px; height: 44px;
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: var(--icon-bg);
          color: var(--acc);
        }
      `}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>Manage Images</h1>
        <p style={s.sub}>Select a section to upload or replace images.</p>
      </div>

      <div style={s.grid}>
        {CATEGORIES.map((cat) => {
          const meta = META[cat] ?? { label: cat, icon: <Images size={20} />, accent: '#2e6b30', sub: '' };
          const locked = LOCKED.has(cat);
          const card = (
            <div
              className={`adm-img-card${locked ? ' locked' : ''}`}
              style={{ '--acc': meta.accent, '--icon-bg': `${meta.accent}14` } as React.CSSProperties}
            >
              <div className="adm-img-icon">{meta.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={s.cardTitle}>{meta.label}</div>
                <div style={s.cardSub}>{meta.sub}</div>
              </div>
              <div style={s.slotCount}>{SLOTS[cat].length} slot{SLOTS[cat].length !== 1 ? 's' : ''}</div>
              {locked
                ? <Lock size={15} style={{ color: '#c0b8ae', flexShrink: 0 }} />
                : <ChevronRight size={16} style={{ color: '#ccc', flexShrink: 0 }} />}
            </div>
          );

          return (
            <Link key={cat} to={`/admin/images/${cat}`} style={{ textDecoration: 'none' }}>
              {card}
            </Link>
          );
        })}
      </div>
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:   { padding: '4rem', textAlign: 'center', color: '#9a9288' },
  heading:   { marginBottom: '1.75rem' },
  h1:        { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:       { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  grid:      { display: 'flex', flexDirection: 'column', gap: 10 },
  cardTitle: { fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 2 },
  cardSub:   { fontSize: 13, color: '#9a9288', fontWeight: 500 },
  slotCount: { fontSize: 12, fontWeight: 700, color: '#9a9288', background: '#f0ece4', border: '1px solid #e2ddd4', borderRadius: 20, padding: '3px 9px', flexShrink: 0 },
};

export default AdminImages;
