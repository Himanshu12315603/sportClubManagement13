import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  buildCourtSlots,
  bookableSports,
  priceForSlot,
  refundPolicyNote,
  socialPlaySessions,
  sportById,
  toISODate,
} from '../../data/courts';
import { planById } from '../../data/membershipPlans';
import { addDays, formatCurrency, formatDate } from '../../utils/format';
import SlotGrid from '../../components/booking/SlotGrid';
import {
  Badge,
  Button,
  Card,
  CardTitle,
  EmptyState,
  InfoNote,
  KeyValue,
  PageHeader,
  Tabs,
} from '../../components/ui/primitives';
import { Field, Select } from '../../components/ui/form';
import DataTable from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';

const BOOKING_STATUS_TONE = { confirmed: 'active', completed: 'info', cancelled: 'danger' };

export default function Bookings() {
  const { bookings, createBooking, cancelBooking, maintenance, membership, rules, toast, pushNotification } = useApp();

  const [tab, setTab] = useState('new');
  const [sportId, setSportId] = useState(bookableSports[0]?.id || 'tennis');
  const [courtId, setCourtId] = useState(bookableSports[0]?.courts[0]?.id || '');
  const [date, setDate] = useState(toISODate(new Date()));
  const [start, setStart] = useState('');
  const [players, setPlayers] = useState('Doubles');
  const [partner, setPartner] = useState('');
  const [method, setMethod] = useState('upi');
  const [errors, setErrors] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [joined, setJoined] = useState([]);

  const sport = sportById(sportId);
  const plan = planById(membership?.type);
  const courtDiscountPct = plan?.courtDiscountPct ?? 0;

  const dateOptions = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const d = addDays(new Date(), i);
        return { id: toISODate(d), label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) };
      }),
    []
  );

  const slots = useMemo(
    () => (courtId ? buildCourtSlots({ date, courtId, bookings, blocked: maintenance, now: new Date() }) : []),
    [courtId, date, bookings, maintenance]
  );

  const selectedSlot = slots.find((s) => s.start === start) || null;
  const basePrice = sport && selectedSlot ? priceForSlot(sport, selectedSlot.start) : 0;
  const discount = Math.round((basePrice * courtDiscountPct) / 100);

  const todayCount = bookings.filter(
    (b) => b.userId === membership?.userId && b.date === toISODate(new Date()) && b.status !== 'cancelled'
  ).length;

  const onSportChange = (id) => {
    setSportId(id);
    const first = sportById(id)?.courts[0]?.id || '';
    setCourtId(first);
    setStart('');
    setErrors([]);
  };

  const submit = () => {
    setErrors([]);
    if (!start) {
      setErrors(['Please choose an available start time.']);
      return;
    }
    const end = selectedSlot.end;
    const res = createBooking({
      sportId,
      courtId,
      date,
      start,
      end,
      players,
      partner: partner || '—',
      paymentMethod: method.toUpperCase(),
    });
    if (!res.ok) {
      setErrors(res.errors || ['Booking could not be completed.']);
      return;
    }
    setStart('');
    setPartner('');
    setTab('mine');
  };

  const historyColumns = [
    { key: 'id', label: 'Ref', render: (r) => <span className="mono tiny">{r.id}</span> },
    {
      key: 'sport',
      label: 'Session',
      render: (r) => (
        <div>
          <div className="small semibold">{r.sportName}</div>
          <div className="tiny dim">{r.courtName} · {r.players}</div>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'time', label: 'Time', render: (r) => <span className="mono">{r.start}–{r.end}</span> },
    {
      key: 'payable',
      label: 'Paid',
      align: 'right',
      render: (r) => (
        <div>
          <div className="semibold">{formatCurrency(r.payable)}</div>
          <div className="tiny dim">−{formatCurrency(r.discount)} saved</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'right',
      render: (r) => <Badge tone={BOOKING_STATUS_TONE[r.status] || 'neutral'}>{r.status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) =>
        r.status === 'confirmed' && r.date >= toISODate(new Date()) ? (
          <Button variant="ghost" size="sm" icon="X" onClick={() => setCancelTarget(r)}>
            Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        icon="CalendarPlus"
        title="Court Booking"
        subtitle="Pick a sport, court, date and a one-hour slot. Maximum 2 sessions per day."
        actions={
          <Badge tone="info">
            <Icon name="Flame" size={12} style={{ marginRight: 5, verticalAlign: '-1px' }} />
            {todayCount}/{rules.maxBookingsPerDay} booked today
          </Badge>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'new', label: 'New booking', icon: 'Plus' },
          { id: 'mine', label: 'My bookings', icon: 'CalendarDays', count: bookings.length },
          { id: 'social', label: 'Social play', icon: 'Users', count: socialPlaySessions.length },
        ]}
      />

      {tab === 'new' ? (
        <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 22, marginTop: 18 }}>
          <div className="cb-stack">
            <Card glass>
              <CardTitle icon="Target" title="Choose your sport" hint="Availability refreshes live from the club calendar" />
              <div className="pill-row" style={{ marginBottom: 18 }}>
                {bookableSports.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`chip ${sportId === s.id ? 'active' : ''}`}
                    onClick={() => onSportChange(s.id)}
                  >
                    <Icon name={s.icon} size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                    {s.name}
                  </button>
                ))}
              </div>

              <div className="cb-grid cols-2" style={{ gap: 14 }}>
                <Field label="Court">
                  <Select
                    value={courtId}
                    onChange={(e) => {
                      setCourtId(e.target.value);
                      setStart('');
                    }}
                    options={(sport?.courts || []).map((c) => ({
                      value: c.id,
                      label: `${c.name} · ${c.surface}${c.indoor ? ' · Indoor' : ''}${c.shared ? ' · Shared' : ''}`,
                    }))}
                  />
                </Field>
                <Field label="Date">
                  <Select value={date} onChange={(e) => { setDate(e.target.value); setStart(''); }} options={dateOptions} />
                </Field>
              </div>
            </Card>

            <Card glass>
              <CardTitle icon="Clock" title="Pick a start time" hint={`${sport?.hours || ''} · every session lasts one hour`} />
              {slots.length ? (
                <SlotGrid
                  slots={slots}
                  value={start}
                  onSelect={(s) => { setStart(s.start); setErrors([]); }}
                  price={(s) => Math.round(priceForSlot(sport, s.start) * (1 - courtDiscountPct / 100))}
                  peak={formatCurrency(sport?.peakPrice || 0)}
                />
              ) : (
                <EmptyState icon="CalendarX" title="No slots available" message="Choose a different court or date." />
              )}
            </Card>

            {errors.length ? (
              <Card glass neon>
                <div className="cb-row" style={{ gap: 10 }}>
                  <Icon name="AlertTriangle" size={18} className="text-neon" />
                  <div>
                    {errors.map((e) => (
                      <div key={e} className="small">{e}</div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          <div className="cb-stack">
            <Card glass glow>
              <CardTitle icon="Receipt" title="Booking summary" />
              <KeyValue label="Sport" value={sport?.name || '—'} />
              <KeyValue label="Court" value={sport?.courts.find((c) => c.id === courtId)?.name || '—'} />
              <KeyValue label="Date" value={formatDate(date)} />
              <KeyValue label="Time" value={selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : 'Select a slot'} mono />
              <KeyValue label="Players" value={players} />
              <div style={{ margin: '14px 0' }}>
                <Field label="Match type">
                  <Select
                    value={players}
                    onChange={(e) => setPlayers(e.target.value)}
                    options={[
                      { value: 'Singles', label: 'Singles' },
                      { value: 'Doubles', label: 'Doubles' },
                      { value: 'Net practice', label: 'Net practice' },
                    ]}
                  />
                </Field>
                <Field label="Partner / group (optional)">
                  <input className="input" value={partner} placeholder="e.g. Sneha P." onChange={(e) => setPartner(e.target.value)} />
                </Field>
                <Field label="Payment method">
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    options={[
                      { value: 'upi', label: 'UPI — GPay / PhonePe' },
                      { value: 'card', label: 'Card' },
                      { value: 'cash', label: 'Cash at counter' },
                    ]}
                  />
                </Field>
              </div>
              <hr className="cb-hairline" />
              <div className="cb-row between small">
                <span className="muted">Court fee{selectedSlot?.peak ? ' (peak)' : ''}</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              <div className="cb-row between small" style={{ marginTop: 8 }}>
                <span className="muted">{plan?.name || 'Membership'} discount ({courtDiscountPct}%)</span>
                <span className="text-success">−{formatCurrency(discount)}</span>
              </div>
              <div className="cb-row between" style={{ marginTop: 12 }}>
                <span className="semibold">Payable now</span>
                <span className="semibold" style={{ fontSize: '1.3rem' }}>{formatCurrency(basePrice - discount)}</span>
              </div>
              <Button icon="Check" block style={{ marginTop: 16 }} onClick={submit} disabled={!selectedSlot}>
                Confirm booking
              </Button>
            </Card>

            <InfoNote icon="Info">{refundPolicyNote}</InfoNote>
          </div>
        </div>
      ) : null}

      {tab === 'mine' ? (
        <div style={{ marginTop: 18 }}>
          <Card glass>
            <CardTitle icon="CalendarDays" title="Booking history" hint={`${bookings.length} total sessions`} />
            <DataTable columns={historyColumns} rows={bookings} empty={<EmptyState icon="CalendarX" title="No bookings yet" message="Book your first session to get started." />} />
          </Card>
        </div>
      ) : null}

      {tab === 'social' ? (
        <div className="cb-grid cols-2" style={{ gap: 18, marginTop: 18 }}>
          {socialPlaySessions.map((s) => {
            const isJoined = joined.includes(s.id);
            return (
              <Card key={s.id} glass>
                <div className="cb-row between">
                  <div>
                    <h4>{s.title}</h4>
                    <div className="tiny dim">{s.level} · {s.day} {s.time} · {s.courtId}</div>
                  </div>
                  <Badge tone="info">{s.sport}</Badge>
                </div>
                <div className="cb-row between" style={{ marginTop: 14 }}>
                  <span className="small muted">{s.joined}/{s.capacity} players joined</span>
                  <span className="semibold">{formatCurrency(s.fee)}</span>
                </div>
                <div className="progress" style={{ marginTop: 10 }}>
                  <span style={{ width: `${Math.round((s.joined / s.capacity) * 100)}%` }} />
                </div>
                <Button
                  variant={isJoined ? 'outline' : 'primary'}
                  icon={isJoined ? 'Check' : 'Users'}
                  size="sm"
                  block
                  style={{ marginTop: 14 }}
                  disabled={isJoined}
                  onClick={() => {
                    setJoined((prev) => [...prev, s.id]);
                    pushNotification('booking_confirmed', `You joined ${s.title} on ${s.day} at ${s.time}.`, 'customer');
                    toast('Added to social play', `${s.title} · ${s.day} ${s.time}`, 'success');
                  }}
                >
                  {isJoined ? 'Joined' : 'Join shared court'}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelBooking(cancelTarget.id)}
        title="Cancel this booking?"
        message={cancelTarget ? `${cancelTarget.sportName} · ${cancelTarget.courtName} on ${formatDate(cancelTarget.date)} at ${cancelTarget.start}. ${refundPolicyNote}` : ''}
        confirmLabel="Cancel booking"
      />
    </>
  );
}
