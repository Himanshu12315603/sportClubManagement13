import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/primitives';
import { Field, FormRow, Input, Select, validateFields } from '../../../components/ui/form';
import { useApp } from '../../../context/AppContext';

const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Other'].map((c) => ({ value: c, label: c }));

/** New-member registration form. */
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
        <Field label="Email" required error={errors.email}>
          <Input type="email" value={values.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" />
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <Input value={values.phone} onChange={set('phone')} placeholder="+91 98450 00000" autoComplete="tel" />
        </Field>
      </FormRow>

      <Field label="City" required error={errors.city}>
        <Select value={values.city} onChange={set('city')} options={cities} placeholder="Select your city" />
      </Field>

      <FormRow cols={2}>
        <Field label="Password" required error={errors.password} hint="Minimum 8 characters, 1 uppercase, 1 number">
          <Input type="password" value={values.password} onChange={set('password')} placeholder="••••••••" autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" required error={errors.confirm}>
          <Input type="password" value={values.confirm} onChange={set('confirm')} placeholder="••••••••" autoComplete="new-password" />
        </Field>
      </FormRow>

      <label className="cb-row" style={{ gap: 10, alignItems: 'flex-start', marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
        <span className="tiny muted">
          I agree to the ClubBloom club rules, privacy policy and member handbook.
          {errors.agree ? <span className="error-text" style={{ display: 'block' }}>{errors.agree}</span> : null}
        </span>
      </label>

      <Button type="submit" block size="lg" icon="Sparkles" disabled={busy}>{busy ? 'Creating account…' : 'Create my account'}</Button>

      <div className="cb-row center" style={{ marginTop: 14 }}>
        <Link to="/login" className="small text-electric">Already a member? Sign in →</Link>
      </div>
    </form>
  );
}
