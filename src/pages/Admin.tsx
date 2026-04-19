import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminDashboard from './AdminDashboard';

const Admin: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      navigate('/admin/login', { replace: true });
    }
  }, [state, navigate]);

  if (state.status === 'loading') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>
    );
  }
  if (state.status === 'unauthenticated') {
    return null; // redirect in useEffect
  }
  return <AdminDashboard phone={state.phone} />;
};

export default Admin;
