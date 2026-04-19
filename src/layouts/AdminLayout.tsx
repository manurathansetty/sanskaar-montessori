import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
