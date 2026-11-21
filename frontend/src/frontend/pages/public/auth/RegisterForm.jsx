import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
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
    setBusy(true);
    register(values);
    setBusy(false);
    navigate('/app/dashboard');
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Full Name" required error={errors.name}>
        <Input
          value={values.name}
          onChange={set('name')}
          placeholder="e.g. Priya Nair"
          autoComplete="name"
        />
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
        <Field label="Password" required error={errors.password} hint="Minimum 6 characters">
          <Input
            type="password"
            value={values.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
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

      {/* Submit Button */}
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
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <Icon name="Sparkles" size={18} />
        <span>{busy ? 'Creating Account…' : 'Create My Account'}</span>
      </button>

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
