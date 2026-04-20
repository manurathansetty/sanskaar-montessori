import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type Props = {
  backHref: string;
  backLabel: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
};

const AdminPageShell: React.FC<Props> = ({
  backHref,
  backLabel,
  rightAction,
  children,
  maxWidth = 720,
}) => (
  <>
    <style>{`
      @keyframes admFadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .adm-page { animation: admFadeUp 0.35s ease both; }
      .adm-card {
        background: #fffdf8;
        border: 1.5px solid #e8e2d6;
        border-radius: 14px;
        transition: box-shadow 0.18s, transform 0.18s;
      }
      .adm-card-link { text-decoration: none; color: inherit; display: block; }
      .adm-card-link:hover .adm-card,
      a.adm-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(29,40,29,0.10);
      }
      .adm-input {
        padding: 10px 13px;
        font-size: 14px;
        font-family: 'Nunito', sans-serif;
        border: 1.5px solid #e2ddd4;
        border-radius: 10px;
        background: #faf7f1;
        color: #1a1a1a;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.15s, box-shadow 0.15s;
        width: 100%;
      }
      .adm-input:focus {
        border-color: #1d4a1d;
        box-shadow: 0 0 0 3px rgba(29,74,29,0.10);
      }
      .adm-btn-primary {
        padding: 10px 22px;
        background: #1d4a1d;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 700;
        font-family: 'Nunito', sans-serif;
        letter-spacing: 0.01em;
        cursor: pointer;
        transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
      }
      .adm-btn-primary:hover:not(:disabled) {
        background: #163813;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(29,74,29,0.25);
      }
      .adm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .adm-btn-secondary {
        padding: 8px 16px;
        background: #fffdf8;
        color: #1d4a1d;
        border: 1.5px solid rgba(29,74,29,0.4);
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Nunito', sans-serif;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .adm-btn-secondary:hover:not(:disabled) { background: #f0f5f0; border-color: #1d4a1d; }
      .adm-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
      .adm-btn-danger {
        padding: 7px 14px;
        background: none;
        color: #9b3a1a;
        border: 1.5px solid #f0cdb8;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Nunito', sans-serif;
        cursor: pointer;
        transition: background 0.15s;
      }
      .adm-btn-danger:hover:not(:disabled) { background: #fdf0e8; }
      .adm-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
      .adm-back-link {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 13px;
        font-weight: 600;
        color: #7a9a7a;
        text-decoration: none;
        transition: color 0.15s;
      }
      .adm-back-link:hover { color: #1d4a1d; }
      .adm-section {
        background: #fffdf8;
        border: 1.5px solid #e8e2d6;
        border-radius: 14px;
        padding: 1.5rem;
        margin-bottom: 1.25rem;
      }
      .adm-handle {
        color: #c8c0b4;
        cursor: grab;
        font-size: 18px;
        user-select: none;
        flex-shrink: 0;
      }
      .adm-label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
        color: #5a6e5a;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
    `}</style>

    <div style={s.page}>
      <div style={s.watermark}>
        <img src="/logo.jpg" alt="" aria-hidden="true" style={s.watermarkImg} />
      </div>

      <div style={s.topBar}>
        <Link to={backHref} className="adm-back-link">
          <ChevronLeft size={14} strokeWidth={2.5} /> {backLabel}
        </Link>
        {rightAction && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{rightAction}</div>}
      </div>

      <main style={{ ...s.main, maxWidth }} className="adm-page">
        {children}
      </main>
    </div>
  </>
);

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f0e8',
    fontFamily: "'Nunito', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'fixed',
    bottom: '-210px',
    right: '-140px',
    width: 700,
    height: 700,
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.18,
  },
  watermarkImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    filter: 'grayscale(0%) saturate(1.2)',
  },
  topBar: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fffdf8',
    borderBottom: '1.5px solid #e8e2d6',
    padding: '0 2rem',
    height: 56,
    boxShadow: '0 1px 6px rgba(29,40,29,0.05)',
  },
  main: {
    position: 'relative',
    zIndex: 1,
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem',
  },
};

export default AdminPageShell;
