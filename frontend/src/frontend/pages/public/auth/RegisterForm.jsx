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

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateFields(values, {
      name: { required: true },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      city: { required: true },
      password: { required: true, min: 6 },
    });
    const next = { ...errs };
    if (values.password && values.confirm !== values.password) next.confirm = 'Passwords do not match.';
    if (!agree) next.agree = 'Please accept the club terms to continue.';
    if (!valid || Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    register(values);
    navigate('/app/dashboard');
  };

  return (
    <form onSubmit={submit} noValidate>
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
        <Field label="Password" required error={errors.password} hint="Minimum 6 characters">
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

      <Button type="submit" block size="lg" icon="Sparkles">Create my account</Button>

      <div className="cb-row center" style={{ marginTop: 14 }}>
        <Link to="/login" className="small text-electric">Already a member? Sign in →</Link>
      </div>
    </form>
  );
}
