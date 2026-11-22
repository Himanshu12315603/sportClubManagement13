import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/primitives';
import { Field, FormRow, Input, Select, validateFields } from '../../../components/ui/form';
import { useApp } from '../../../context/AppContext';

const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Other'].map((c) => ({
  value: c,
  label: c,
}));

/** New-member registration form with high-contrast, crystal-clear light design. */
export default function RegisterForm() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', phone: '', city: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateFields(values, {
      name: { required: true },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      city: { required: true },
      password: { required: true, min: 8 },
    });
    const next = { ...errs };
    if (values.password && values.confirm !== values.password) next.confirm = 'Passwords do not match.';
    if (values.password && !/[A-Z]/.test(values.password)) next.password = 'Password must contain at least one uppercase letter';
    if (values.password && !/[0-9]/.test(values.password)) next.password = 'Password must contain at least one number';
    if (!agree) next.agree = 'Please accept the club terms to continue.';
    if (!valid || Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const res = await register(values);
    setBusy(false);
    if (!res.ok) {
      setErrors({ form: res.error });
      return;
    }
    navigate('/app/dashboard');
  };

  return (
    <form onSubmit={submit} noValidate>
      {errors.form && <div className="error-text" style={{ marginBottom: 16, padding: 12, background: '#fee2e2', borderRadius: 8 }}>{errors.form}</div>}

      <Field label="Full name" required error={errors.name}>
        <Input value={values.name} onChange={set('name')} placeholder="Priya Nair" autoComplete="name" />
      </Field>

      <FormRow cols={2}>
        <Field label="Email Address" required error={errors.email}>
          <Input
            type="email"
            value={values.email}
            onChange={set('email')}
            placeholder="e.g. priya.nair@clubbloom.in"
            autoComplete="email"
          />
        </Field>
        <Field label="Phone Number" required error={errors.phone}>
          <Input
            type="tel"
            value={values.phone}
            onChange={set('phone')}
            placeholder="+91 98450 00000"
            autoComplete="tel"
          />
        </Field>
      </FormRow>

      <Field label="Home City" required error={errors.city}>
        <Select
          value={values.city}
          onChange={set('city')}
          options={cities}
          placeholder="Select your city"
        />
      </Field>

      <FormRow cols={2}>
        <Field label="Password" required error={errors.password} hint="Minimum 8 characters, 1 uppercase, 1 number">
          <Input type="password" value={values.password} onChange={set('password')} placeholder="••••••••" autoComplete="new-password" />
        </Field>
        <Field label="Confirm Password" required error={errors.confirm}>
          <Input
            type="password"
            value={values.confirm}
            onChange={set('confirm')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
      </FormRow>

      {/* Terms Agreement Checkbox */}
      <label
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          margin: '18px 0 22px',
          cursor: 'pointer',
          padding: '10px 14px',
          borderRadius: 10,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          style={{
            width: 18,
            height: 18,
            marginTop: 2,
            accentColor: '#16a085',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '0.84rem', color: '#172b4d', lineHeight: 1.45 }}>
          I agree to the ClubBloom club rules, court booking policy and member code of conduct.
          {errors.agree ? (
            <span style={{ color: '#ef4444', display: 'block', marginTop: 4, fontWeight: 600 }}>
              {errors.agree}
            </span>
          ) : null}
        </span>
      </label>

      <Button type="submit" block size="lg" icon="Sparkles" disabled={busy}>{busy ? 'Creating account…' : 'Create my account'}</Button>
      {/* Sign-in Link */}
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
        Already a member?{' '}
        <Link
          to="/login"
          style={{
            color: '#16a085',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Sign in here →
        </Link>
      </div>
    </form>
  );
}
