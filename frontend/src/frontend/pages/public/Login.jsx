import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import Tree3D from '../../components/clubbloom/Tree3D';
import { useApp } from '../../context/AppContext';
import { roleHome } from '../../data/navigation';

const perks = [
  { icon: 'CalendarDays', title: 'Court Bookings in Seconds', text: 'Visual 30-minute slot calendar with 60-minute sessions.' },
  { icon: 'Sprout', title: 'Living 3D Virtual Tree', text: 'Grows as you play, order and visit — your club activity mirror.' },
  { icon: 'Percent', title: 'Member Club Pricing', text: 'Exclusive 20% savings on pro shop gear, cafe and courts.' },
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = (userEmail, userPassword) => {
    const targetEmail = userEmail || email;
    const targetPass = userPassword || password;

    if (!targetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!targetPass) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setBusy(true);
    const res = login(targetEmail, targetPass);
    setBusy(false);

    if (!res.ok) {
      setError(res.error || 'Invalid email or password. Please try again.');
      return;
    }

    navigate(roleHome[res.account.role] || '/app/dashboard');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(at 15% 15%, rgba(221, 245, 236, 0.8) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(22, 160, 133, 0.08) 0px, transparent 50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}
    >
      {/* SaaS 2-Column Auth Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 20px 45px -10px rgba(23, 43, 77, 0.08), 0 4px 16px -2px rgba(23, 43, 77, 0.04)',
          border: '1.5px solid #e2e8f0',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
          position: 'relative',
          zIndex: 2,
        }}
        className="cb-login-wrapper"
      >
        {/* LEFT COLUMN: Login Form */}
        <div style={{ padding: '44px 40px', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Brand & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #16a085 0%, #10b981 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)',
              }}
            >
              <Icon name="Flower2" size={20} />
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 999,
                background: '#ddf5ec',
                color: '#065f46',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Icon name="Sparkles" size={13} />
              Member Access
            </span>
          </div>

          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#172b4d', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Sign in to <span style={{ color: '#16a085' }}>ClubBloom</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.94rem', margin: '0 0 26px', lineHeight: 1.5 }}>
            Access your dashboard, court bookings, cafe orders & living virtual garden.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            noValidate
          >
            {/* Email Field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#172b4d', marginBottom: 6 }}>
                Email address <span style={{ color: '#16a085' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex',
                  }}
                >
                  <Icon name="Mail" size={17} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. name@clubbloom.in"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    height: 46,
                    padding: '10px 14px 10px 42px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#172b4d',
                    fontSize: '0.94rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a085';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 160, 133, 0.18)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#172b4d', margin: 0 }}>
                  Password <span style={{ color: '#16a085' }}>*</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex',
                  }}
                >
                  <Icon name="Lock" size={17} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: 46,
                    padding: '10px 42px 10px 42px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#172b4d',
                    fontSize: '0.94rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#16a085';
                    e.target.style.boxShadow = '0 0 0 3px rgba(22, 160, 133, 0.18)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                  }}
                  aria-label="Toggle password"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="AlertTriangle" size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #16a085 0%, #10b981 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 6px 18px -2px rgba(22, 160, 133, 0.4)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Icon name="LogIn" size={18} />
              <span>{busy ? 'Authenticating…' : 'Sign in to Account'}</span>
            </button>
          </form>

          {/* New to ClubBloom Link */}
          <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#16a085', fontWeight: 700, textDecoration: 'none' }}>
              Create an account →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: The Living Tree & Club Perks Showcase */}
        <div
          style={{
            padding: '44px 36px',
            background: 'linear-gradient(155deg, #ecfdf5 0%, #ddf5ec 45%, #f0fdf4 100%)',
            borderLeft: '1.5px solid #bbf7d0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow decoration */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Living Tree Feature Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '20px 22px',
              boxShadow: '0 8px 24px -4px rgba(22, 160, 133, 0.12)',
              border: '1px solid #bbf7d0',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#ddf5ec',
                  color: '#065f46',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
              >
                <Icon name="Leaf" size={12} />
                Live Bloom Mirror
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#16a085' }}>Stage 4/5 · 82%</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 'none', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tree3D health={82} growth={0.88} celebrating size={110} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172b4d', margin: '0 0 4px' }}>
                  Your tree missed you
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Sign in to see how much your tree has grown from your bookings and visits.
                </p>
              </div>
            </div>
          </div>

          {/* Perks List */}
          <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>
            {perks.map((p) => (
              <div key={p.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1px solid #bbf7d0',
                    color: '#16a085',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)',
                    flex: 'none',
                    marginTop: 2,
                  }}
                >
                  <Icon name={p.icon} size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#172b4d' }}>{p.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{p.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Join ClubBloom Promo Box */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '16px 20px',
              border: '1.5px dashed #16a085',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#172b4d' }}>New to ClubBloom?</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Get your membership & plant your seed</div>
            </div>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                background: '#16a085',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(22, 160, 133, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Join Now</span>
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
