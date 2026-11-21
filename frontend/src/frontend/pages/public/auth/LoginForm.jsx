import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/primitives';
import { Field, Input, validateFields } from '../../../components/ui/form';
import { useApp } from '../../../context/AppContext';
import { roleHome } from '../../../data/navigation';

/** Email + password sign-in with one-tap demo accounts. */
export default function LoginForm() {
  const { login, quickLogin, accounts } = useApp();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateFields(values, {
      email: { required: true, email: true },
      password: { required: true },
    });
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const res = login(values.email, values.password);
    setBusy(false);
    if (!res.ok) {
      setErrors({ password: res.error });
      return;
    }
    navigate(roleHome[res.account.role] || '/app/dashboard');
  };

  const demo = (account) => {
    quickLogin(account.role);
    navigate(roleHome[account.role] || '/app/dashboard');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Email address" required error={errors.email}>
        <Input type="email" value={values.email} onChange={set('email')} placeholder="you@clubbloom.in" autoComplete="email" />
      </Field>
      <Field label="Password" required error={errors.password} hint="Demo password is &quot;clubbloom&quot;">
        <Input type="password" value={values.password} onChange={set('password')} placeholder="••••••••" autoComplete="current-password" />
      </Field>

      <Button type="submit" block size="lg" icon="Lock" disabled={busy} style={{ marginTop: 6 }}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="cb-row center" style={{ marginTop: 14 }}>
        <Link to="/register" className="small text-electric">New here? Create an account →</Link>
      </div>

      <hr className="cb-hairline" />

      <div className="tiny dim" style={{ marginBottom: 10 }}>Quick demo sign-in (no password needed)</div>
      <div className="cb-stack" style={{ gap: 8 }}>
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            className="cb-card glass"
            style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', textAlign: 'left' }}
            onClick={() => demo(a)}
          >
            <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10 }}>
              <Icon name={a.role === 'customer' ? 'User' : a.role === 'manager' ? 'Briefcase' : 'ShieldCheck'} size={15} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="small semibold">{a.title}</div>
              <div className="tiny dim">{a.name} · {a.email}</div>
            </div>
            <Icon name="ArrowRight" size={15} />
          </button>
        ))}
      </div>
    </form>
  );
}
