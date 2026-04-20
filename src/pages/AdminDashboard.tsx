import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, CalendarDays, Settings, LogOut, ChevronRight } from 'lucide-react';

type Props = { phone: string; onLogout: () => Promise<void> };

type NavCard = {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  accent: string;
};

const CARDS: NavCard[] = [
  {
    href: '/admin/images',
    icon: <Images size={20} />,
    title: 'Manage Images',
    sub: 'Gallery, events, founders & home hero',
    accent: '#2e6b30',
  },
  {
    href: '/admin/events',
    icon: <CalendarDays size={20} />,
    title: 'Events & Programmes',
    sub: 'Add, edit and reorder event cards',
    accent: '#4a7a4a',
  },
  {
    href: '/admin/settings',
    icon: <Settings size={20} />,
    title: 'Site Settings',
    sub: 'School info, phone numbers & page text',
    accent: '#c4724a',
  },
];

const AdminDashboard: React.FC<Props> = ({ phone, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Nunito:wght@400;500;600;700&display=swap');

        .admin-db-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 1.1rem 1.25rem;
          background: #fffdf8;
          border: 1.5px solid #e8e2d6;
          border-left: 4px solid var(--card-accent);
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(29,40,29,0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s;
          animation: fadeUp 0.4s ease both;
        }
        .admin-db-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(29,40,29,0.12);
          border-color: var(--card-accent);
          border-left-color: var(--card-accent);
        }
        .admin-db-card:nth-child(1) { animation-delay: 0.05s; }
        .admin-db-card:nth-child(2) { animation-delay: 0.12s; }
        .admin-db-card:nth-child(3) { animation-delay: 0.19s; }

        .admin-db-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--card-icon-bg);
          color: var(--card-accent);
        }

        .admin-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Nunito', sans-serif;
          border: 1.5px solid #ddd8ce;
          border-radius: 8px;
          background: #fffdf8;
          cursor: pointer;
          color: #666;
          transition: all 0.15s;
        }
        .admin-logout-btn:hover {
          border-color: #c4724a;
          color: #c4724a;
          background: #fff9f5;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        .admin-header-anim { animation: fadeIn 0.4s ease both; }
        .admin-title-anim  { animation: fadeUp 0.4s ease 0.05s both; }
      `}</style>

      <div style={s.page}>
        {/* Watermark logo */}
        <div style={s.watermark}>
          <img src="/logo.jpg" alt="" aria-hidden="true" style={s.watermarkImg} />
        </div>

        {/* Top bar */}
        <header style={s.topBar} className="admin-header-anim">
          <div style={s.brand}>
            <div style={s.logoRing}>
              <img src="/logo.jpg" alt="Sanskaar Montessori" style={s.logoImg} />
            </div>
            <div>
              <div style={s.brandName}>Sanskaar Montessori</div>
              <div style={s.brandSub}>Admin Console</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={s.phoneChip}>{phone}</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              <LogOut size={14} /> Log out
            </button>
          </div>
        </header>

        {/* Main */}
        <main style={s.main}>
          <div className="admin-title-anim">
            <h1 style={s.heading}>Dashboard</h1>
            <p style={s.subheading}>What would you like to manage today?</p>
          </div>

          <div style={s.grid}>
            {CARDS.map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="admin-db-card"
                style={{ '--card-accent': card.accent, '--card-icon-bg': `${card.accent}14` } as React.CSSProperties}
              >
                <div className="admin-db-icon">
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.cardTitle}>{card.title}</div>
                  <div style={s.cardSub}>{card.sub}</div>
                </div>
                <ChevronRight size={17} style={{ color: '#ccc', flexShrink: 0 }} />
              </a>
            ))}
          </div>

          <p style={s.hint}>Changes go live on the website within ~2 minutes after saving.</p>
        </main>
      </div>
    </>
  );
};

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
    height: 64,
    boxShadow: '0 1px 8px rgba(29,40,29,0.06)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoRing: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    padding: 2,
    background: 'linear-gradient(135deg, #1d4a1d, #6aaa6a)',
    flexShrink: 0,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #fffdf8',
    display: 'block',
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1a3a1a',
    fontFamily: "'Fraunces', serif",
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  brandSub: {
    fontSize: 10,
    color: '#c4724a',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  phoneChip: {
    fontSize: 12,
    color: '#888',
    background: '#f0ece4',
    border: '1px solid #e2ddd4',
    borderRadius: 20,
    padding: '4px 10px',
    fontWeight: 600,
  },
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 580,
    margin: '0 auto',
    padding: '3rem 1.5rem 4rem',
  },
  heading: {
    margin: '0 0 4px',
    fontSize: 32,
    fontWeight: 600,
    color: '#1a3a1a',
    fontFamily: "'Fraunces', serif",
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  subheading: {
    margin: '0 0 2rem',
    fontSize: 14,
    color: '#9a9288',
    fontWeight: 500,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: '#9a9288',
    fontWeight: 500,
  },
  hint: {
    marginTop: '2rem',
    fontSize: 12,
    fontWeight: 600,
    color: '#7a4a1a',
    textAlign: 'center',
    background: '#fdf3e7',
    border: '1px solid #f0cfa0',
    borderRadius: 8,
    padding: '9px 14px',
    letterSpacing: '0.01em',
  },
};

export default AdminDashboard;
