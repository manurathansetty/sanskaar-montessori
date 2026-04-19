import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC<{ phone: string }> = ({ phone }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Sanskaar Admin</h1>
        <div style={styles.userBlock}>
          <span style={styles.phone}>{phone}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <p>You're signed in. Content management features coming soon.</p>
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
  main: { lineHeight: 1.6 },
};

export default AdminDashboard;
