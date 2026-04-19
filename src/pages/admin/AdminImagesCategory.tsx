import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { SLOTS, isValidCategory } from '../../content/image-slots';

const AdminImagesCategory: React.FC = () => {
  const { category = '' } = useParams<{ category: string }>();
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
  if (!isValidCategory(category)) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Unknown category.</div>;
  }

  const slots = SLOTS[category];

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>{category[0].toUpperCase() + category.slice(1)}</h1>
        <Link to="/admin/images" style={styles.back}>← All categories</Link>
      </header>
      <div style={styles.grid}>
        {slots.map((slot) => (
          <Link
            key={slot.id}
            to={`/admin/images/${category}/${slot.id}`}
            style={styles.card}
          >
            <div style={styles.cardTitle}>{slot.label}</div>
            <div style={styles.cardSub}>{slot.type === 'collection' ? 'Multiple photos' : 'Single image'}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { margin: 0, textTransform: 'capitalize' },
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
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666' },
};

export default AdminImagesCategory;
