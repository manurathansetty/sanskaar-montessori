import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toastStore, type Toast } from '../store/toastStore';

const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => toastStore.subscribe(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div style={styles.host}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...styles.toast, ...(t.variant === 'success' ? styles.success : styles.error) }}>
          <span style={styles.msg}>{t.message}</span>
          <button style={styles.close} onClick={() => toastStore.dismiss(t.id)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  host:    { position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 },
  toast:   { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 220, maxWidth: 360 },
  success: { background: '#1b5e20', color: '#fff' },
  error:   { background: '#b71c1c', color: '#fff' },
  msg:     { flex: 1 },
  close:   { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2, display: 'flex', alignItems: 'center' },
};

export default ToastHost;
