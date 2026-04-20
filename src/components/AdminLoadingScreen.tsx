import React from 'react';

const AdminLoadingScreen: React.FC = () => (
  <>
    <style>{`
      @keyframes admLogoBreath {
        0%, 100% { transform: scale(1);    opacity: 0.9; }
        50%       { transform: scale(1.04); opacity: 1;   }
      }
      @keyframes admDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
        40%           { transform: scale(1);   opacity: 1;   }
      }
      .adm-loading-logo {
        animation: admLogoBreath 2s ease-in-out infinite;
      }
      .adm-loading-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #1d4a1d;
        display: inline-block;
        animation: admDot 1.4s ease-in-out infinite both;
      }
      .adm-loading-dot:nth-child(1) { animation-delay: 0s; }
      .adm-loading-dot:nth-child(2) { animation-delay: 0.2s; }
      .adm-loading-dot:nth-child(3) { animation-delay: 0.4s; }
    `}</style>

    <div style={s.page}>
      <div style={s.center}>
        <div className="adm-loading-logo" style={s.logoRing}>
          <img src="/logo.jpg" alt="Sanskaar Montessori" style={s.logo} />
        </div>

        <div style={s.name}>Sanskaar Montessori</div>
        <div style={s.badge}>Admin Console</div>

        <div style={s.dots}>
          <span className="adm-loading-dot" />
          <span className="adm-loading-dot" />
          <span className="adm-loading-dot" />
        </div>
      </div>
    </div>
  </>
);

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f0e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Nunito', sans-serif",
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    padding: 4,
    background: 'linear-gradient(135deg, #1d4a1d 0%, #4a8a4a 100%)',
    boxShadow: '0 4px 20px rgba(29,74,29,0.22)',
    marginBottom: 18,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #f5f0e8',
    display: 'block',
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a3a1a',
    fontFamily: "'Fraunces', serif",
    letterSpacing: '-0.02em',
    marginBottom: 5,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#c4724a',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    marginBottom: 28,
  },
  dots: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
};

export default AdminLoadingScreen;
