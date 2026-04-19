import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { CATEGORIES, SLOTS } from '../../content/image-slots';

const labels: Record<string, string> = {
  gallery: 'Gallery',
  events: 'Events',
  founders: 'Founders',
  home: 'Home',
};

const AdminImages: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      navigate('/admin/login', { replace: true });
    }
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
  }

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Manage Images</h1>
        <Link to="/admin" style={styles.back}>← Back to Admin</Link>
      </header>
      <div style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <Link key={cat} to={`/admin/images/${cat}`} style={styles.card}>
            <div style={styles.cardTitle}>{labels[cat]}</div>
            <div style={styles.cardSub}>{SLOTS[cat].length} slot{SLOTS[cat].length === 1 ? '' : 's'}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: { margin: 0 },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    display: 'block',
    padding: '1.25rem',
    border: '1px solid #e6e6e6',
    borderRadius: 10,
    background: '#fff',
    textDecoration: 'none',
    color: 'inherit',
  },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666' },
};

export default AdminImages;
