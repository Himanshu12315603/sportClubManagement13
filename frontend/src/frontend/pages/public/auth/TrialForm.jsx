import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Badge, Button, Card } from '../../../components/ui/primitives';
import { Field, FormRow, Input, Select, validateFields } from '../../../components/ui/form';
import { useApp } from '../../../context/AppContext';
import { trialSports, trialTimeSlots } from '../../../data/trials';
import { toISODate, addDays, formatDate } from '../../../utils/format';

/** Free-trial booking form with a success confirmation state. */
export default function TrialForm() {
  const { toast, pushNotification } = useApp();
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    sport: '',
    date: toISODate(addDays(new Date(), 1)),
    slot: '',
  });
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(null);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateFields(values, {
      name: { required: true },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      sport: { required: true },
      slot: { required: true },
    });
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const ref = `TR-${Math.floor(Math.random() * 900 + 100)}`;
    setConfirmed({ ...values, ref });
    pushNotification('trial_approved', `Trial request ${ref} received for ${values.sport} on ${formatDate(values.date)} at ${values.slot}.`, 'customer');
    toast('Trial requested', `${values.sport} · ${values.slot} · ref ${ref}`, 'success');
  };

  if (confirmed) {
    return (
      <Card glass glow style={{ textAlign: 'center', padding: 36 }}>
        <span className="stat-icon green" style={{ width: 58, height: 58, borderRadius: 18, margin: '0 auto 16px' }}>
          <Icon name="CheckCircle2" size={26} />
        </span>
        <h3 style={{ marginBottom: 8 }}>Your trial is booked!</h3>
        <p className="small" style={{ marginBottom: 20 }}>
          We have reserved your slot. A coach will greet you at reception and show you around.
        </p>

        <div className="cb-card" style={{ textAlign: 'left', padding: 16, marginBottom: 20 }}>
          <div className="cb-row between small"><span className="muted">Reference</span><span className="mono semibold">{confirmed.ref}</span></div>
          <div className="cb-row between small" style={{ marginTop: 8 }}><span className="muted">Sport</span><span style={{ textTransform: 'capitalize' }}>{confirmed.sport}</span></div>
          <div className="cb-row between small" style={{ marginTop: 8 }}><span className="muted">Date</span><span>{formatDate(confirmed.date)}</span></div>
          <div className="cb-row between small" style={{ marginTop: 8 }}><span className="muted">Time</span><span>{confirmed.slot}</span></div>
        </div>

        <div className="cb-row center wrap" style={{ gap: 12 }}>
          <Button icon="Crown" as={Link} to="/membership">See membership plans</Button>
          <Button variant="ghost" icon="RotateCcw" onClick={() => setConfirmed(null)}>Book another slot</Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <FormRow cols={2}>
        <Field label="Full name" required error={errors.name}>
          <Input value={values.name} onChange={set('name')} placeholder="Your name" />
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <Input value={values.phone} onChange={set('phone')} placeholder="+91 98450 00000" />
        </Field>
      </FormRow>

      <Field label="Email" required error={errors.email}>
        <Input type="email" value={values.email} onChange={set('email')} placeholder="you@email.com" />
      </Field>

      <FormRow cols={2}>
        <Field label="Sport" required error={errors.sport}>
          <Select value={values.sport} onChange={set('sport')} options={trialSports} placeholder="Choose a sport" />
        </Field>
        <Field label="Preferred date" required>
          <Input type="date" value={values.date} min={toISODate(new Date())} onChange={set('date')} />
        </Field>
      </FormRow>

      <Field label="Preferred time slot" required error={errors.slot}>
        <div className="pill-row">
          {trialTimeSlots.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${values.slot === s ? 'active' : ''}`}
              onClick={() => setValues((v) => ({ ...v, slot: s }))}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>

      <div className="cb-row wrap" style={{ gap: 8, marginBottom: 16 }}>
        <Badge tone="info" icon="Gift">Free</Badge>
        <Badge tone="neutral" icon="Clock">60 minutes</Badge>
        <Badge tone="neutral" icon="Users">Coach included</Badge>
      </div>

      <Button type="submit" block size="lg" icon="CalendarCheck">Confirm my free trial</Button>
      <p className="tiny dim center-text" style={{ marginTop: 12 }}>
        No card required. We will never share your details.
      </p>
    </form>
  );
}
