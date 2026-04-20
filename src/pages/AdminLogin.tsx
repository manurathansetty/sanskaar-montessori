import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ phone, password }),
      });
      if (res.ok) {
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid phone number or password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-login-card { animation: fadeUp 0.5s ease both; }
        .admin-login-input:focus {
          border-color: #1d4a1d !important;
          box-shadow: 0 0 0 3px rgba(29,74,29,0.1) !important;
          outline: none;
        }
        .admin-login-btn:hover:not(:disabled) {
          background: #163813 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(29,74,29,0.35) !important;
        }
        .admin-login-btn:active { transform: translateY(0); }
        .admin-login-btn { transition: all 0.18s ease; }
        .admin-login-input { transition: border-color 0.15s, box-shadow 0.15s; }
      `}</style>

      <div style={s.page}>
        {/* Watermark */}
        <div style={s.watermark}>
          <img src="/logo.jpg" alt="" aria-hidden="true" style={s.watermarkImg} />
        </div>
        {/* Decorative background blobs */}
        <div style={s.blob1} />
        <div style={s.blob2} />

        <form onSubmit={onSubmit} style={s.card} className="admin-login-card">

          {/* Logo */}
          <div style={s.logoRing}>
            <img src="/logo.jpg" alt="Sanskaar Montessori" style={s.logo} />
          </div>

          {/* Title */}
          <div style={s.titleBlock}>
            <h1 style={s.schoolName}>Sanskaar Montessori</h1>
            <p style={s.consoleBadge}>Admin Console</p>
          </div>

          {/* Divider */}
          <div style={s.divider}>
            <span style={s.dividerLeaf}>✦</span>
          </div>

          {/* Fields */}
          <div style={s.fields}>
            <label style={s.label}>
              <span style={s.labelText}>Mobile number</span>
              <input
                className="admin-login-input"
                type="tel"
                inputMode="tel"
                autoComplete="username"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Mobile number"
                style={s.input}
              />
            </label>

            <label style={s.label}>
              <span style={s.labelText}>Password</span>
              <div style={s.passwordWrap}>
                <input
                  className="admin-login-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...s.input, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={s.eyeBtn}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
          </div>

          {error && (
            <div style={s.error}>
              <span style={s.errorDot}>●</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={s.button}
            className="admin-login-btn"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p style={s.footer}>Sanskaar Montessori · Admin only</p>
        </form>
      </div>
    </>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: '#f5f0e8',
    fontFamily: "'Nunito', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: '-120px',
    left: '-120px',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(29,74,29,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  watermark: {
    position: 'fixed',
    bottom: '-210px',
    right: '-140px',
    width: 680,
    height: 680,
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
  blob2: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(196,114,74,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 380,
    padding: '2.5rem 2rem 2rem',
    background: '#fffdf8',
    borderRadius: 20,
    boxShadow: '0 8px 40px rgba(29,40,29,0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    border: '1px solid rgba(29,74,29,0.08)',
  },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: '50%',
    margin: '0 auto',
    padding: 4,
    background: 'linear-gradient(135deg, #1d4a1d 0%, #4a8a4a 100%)',
    boxShadow: '0 4px 16px rgba(29,74,29,0.25)',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #fffdf8',
    display: 'block',
  },
  titleBlock: {
    textAlign: 'center',
    marginTop: -4,
  },
  schoolName: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#1a3a1a',
    fontFamily: "'Fraunces', serif",
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  consoleBadge: {
    margin: '6px 0 0',
    fontSize: 10,
    fontWeight: 700,
    color: '#c4724a',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '-4px 0',
  },
  dividerLeaf: {
    fontSize: 10,
    color: '#8aaa80',
    letterSpacing: 6,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  labelText: {
    fontSize: 12,
    fontWeight: 700,
    color: '#5a6e5a',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    fontSize: 15,
    fontFamily: "'Nunito', sans-serif",
    border: '1.5px solid #e2ddd4',
    borderRadius: 10,
    background: '#faf7f1',
    color: '#1a1a1a',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    color: '#aaa',
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: '#9b3a1a',
    fontSize: 13,
    fontWeight: 500,
    background: '#fdf0e8',
    border: '1px solid #f0cdb8',
    borderRadius: 8,
    padding: '9px 12px',
  },
  errorDot: {
    fontSize: 7,
    flexShrink: 0,
  },
  button: {
    width: '100%',
    padding: '13px',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    letterSpacing: '0.02em',
    border: 'none',
    borderRadius: 10,
    background: '#1d4a1d',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(29,74,29,0.25)',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#bbb',
    margin: '-4px 0 0',
    letterSpacing: '0.04em',
  },
};

export default AdminLogin;
