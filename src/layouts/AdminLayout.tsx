import React from 'react';
import { Outlet } from 'react-router-dom';
import ToastHost from '../components/ToastHost';

const AdminLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <Outlet />
      <ToastHost />
    </div>
  );
};

export default AdminLayout;
