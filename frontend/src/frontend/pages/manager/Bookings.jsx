import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardTitle, ChipGroup, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Icon from '../../components/ui/Icon';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, toISODate } from '../../utils/format';
import { useDebounced } from '../../hooks/useUi';

const statusOptions = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];
const dateOptions = [
  { id: 'all', label: 'All dates' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];
const statusTone = { confirmed: 'info', completed: 'active', cancelled: 'danger' };
const statusLabel = { confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

function RuleRow({ label, value, last }) {
  return (
    <div className="cb-row between small" style={{ padding: '10px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <span className="muted">{label}</span>
      <span className="semibold mono">{value}</span>
    </div>
  );
}

export default function ManagerBookings() {
  const { bookings, members, cancelBooking, updateBookingStatus, rules, toast } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [dateF, setDateF] = useState('all');
  const [cancelId, setCancelId] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Cancelled by manager desk');
  const debounced = useDebounced(q);
  const today = toISODate(new Date());

  const nameById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m.name])), [members]);
  const memberName = (b) => b.memberName || nameById[b.userId] || b.userId;

  const rows = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return bookings
      .filter((b) => {
        const statusOk = status === 'all' || b.status === status;
        const textOk = !needle || [b.sportName, b.courtName, memberName(b), b.partner, b.userId, b.id].some((v) => String(v).toLowerCase().includes(needle));
        let dateOk = true;
        if (dateF === 'today') dateOk = b.date === today;
        else if (dateF === 'upcoming') dateOk = b.date > today;
        else if (dateF === 'past') dateOk = b.date < today;
        return statusOk && textOk && dateOk;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [bookings, status, debounced, dateF, today, nameById]);

  const revenue = bookings.filter((b) => b.status !== 'cancelled').reduce((n, b) => n + (b.payable || 0), 0);

  const columns = [
    {
      key: 'id',
      label: 'Booking ID',
      render: (b) => (
        <button
          type="button"
          onClick={() => setActiveBooking(b)}
          className="mono tiny semibold"
          style={{ background: 'none', border: 'none', color: '#16a085', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {b.id}
        </button>
      ),
    },
    {
      key: 'member',
      label: 'Member',
      render: (b) => (
        <div>
          <div className="small semibold" style={{ color: '#172b4d' }}>{memberName(b)}</div>
          <div className="tiny dim mono">{b.userId}</div>
        </div>
      ),
    },
    {
      key: 'session',
      label: 'Sport · Court',
      render: (b) => (
        <div>
          <div className="small">{b.sportName} · {b.courtName}</div>
          <div className="tiny dim">{b.players || 'Singles'}{b.partner && b.partner !== '—' ? ` · with ${b.partner}` : ''}</div>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (b) => <span className="small dim">{formatDate(b.date)}</span> },
    { key: 'time', label: 'Time', render: (b) => <span className="small mono bold">{b.start}–{b.end}</span> },
    { key: 'payable', label: 'Payable', align: 'right', render: (b) => <span className="small mono semibold">{formatCurrency(b.payable)}</span> },
    {
      key: 'status',
      label: 'Status (Click to Inspect)',
      render: (b) => (
        <button
          type="button"
          onClick={() => setActiveBooking(b)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          title="Click to view details or modify"
        >
          <Badge
            tone={statusTone[b.status] || 'neutral'}
            icon={b.status === 'confirmed' ? 'CheckCircle2' : b.status === 'completed' ? 'Trophy' : 'XCircle'}
          >
            {statusLabel[b.status] || b.status}
          </Badge>
        </button>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (
        <div className="cb-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="ghost" icon="Eye" onClick={() => setActiveBooking(b)}>
            Details
          </Button>
          {b.status === 'confirmed' ? (
            <Button size="sm" variant="danger" icon="CalendarX" onClick={() => setCancelId(b.id)}>
              Cancel
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="CalendarCheck"
        title="Club Bookings"
        subtitle="Live court reservations across all sports with real-time status management and member logs."
        badge={<Badge tone="active">{bookings.length} reservations</Badge>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="CalendarDays" label="Total Bookings" value={bookings.length} detail="Lifetime reservations" />
        <StatCard icon="CheckCircle2" tone="green" label="Confirmed" value={bookings.filter((b) => b.status === 'confirmed').length} detail="Upcoming sessions" delay={0.05} />
        <StatCard icon="Trophy" tone="gold" label="Completed" value={bookings.filter((b) => b.status === 'completed').length} detail="Finished matches" delay={0.1} />
        <StatCard icon="Wallet" label="Booking Revenue" value={formatCurrency(revenue, true)} detail={`${bookings.filter((b) => b.status === 'cancelled').length} cancellations`} delay={0.15} />
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="CalendarCheck" title="Reservation Schedule" hint={`${rows.length} matches found`} />
          <div className="cb-row wrap" style={{ gap: 10, marginBottom: 14 }}>
            <SearchInput value={q} onChange={setQ} placeholder="Search member, ID, sport or court…" />
            <ChipGroup options={statusOptions} value={status} onChange={(o) => setStatus(o.id)} />
            <ChipGroup options={dateOptions} value={dateF} onChange={(o) => setDateF(o.id)} />
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            empty={<EmptyState icon="CalendarX" title="No bookings match" message="Adjust the search query or status filter." />}
          />
        </Card>

        <Card glass>
          <CardTitle icon="ClipboardCheck" title="Booking Rules Engine" hint="Enforced across the sports club" />
          <div className="cb-stack" style={{ gap: 0 }}>
            <RuleRow label="Standard Session" value={`${rules.sessionMinutes} minutes`} />
            <RuleRow label="Slot Grid Interval" value={`${rules.slotStepMinutes} minutes`} />
            <RuleRow label="Max Daily / Member" value={`${rules.maxBookingsPerDay} sessions`} />
            <RuleRow label="Club Opens" value={rules.openingTime} />
            <RuleRow label="Club Closes" value={rules.closingTime} />
            <RuleRow label="Peak Hours" value={rules.peakWindows.map(([a, b]) => `${a}–${b}`).join(' · ')} last />
          </div>
          <div style={{ marginTop: 18, padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div className="tiny dim semibold" style={{ marginBottom: 4 }}>MANAGER DESK TIP</div>
            <p className="tiny">
              Click on any <strong>Confirmed</strong> status badge or row to open full reservation credentials, verify payment, complete session, or issue refunds.
            </p>
          </div>
        </Card>
      </div>

      {/* Booking Details & Status Control Modal */}
      <Modal
        open={Boolean(activeBooking)}
        onClose={() => setActiveBooking(null)}
        title="Reservation Details & Desk Actions"
        subtitle={activeBooking ? `Reference: ${activeBooking.id}` : ''}
        icon="CalendarCheck"
      >
        {activeBooking && (
          <div className="cb-stack" style={{ gap: 16 }}>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid var(--border)' }}>
              <div className="cb-row between" style={{ marginBottom: 10 }}>
                <span className="tiny dim">CURRENT STATUS</span>
                <Badge tone={statusTone[activeBooking.status] || 'neutral'}>
                  {statusLabel[activeBooking.status] || activeBooking.status}
                </Badge>
              </div>

              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Member Name</span>
                <span className="semibold">{memberName(activeBooking)}</span>
              </div>
              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Member ID</span>
                <span className="mono">{activeBooking.userId}</span>
              </div>
              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Sport & Court</span>
                <span className="semibold">{activeBooking.sportName} · {activeBooking.courtName}</span>
              </div>
              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Date & Time</span>
                <span className="semibold mono">{formatDate(activeBooking.date)} at {activeBooking.start}–{activeBooking.end}</span>
              </div>
              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Format & Partner</span>
                <span>{activeBooking.players || 'Singles'}{activeBooking.partner && activeBooking.partner !== '—' ? ` (with ${activeBooking.partner})` : ''}</span>
              </div>
              <div className="cb-row between small">
                <span className="muted">Payment Method</span>
                <Badge tone="active">{activeBooking.paymentMethod || 'UPI'}</Badge>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: '#ddf5ec', borderRadius: 12, border: '1px solid #a7f3d0' }}>
              <div className="cb-row between small">
                <span style={{ color: '#065f46' }}>Gross Fee</span>
                <span className="mono">{formatCurrency(activeBooking.price || activeBooking.payable)}</span>
              </div>
              {activeBooking.discount > 0 && (
                <div className="cb-row between small" style={{ marginTop: 4 }}>
                  <span style={{ color: '#065f46' }}>Membership Discount</span>
                  <span className="mono text-success">−{formatCurrency(activeBooking.discount)}</span>
                </div>
              )}
              <div className="cb-row between bold" style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #a7f3d0' }}>
                <span style={{ color: '#065f46' }}>Amount Paid</span>
                <span className="mono" style={{ fontSize: '1.2rem', color: '#065f46' }}>
                  {formatCurrency(activeBooking.payable)}
                </span>
              </div>
            </div>

            <div className="cb-stack" style={{ gap: 8 }}>
              <div className="tiny dim bold">DESK ACTIONS:</div>
              <div className="cb-row wrap" style={{ gap: 10 }}>
                {activeBooking.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    icon="CheckCircle2"
                    style={{ flex: 1 }}
                    onClick={() => {
                      updateBookingStatus(activeBooking.id, 'completed');
                      setActiveBooking((b) => ({ ...b, status: 'completed' }));
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}

                {activeBooking.status === 'confirmed' && (
                  <Button
                    variant="danger"
                    icon="CalendarX"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setCancelId(activeBooking.id);
                      setActiveBooking(null);
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}

                <Button
                  variant="outline"
                  icon="Printer"
                  style={{ flex: 1 }}
                  onClick={() => {
                    toast('Receipt Downloaded', `Generated receipt for booking ${activeBooking.id}.`, 'success');
                  }}
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Cancellations */}
      <ConfirmDialog
        open={Boolean(cancelId)}
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          cancelBooking(cancelId, cancelReason);
          toast('Booking cancelled', `Reservation ${cancelId} was cancelled.`, 'info');
          setCancelId(null);
        }}
        title="Cancel Court Reservation?"
        message={`Are you sure you want to cancel booking ${cancelId}? The slot will immediately become available for other members.`}
        confirmLabel="Confirm Cancellation"
      />
    </div>
  );
}
