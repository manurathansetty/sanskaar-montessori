import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Layers, Image, Grid2X2 } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { SLOTS, isValidCategory } from '../../content/image-slots';
import AdminPageShell from '../../components/AdminPageShell';
import AdminLoadingScreen from '../../components/AdminLoadingScreen';

const CAT_LABELS: Record<string, string> = {
  gallery: 'Gallery', events: 'Events', founders: 'Founders', home: 'Home',
};

const AdminImagesCategory: React.FC = () => {
  const { category = '' } = useParams<{ category: string }>();
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <AdminLoadingScreen />;
  }
  if (!isValidCategory(category)) {
    return <AdminLoadingScreen />;
  }

  const slots = SLOTS[category];
  const catLabel = CAT_LABELS[category] ?? (category[0].toUpperCase() + category.slice(1));

  const manageBtn = category === 'gallery' ? (
    <Link to="/admin/categories" className="adm-btn-secondary">
      <Grid2X2 size={14} /> Manage Categories
    </Link>
  ) : undefined;

  return (
    <AdminPageShell backHref="/admin/images" backLabel="All categories" rightAction={manageBtn} maxWidth={720}>
      <style>{`
        .adm-slot-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 1rem 1.25rem;
          background: #fffdf8;
          border: 1.5px solid #e8e2d6;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s, box-shadow 0.18s;
          animation: admFadeUp 0.35s ease both;
        }
        .adm-slot-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(29,40,29,0.10);
        }
      `}</style>

      <div style={s.heading}>
        <h1 style={s.h1}>{catLabel}</h1>
        <p style={s.sub}>{slots.length} image slot{slots.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={s.grid}>
        {slots.map((slot, i) => (
          <Link
            key={slot.id}
            to={`/admin/images/${category}/${slot.id}`}
            className="adm-slot-card"
            style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
          >
            <div style={s.icon}>
              {slot.type === 'collection' ? <Layers size={18} color="#2e6b30" /> : <Image size={18} color="#c4724a" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.cardTitle}>{slot.label}</div>
              <div style={s.cardSub}>{slot.type === 'collection' ? 'Multiple photos' : 'Single image'}</div>
            </div>
            <ChevronRight size={15} style={{ color: '#ccc', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </AdminPageShell>
  );
};

const s: Record<string, React.CSSProperties> = {
  loading:   { padding: '4rem', textAlign: 'center', color: '#9a9288' },
  heading:   { marginBottom: '1.75rem' },
  h1:        { margin: '0 0 4px', fontSize: 28, fontWeight: 600, color: '#1a3a1a', fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' },
  sub:       { margin: 0, fontSize: 14, color: '#9a9288', fontWeight: 500 },
  grid:      { display: 'flex', flexDirection: 'column', gap: 8 },
  icon:      { width: 40, height: 40, borderRadius: 10, background: '#f0f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 2 },
  cardSub:   { fontSize: 12, color: '#9a9288', fontWeight: 500 },
};

export default AdminImagesCategory;
