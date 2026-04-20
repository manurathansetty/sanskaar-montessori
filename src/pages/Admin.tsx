import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminDashboard from './AdminDashboard';
import AdminLoadingScreen from '../components/AdminLoadingScreen';

const Admin: React.FC = () => {
  const { state, logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      navigate('/admin/login', { replace: true });
    }
  }, [state, navigate]);

  if (state.status === 'loading') {
    return <AdminLoadingScreen />;
  }
  if (state.status === 'unauthenticated') {
    return null; // redirect in useEffect
  }
  return <AdminDashboard phone={state.phone} onLogout={logout} />;
};

export default Admin;
