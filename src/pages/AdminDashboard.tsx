import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  phone: string;
  onLogout: () => Promise<void>;
};

const AdminDashboard: React.FC<Props> = ({ phone, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Sanskaar Admin</h1>
        <div style={styles.userBlock}>
          <span style={styles.phone}>{phone}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <a href="/admin/images" style={styles.card}>
          <div style={styles.cardEmoji}>🖼️</div>
          <div>
            <div style={styles.cardTitle}>Manage Images</div>
            <div style={styles.cardSub}>Gallery, events, founders, home</div>
          </div>
        </a>
        <a href="/admin/events" style={styles.card}>
          <div style={styles.cardEmoji}>📅</div>
          <div>
            <div style={styles.cardTitle}>Events</div>
            <div style={styles.cardSub}>Add, edit, reorder events</div>
          </div>
        </a>
        <a href="/admin/settings" style={styles.card}>
          <div style={styles.cardEmoji}>⚙️</div>
          <div>
            <div style={styles.cardTitle}>Settings</div>
            <div style={styles.cardSub}>School info, phones, page text</div>
          </div>
        </a>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e6e6e6',
    marginBottom: '2rem',
  },
  title: { margin: 0 },
  userBlock: { display: 'flex', alignItems: 'center', gap: '1rem' },
  phone: { fontSize: 14, color: '#666' },
  logoutBtn: {
    padding: '8px 14px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
  },
  main: { lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    border: '1px solid #e6e6e6',
    borderRadius: 10,
    background: '#fff',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    maxWidth: 420,
  },
  cardEmoji: { fontSize: 28 },
  cardTitle: { fontWeight: 600, fontSize: 16 },
  cardSub: { fontSize: 13, color: '#666' },
};

export default AdminDashboard;
