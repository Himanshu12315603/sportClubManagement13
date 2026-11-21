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
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [joined, setJoined] = useState([]);

  const sport = sportById(sportId);
  const plan = planById(membership?.type);
  const courtDiscountPct = plan?.courtDiscountPct ?? 0;

  // 7-day strip centered on current date range
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(new Date(), i);
      const iso = toISODate(d);
      return {
        iso,
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        isToday: i === 0,
      };
    });
  }, []);

  const slots = useMemo(
    () => (courtId ? buildCourtSlots({ date, courtId, bookings, blocked: maintenance, now: new Date() }) : []),
    [courtId, date, bookings, maintenance]
  );

  const selectedSlot = slots.find((s) => s.start === start) || null;
  const basePrice = sport && selectedSlot ? priceForSlot(sport, selectedSlot.start) : 0;
  const discount = Math.round((basePrice * courtDiscountPct) / 100);
  const payableAmount = Math.max(0, basePrice - discount);

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

  const handlePrevDay = () => {
    const curr = new Date(date);
    const prev = new Date(curr);
    prev.setDate(curr.getDate() - 1);
    const todayIso = toISODate(new Date());
    if (toISODate(prev) >= todayIso) {
      setDate(toISODate(prev));
      setStart('');
    }
  };

  const handleNextDay = () => {
    const curr = new Date(date);
    const next = new Date(curr);
    next.setDate(curr.getDate() + 1);
    setDate(toISODate(next));
    setStart('');
  };

  const handleSlotSelect = (slot) => {
    setStart(slot.start);
    setErrors([]);
    setConfirmModalOpen(true);
  };

  const confirmReservation = () => {
    setErrors([]);
    if (!start) {
      setErrors(['Please choose an available start time.']);
      return;
    }
    const end = selectedSlot?.end || '';
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

    setConfirmModalOpen(false);
    setStart('');
    setPartner('');
    toast(
      'Court Booked Successfully!',
      `${sport?.name} · ${court?.name} on ${formatDate(date)} at ${start}. Confirmation sent to your email.`,
      'success'
    );
    setTab('mine');
  };

  const court = sport?.courts.find((c) => c.id === courtId);

  const historyColumns = [
    { key: 'id', label: 'Ref', render: (r) => <span className="mono tiny semibold">{r.id}</span> },
    {
      key: 'sport',
      label: 'Session',
      render: (r) => (
        <div>
          <div className="small semibold" style={{ color: '#172b4d' }}>{r.sportName}</div>
          <div className="tiny dim">{r.courtName} · {r.players}</div>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'time', label: 'Time', render: (r) => <span className="mono bold">{r.start}–{r.end}</span> },
    {
      key: 'payable',
      label: 'Paid',
      align: 'right',
      render: (r) => (
        <div>
          <div className="semibold" style={{ color: '#16a085' }}>{formatCurrency(r.payable)}</div>
          <div className="tiny dim">−{formatCurrency(r.discount)} discount</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => setSelectedBookingDetails(r)}
          style={{
            background: r.status === 'confirmed' ? '#ddf5ec' : r.status === 'cancelled' ? '#fee2e2' : '#eff6ff',
            border: `1.5px solid ${r.status === 'confirmed' ? '#10b981' : r.status === 'cancelled' ? '#f87171' : '#60a5fa'}`,
            color: r.status === 'confirmed' ? '#065f46' : r.status === 'cancelled' ? '#991b1b' : '#1e40af',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            textTransform: 'capitalize',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          title="Click to view full reservation details & confirmation"
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {r.status === 'confirmed' && <Icon name="CheckCircle2" size={13} />}
          {r.status === 'cancelled' && <Icon name="XCircle" size={13} />}
          {r.status === 'completed' && <Icon name="Check" size={13} />}
          <span>{r.status}</span>
        </button>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) =>
        r.status === 'confirmed' && r.date >= toISODate(new Date()) ? (
          <Button variant="danger" size="sm" icon="X" onClick={() => setCancelTarget(r)}>
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
        subtitle="Book courts with visual availability, member pricing and instant slot confirmation."
        badge={
          <Badge tone={todayCount >= rules.maxBookingsPerDay ? 'warning' : 'active'}>
            <Icon name="Flame" size={13} style={{ marginRight: 4, verticalAlign: '-1px' }} />
            {todayCount}/{rules.maxBookingsPerDay} sessions booked today
          </Badge>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'new', label: 'Book a Court', icon: 'Plus' },
          { id: 'mine', label: 'My Reservations', icon: 'CalendarDays', count: bookings.length },
          { id: 'social', label: 'Social Matchmaking', icon: 'Users', count: socialPlaySessions.length },
        ]}
      />

      {tab === 'new' ? (
        <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: 24, marginTop: 20 }}>
          <div className="cb-stack" style={{ gap: 20 }}>
            {/* 1. Sport Selection */}
            <Card glass>
              <CardTitle icon="Target" title="1. Select Sport" hint="Choose your activity to view specialized courts" />
              <div className="pill-row">
                {bookableSports.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`chip ${sportId === s.id ? 'active' : ''}`}
                    onClick={() => onSportChange(s.id)}
                    style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                  >
                    <Icon name={s.icon} size={15} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                    {s.name}
                  </button>
                ))}
              </div>
            </Card>

            {/* 2. Court Selection */}
            <Card glass>
              <CardTitle icon="MapPin" title="2. Select Court" hint={`Available ${sport?.name} facilities at ClubBloom`} />
              <div className="cb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                {(sport?.courts || []).map((c) => {
                  const isCourtSelected = courtId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCourtId(c.id);
                        setStart('');
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: isCourtSelected ? '2px solid #16a085' : '1px solid var(--border)',
                        background: isCourtSelected ? '#ddf5ec' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isCourtSelected ? '0 4px 14px rgba(22, 160, 133, 0.2)' : 'var(--shadow-sm)',
                      }}
                    >
                      <div className="cb-row between" style={{ marginBottom: 6 }}>
                        <span className="semibold small" style={{ color: isCourtSelected ? '#065f46' : '#172b4d' }}>
                          {c.name}
                        </span>
                        {isCourtSelected ? (
                          <Badge tone="active">Selected</Badge>
                        ) : (
                          <span className="tiny dim mono">{c.id}</span>
                        )}
                      </div>
                      <div className="tiny dim" style={{ marginBottom: 8 }}>
                        {c.surface} {c.indoor ? '· Indoor' : '· Outdoor'}
                      </div>
                      <div className="cb-row wrap" style={{ gap: 6 }}>
                        {c.indoor ? (
                          <Badge tone="neutral">Indoor A/C</Badge>
                        ) : (
                          <Badge tone="neutral">Floodlit</Badge>
                        )}
                        {c.shared && <Badge tone="info">Shared play</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 3. Date Selection & Weekly Calendar Strip */}
            <Card glass>
              <div className="cb-row between wrap" style={{ marginBottom: 16, gap: 10 }}>
                <CardTitle
                  icon="Calendar"
                  title="3. Choose Date"
                  hint="Pick a day or browse weekly calendar"
                />
                <div className="cb-row" style={{ gap: 6 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="ChevronLeft"
                    onClick={handlePrevDay}
                    disabled={date <= toISODate(new Date())}
                    aria-label="Previous day"
                  />
                  <input
                    type="date"
                    className="input"
                    value={date}
                    min={toISODate(new Date())}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setStart('');
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.84rem', width: 'auto' }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="ChevronRight"
                    onClick={handleNextDay}
                    aria-label="Next day"
                  />
                </div>
              </div>

              {/* Weekly visual calendar view */}
              <div className="cb-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
                {weekDays.map((wd) => {
                  const isSelected = wd.iso === date;
                  return (
                    <button
                      key={wd.iso}
                      type="button"
                      onClick={() => {
                        setDate(wd.iso);
                        setStart('');
                      }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 12,
                        border: isSelected ? '2px solid #16a085' : '1px solid var(--border)',
                        background: isSelected ? '#16a085' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#172b4d',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(22, 160, 133, 0.3)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 600 }}>
                        {wd.dayName}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2px 0' }}>
                        {wd.dayNum}
                      </div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.75 }}>
                        {wd.isToday ? 'Today' : wd.month}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 4. Time Slots */}
            <Card glass>
              <CardTitle
                icon="Clock"
                title="4. Select Time Slot"
                hint={`${court?.name || 'Selected Court'} · ${formatDate(date)} · 60-min session length`}
              />
              {slots.length ? (
                <SlotGrid
                  slots={slots}
                  value={start}
                  onSelect={handleSlotSelect}
                  price={(s) => Math.round(priceForSlot(sport, s.start) * (1 - courtDiscountPct / 100))}
                  peak={formatCurrency(sport?.peakPrice || 0)}
                />
              ) : (
                <EmptyState icon="CalendarX" title="No slots available" message="Try picking another court or date." />
              )}
            </Card>

            {errors.length ? (
              <Card glass style={{ borderLeft: '4px solid #ef4444' }}>
                <div className="cb-row" style={{ gap: 10 }}>
                  <Icon name="AlertTriangle" size={18} style={{ color: '#ef4444' }} />
                  <div>
                    {errors.map((e) => (
                      <div key={e} className="small" style={{ color: '#991b1b', fontWeight: 600 }}>{e}</div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          {/* Right Summary Sidebar */}
          <div className="cb-stack" style={{ gap: 20 }}>
            <Card glass glow>
              <CardTitle icon="Receipt" title="Session Overview" hint="Instant summary" />
              <KeyValue label="Sport" value={sport?.name || '—'} />
              <KeyValue label="Court" value={court?.name || '—'} />
              <KeyValue label="Date" value={formatDate(date)} />
              <KeyValue label="Time" value={selectedSlot ? `${selectedSlot.start} – ${selectedSlot.end}` : 'Choose a time slot'} mono />
              <KeyValue label="Format" value={players} />

              <div style={{ margin: '14px 0' }}>
                <Field label="Match Format">
                  <Select
                    value={players}
                    onChange={(e) => setPlayers(e.target.value)}
                    options={[
                      { value: 'Singles', label: 'Singles (1 vs 1)' },
                      { value: 'Doubles', label: 'Doubles (2 vs 2)' },
                      { value: 'Net practice', label: 'Practice / Coaching' },
                    ]}
                  />
                </Field>
                <Field label="Partner / Guest (Optional)">
                  <input
                    className="input"
                    value={partner}
                    placeholder="e.g. Rahul Sharma"
                    onChange={(e) => setPartner(e.target.value)}
                  />
                </Field>
                <Field label="Payment Method">
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    options={[
                      { value: 'upi', label: 'UPI — Google Pay / PhonePe' },
                      { value: 'card', label: 'Credit / Debit Card' },
                      { value: 'cash', label: 'Pay at Counter Desk' },
                    ]}
                  />
                </Field>
              </div>

              <hr className="cb-hairline" />

              <div className="cb-row between small">
                <span className="muted">Standard Fee{selectedSlot?.peak ? ' (Peak)' : ''}</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              <div className="cb-row between small" style={{ marginTop: 8 }}>
                <span className="muted">{plan?.name || 'Member'} Discount ({courtDiscountPct}%)</span>
                <span className="text-success">−{formatCurrency(discount)}</span>
              </div>
              <div className="cb-row between" style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                <span className="semibold" style={{ fontSize: '1rem' }}>Total Payable</span>
                <span className="semibold" style={{ fontSize: '1.4rem', color: '#16a085' }}>
                  {formatCurrency(payableAmount)}
                </span>
              </div>

              <Button
                variant="primary"
                icon="CalendarCheck"
                block
                style={{ marginTop: 18 }}
                onClick={() => setConfirmModalOpen(true)}
                disabled={!selectedSlot}
              >
                {selectedSlot ? 'Review & Confirm Booking' : 'Select a Slot to Book'}
              </Button>
            </Card>

            <InfoNote icon="ShieldCheck">{refundPolicyNote}</InfoNote>
          </div>
        </div>
      ) : null}

      {/* Booking History Tab */}
      {tab === 'mine' ? (
        <div style={{ marginTop: 20 }}>
          <Card glass>
            <CardTitle icon="CalendarDays" title="My Booking History" hint={`${bookings.length} reservations recorded`} />
            <DataTable
              columns={historyColumns}
              rows={bookings}
              empty={<EmptyState icon="CalendarX" title="No reservations yet" message="Book your first court to get started." />}
            />
          </Card>
        </div>
      ) : null}

      {/* Social Play Tab */}
      {tab === 'social' ? (
        <div className="cb-grid cols-2" style={{ gap: 20, marginTop: 20 }}>
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
                  <span className="small muted">{s.joined}/{s.capacity} players registered</span>
                  <span className="semibold" style={{ color: '#16a085' }}>{formatCurrency(s.fee)}</span>
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
                    toast('Joined Social Session!', `${s.title} · ${s.day} ${s.time}`, 'success');
                  }}
                >
                  {isJoined ? 'Registered' : 'Join Session'}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* High-Priority Booking Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Court Reservation"
        subtitle="Review your session details before booking"
        icon="CalendarCheck"
      >
        <div className="cb-stack" style={{ gap: 14 }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div className="cb-row between" style={{ marginBottom: 8 }}>
              <span className="tiny dim text-uppercase" style={{ letterSpacing: 0.5, fontWeight: 700 }}>Activity</span>
              <Badge tone="active">{sport?.name}</Badge>
            </div>
            <div className="cb-row between" style={{ marginBottom: 8 }}>
              <span className="tiny dim">Facility</span>
              <span className="semibold small">{court?.name} ({court?.surface})</span>
            </div>
            <div className="cb-row between" style={{ marginBottom: 8 }}>
              <span className="tiny dim">Date</span>
              <span className="semibold small">{formatDate(date)}</span>
            </div>
            <div className="cb-row between" style={{ marginBottom: 8 }}>
              <span className="tiny dim">Slot Window</span>
              <span className="mono bold" style={{ color: '#16a085' }}>
                {selectedSlot?.start} – {selectedSlot?.end} (60 mins)
              </span>
            </div>
            <div className="cb-row between">
              <span className="tiny dim">Match Type</span>
              <span className="small">{players}{partner ? ` (with ${partner})` : ''}</span>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: '#ddf5ec', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <div className="cb-row between small">
              <span style={{ color: '#065f46' }}>Session Fee</span>
              <span className="mono">{formatCurrency(basePrice)}</span>
            </div>
            <div className="cb-row between small" style={{ marginTop: 4 }}>
              <span style={{ color: '#065f46' }}>Member Discount ({courtDiscountPct}%)</span>
              <span className="mono text-success">−{formatCurrency(discount)}</span>
            </div>
            <div className="cb-row between bold" style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #a7f3d0' }}>
              <span style={{ color: '#065f46' }}>Net Payable ({method.toUpperCase()})</span>
              <span className="mono" style={{ fontSize: '1.2rem', color: '#065f46' }}>
                {formatCurrency(payableAmount)}
              </span>
            </div>
          </div>

          {errors.length ? (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
              {errors.map((e) => (
                <div key={e}>• {e}</div>
              ))}
            </div>
          ) : null}

          <div className="cb-row between" style={{ gap: 12, marginTop: 10 }}>
            <Button variant="ghost" onClick={() => setConfirmModalOpen(false)} style={{ flex: 1 }}>
              Back
            </Button>
            <Button variant="primary" icon="Check" onClick={confirmReservation} style={{ flex: 2 }}>
              Confirm Reservation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        open={Boolean(selectedBookingDetails)}
        onClose={() => setSelectedBookingDetails(null)}
        title="Reservation Details"
        subtitle={`Booking Ref: ${selectedBookingDetails?.id}`}
        icon="CalendarCheck"
      >
        {selectedBookingDetails && (
          <div className="cb-stack" style={{ gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="tiny dim text-uppercase" style={{ letterSpacing: 0.6, fontWeight: 700 }}>
                Status
              </span>
              <Badge tone={BOOKING_STATUS_TONE[selectedBookingDetails.status] || 'neutral'}>
                {selectedBookingDetails.status}
              </Badge>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div className="cb-row between" style={{ marginBottom: 8 }}>
                <span className="tiny dim">Sport & Court</span>
                <span className="semibold small" style={{ color: '#172b4d' }}>
                  {selectedBookingDetails.sportName} · {selectedBookingDetails.courtName}
                </span>
              </div>
              <div className="cb-row between" style={{ marginBottom: 8 }}>
                <span className="tiny dim">Date</span>
                <span className="semibold small">{formatDate(selectedBookingDetails.date)}</span>
              </div>
              <div className="cb-row between" style={{ marginBottom: 8 }}>
                <span className="tiny dim">Slot Window</span>
                <span className="mono bold" style={{ color: '#16a085' }}>
                  {selectedBookingDetails.start} – {selectedBookingDetails.end} (60 mins)
                </span>
              </div>
              <div className="cb-row between" style={{ marginBottom: 8 }}>
                <span className="tiny dim">Match Type</span>
                <span className="small">{selectedBookingDetails.players}</span>
              </div>
              {selectedBookingDetails.partner && selectedBookingDetails.partner !== '—' && (
                <div className="cb-row between" style={{ marginBottom: 8 }}>
                  <span className="tiny dim">Playing Partner</span>
                  <span className="small">{selectedBookingDetails.partner}</span>
                </div>
              )}
              <div className="cb-row between" style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                <span className="tiny dim">Amount Paid ({selectedBookingDetails.paymentMethod})</span>
                <span className="mono bold" style={{ color: '#16a085', fontSize: '1.1rem' }}>
                  {formatCurrency(selectedBookingDetails.payable)}
                </span>
              </div>
            </div>

            <div className="cb-row between" style={{ gap: 10, marginTop: 10 }}>
              <Button
                variant="outline"
                icon="FileText"
                onClick={() => {
                  toast('Receipt Downloaded', `Invoice for ${selectedBookingDetails.id} ready.`, 'info');
                }}
                style={{ flex: 1 }}
              >
                Receipt
              </Button>

              {selectedBookingDetails.status === 'confirmed' ? (
                <Button
                  variant="danger"
                  icon="X"
                  onClick={() => {
                    setCancelTarget(selectedBookingDetails);
                    setSelectedBookingDetails(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel Booking
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedBookingDetails(null)}
                  style={{ flex: 1 }}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancellation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          cancelBooking(cancelTarget.id);
          toast('Booking Cancelled', `${cancelTarget.sportName} session was cancelled.`, 'info');
        }}
        title="Cancel this reservation?"
        message={
          cancelTarget
            ? `${cancelTarget.sportName} · ${cancelTarget.courtName} on ${formatDate(cancelTarget.date)} at ${cancelTarget.start}. ${refundPolicyNote}`
            : ''
        }
        confirmLabel="Yes, Cancel Booking"
      />
    </>
  );
}
