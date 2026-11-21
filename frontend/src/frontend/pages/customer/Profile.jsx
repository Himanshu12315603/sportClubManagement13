import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { planById } from '../../data/membershipPlans';
import { formatDate } from '../../utils/format';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardTitle,
  KeyValue,
  PageHeader,
  ProgressBar,
  Tabs,
} from '../../components/ui/primitives';
import { Field, FormRow, Input, Select, validateFields } from '../../components/ui/form';
import { ConfirmDialog } from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';

const SPORTS = ['Tennis', 'Padel', 'Badminton', 'Cricket', 'Fitness'];
const SLOTS = ['Morning (06:00 – 10:00)', 'Afternoon (12:00 – 16:00)', 'Evening (18:00 – 21:00)', 'Late (21:00 – 23:00)'];

export default function Profile() {
  const { profile, user, updateProfile, membership, membershipStatus, gardenState, stats, bookings, logout } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('details');
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    dob: profile?.dob || '',
    gender: profile?.gender || '',
    emergencyContact: profile?.emergencyContact || '',
  });
  const [favouriteSports, setFavouriteSports] = useState(profile?.favouriteSports || []);
  const [preferredSlot, setPreferredSlot] = useState(profile?.preferredSlot || SLOTS[2]);
  const [errors, setErrors] = useState({});
  const [confirmLogout, setConfirmLogout] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const plan = planById(membership?.type);

  const saveDetails = () => {
    const { valid, errors: errs } = validateFields(form, {
      name: { required: true, message: 'Please enter your name.' },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
    });
    setErrors(errs);
    if (!valid) {
      setTab('details');
      return;
    }
    updateProfile(form);
  };

  const savePreferences = () => updateProfile({ favouriteSports, preferredSlot });

  const toggleSport = (s) =>
    setFavouriteSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <>
      <PageHeader
        icon="User"
        title="My Profile"
        subtitle="Manage your details, playing preferences and account security."
        badge={<Badge tone={gardenState.tone.replace('badge-', '')}>{membershipStatus}</Badge>}
        actions={
          <Button variant="danger" icon="LogOut" onClick={() => setConfirmLogout(true)}>
            Sign out
          </Button>
        }
      />

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.7fr)', gap: 22 }}>
        <div className="cb-stack">
          <Card glass glow>
            <div className="cb-stack center-text" style={{ alignItems: 'center', gap: 12 }}>
              <Avatar name={profile?.name} seed={user?.avatarSeed} size={82} />
              <div>
                <h3>{profile?.name}</h3>
                <div className="tiny dim">{profile?.email}</div>
              </div>
              <Badge tone={gardenState.tone.replace('badge-', '')}>{plan?.name || 'Member'} · {membershipStatus}</Badge>
              <div className="cb-row center" style={{ gap: 18, marginTop: 6 }}>
                <div className="center-text">
                  <div className="semibold" style={{ fontSize: '1.3rem' }}>{stats.totalSessions}</div>
                  <div className="tiny dim">Sessions</div>
                </div>
                <div className="center-text">
                  <div className="semibold" style={{ fontSize: '1.3rem' }}>{stats.streakWeeks}</div>
                  <div className="tiny dim">Week streak</div>
                </div>
                <div className="center-text">
                  <div className="semibold" style={{ fontSize: '1.3rem' }}>{gardenState.stage.level}</div>
                  <div className="tiny dim">Garden stage</div>
                </div>
              </div>
            </div>
          </Card>

          <Card glass>
            <CardTitle icon="Crown" title="Membership" />
            <KeyValue label="Plan" value={plan?.name || '—'} />
            <KeyValue label="Member since" value={formatDate(user?.memberSince)} />
            <KeyValue label="Expires" value={formatDate(membership?.expiryDate)} />
            <KeyValue label="Locker" value={profile?.lockerNo || '—'} mono />
            <div style={{ marginTop: 14 }}>
              <ProgressBar value={gardenState.lifespanPct} label="Validity" showLabel tone={gardenState.alive ? 'green' : 'neon'} />
            </div>
          </Card>

          <Card glass>
            <CardTitle icon="Activity" title="Lifetime activity" />
            <KeyValue label="Total bookings" value={bookings.length} mono />
            <KeyValue label="Hours played" value={`${stats.hoursPlayed} hrs`} mono />
            <KeyValue label="Favourite sport" value={stats.favouriteSport} />
            <KeyValue label="Win rate" value={`${stats.winRate}%`} mono />
            <KeyValue label="Loyalty points" value={stats.loyaltyPoints} mono />
          </Card>
        </div>

        <div>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'details', label: 'Personal details', icon: 'User' },
              { id: 'preferences', label: 'Playing preferences', icon: 'Target' },
              { id: 'security', label: 'Security', icon: 'Lock' },
            ]}
          />

          <div style={{ marginTop: 18 }}>
            {tab === 'details' ? (
              <Card glass>
                <CardTitle icon="User" title="Personal details" hint="Used for bookings and club communication" />
                <FormRow cols={2}>
                  <Field label="Full name" required error={errors.name}>
                    <Input value={form.name} error={errors.name} onChange={set('name')} placeholder="Your name" />
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" value={form.email} error={errors.email} onChange={set('email')} placeholder="you@example.com" />
                  </Field>
                  <Field label="Phone" required error={errors.phone}>
                    <Input value={form.phone} error={errors.phone} onChange={set('phone')} placeholder="+91 …" />
                  </Field>
                  <Field label="City">
                    <Input value={form.city} onChange={set('city')} placeholder="City" />
                  </Field>
                  <Field label="Date of birth">
                    <Input type="date" value={form.dob} onChange={set('dob')} />
                  </Field>
                  <Field label="Gender">
                    <Select
                      value={form.gender}
                      onChange={set('gender')}
                      placeholder="Select"
                      options={['Female', 'Male', 'Other', 'Prefer not to say'].map((g) => ({ value: g, label: g }))}
                    />
                  </Field>
                </FormRow>
                <Field label="Emergency contact" hint="Name and phone number">
                  <Input value={form.emergencyContact} onChange={set('emergencyContact')} placeholder="Name · +91 …" />
                </Field>
                <Button icon="Save" onClick={saveDetails}>Save changes</Button>
              </Card>
            ) : null}

            {tab === 'preferences' ? (
              <Card glass>
                <CardTitle icon="Target" title="Playing preferences" hint="Helps ClubBloom AI recommend the right sessions" />
                <Field label="Favourite sports">
                  <div className="pill-row">
                    {SPORTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`chip ${favouriteSports.includes(s) ? 'active' : ''}`}
                        onClick={() => toggleSport(s)}
                      >
                        {favouriteSports.includes(s) ? <Icon name="Check" size={12} style={{ marginRight: 5, verticalAlign: '-1px' }} /> : null}
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Preferred playing slot">
                  <Select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    options={SLOTS.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
                <Field label="Playing level">
                  <Select
                    value={profile?.handoverLevel || 'Intermediate'}
                    onChange={(e) => updateProfile({ handoverLevel: e.target.value })}
                    options={['Beginner', 'Intermediate', 'Advanced', 'Competitive'].map((l) => ({ value: l, label: l }))}
                  />
                </Field>
                <Button icon="Save" onClick={savePreferences}>Save preferences</Button>
              </Card>
            ) : null}

            {tab === 'security' ? (
              <Card glass>
                <CardTitle icon="Lock" title="Security" hint="Demo account — passwords are not stored server-side" />
                <FormRow cols={2}>
                  <Field label="Current password">
                    <Input type="password" placeholder="••••••••" />
                  </Field>
                  <Field label="New password" hint="Minimum 6 characters">
                    <Input type="password" placeholder="••••••••" />
                  </Field>
                </FormRow>
                <Button icon="KeyRound" onClick={() => updateProfile({})}>Update password</Button>
                <hr className="cb-hairline" />
                <div className="cb-row between wrap" style={{ gap: 12 }}>
                  <div>
                    <div className="small semibold">Two-factor authentication</div>
                    <div className="tiny dim">Add an extra layer of security to your account.</div>
                  </div>
                  <Button variant="outline" icon="ShieldCheck" onClick={() => updateProfile({})}>Enable 2FA</Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
        title="Sign out of ClubBloom?"
        message="You can sign back in any time with your demo account."
        confirmLabel="Sign out"
        icon="LogOut"
      />
    </>
  );
}
