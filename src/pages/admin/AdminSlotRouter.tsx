import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { findSlot, isValidCategory } from '../../content/image-slots';
import AdminSlotCollection from './AdminSlotCollection';
import AdminSlotSingle from './AdminSlotSingle';

const AdminSlotRouter: React.FC = () => {
  const { category = '', slot: slotId = '' } = useParams<{
    category: string;
    slot: string;
  }>();
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
  const slot = findSlot(category, slotId);
  if (!slot) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Unknown slot.</div>;
  }

  if (slot.type === 'single') {
    return <AdminSlotSingle category={category} slot={slot} />;
  }
  return <AdminSlotCollection category={category} slot={slot} />;
};

export default AdminSlotRouter;
