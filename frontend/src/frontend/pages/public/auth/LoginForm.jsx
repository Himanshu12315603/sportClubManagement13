import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { useApp } from '../../../context/AppContext';
import { roleHome } from '../../../data/navigation';

export default function LoginForm() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.email || !values.email.trim()) {
      errs.email = 'Please enter your email address.';
    }
    if (!values.password) {
      errs.password = 'Please enter your password.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const res = await login(values.email, values.password);
    setBusy(false);
    if (!res.ok) {
      setErrors({ password: res.error });
      return;
    }
    navigate(roleHome[res.account.role] || '/app/dashboard');
  };

  return (
    <form onSubmit={submit} noValidate>
      {/* Email input */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: '#172b4d', marginBottom: 7 }}>
          Email address <span style={{ color: '#16a085' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex' }}>
            <Icon name="Mail" size={17} />
          </span>
          <input
            type="email"
            value={values.email}
            onChange={set('email')}
            placeholder="e.g. priya.nair@clubbloom.in"
            autoComplete="email"
            className="input"
            style={{ paddingLeft: 42, background: '#ffffff', borderColor: '#cbd5e1' }}
          />
        </div>
        {errors.email ? <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 5 }}>{errors.email}</div> : null}
      </div>

      {/* Password input */}
      <div style={{ marginBottom: 24 }}>
        <div className="cb-row between" style={{ marginBottom: 7 }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#172b4d', margin: 0 }}>
            Password <span style={{ color: '#16a085' }}>*</span>
          </label>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex' }}>
            <Icon name="Lock" size={17} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="current-password"
            className="input"
            style={{ paddingLeft: 42, paddingRight: 42, background: '#ffffff', borderColor: '#cbd5e1' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Toggle password visibility"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={17} />
          </button>
        </div>
        {errors.password ? <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 5 }}>{errors.password}</div> : null}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={busy}
        className="btn btn-primary btn-block"
        style={{
          padding: '12px 20px',
          fontSize: '0.96rem',
          borderRadius: 12,
        }}
      >
        <Icon name="LogIn" size={17} />
        <span>{busy ? 'Authenticating…' : 'Sign in to Dashboard'}</span>
      </button>

      {/* Footer Register Link */}
      <div style={{ marginTop: 22, textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
        Don't have an account yet?{' '}
        <Link
          to="/register"
          style={{
            color: '#16a085',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Create member account →
        </Link>
      </div>
    </form>
  );
}
