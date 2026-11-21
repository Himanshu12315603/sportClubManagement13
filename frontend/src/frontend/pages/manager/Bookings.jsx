import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardTitle, ChipGroup, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import { ConfirmDialog } from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
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

export default function ManagerBookings() {
  const { bookings, members, cancelBooking, rules } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [dateF, setDateF] = useState('all');
  const [cancelId, setCancelId] = useState(null);
  const debounced = useDebounced(q);
  const today = toISODate(new Date());

  const nameById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m.name])), []);
  const memberName = (b) => nameById[b.userId] || b.userId;

  const rows = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return bookings
      .filter((b) => {
        const statusOk = status === 'all' || b.status === status;
        const textOk = !needle || [b.sportName, b.courtName, memberName(b), b.partner, b.userId].some((v) => String(v).toLowerCase().includes(needle));
        let dateOk = true;
        if (dateF === 'today') dateOk = b.date === today;
        else if (dateF === 'upcoming') dateOk = b.date > today;
        else if (dateF === 'past') dateOk = b.date < today;
        return statusOk && textOk && dateOk;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, status, debounced, dateF, today, nameById]);

  const revenue = bookings.filter((b) => b.status !== 'cancelled').reduce((n, b) => n + (b.payable || 0), 0);

  const columns = [
    { key: 'member', label: 'Member', render: (b) => <span className="small semibold">{memberName(b)}</span> },
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
    { key: 'time', label: 'Time', render: (b) => <span className="small mono">{b.start}–{b.end}</span> },
    { key: 'payable', label: 'Payable', align: 'right', render: (b) => <span className="small mono semibold">{formatCurrency(b.payable)}</span> },
    { key: 'status', label: 'Status', render: (b) => <Badge tone={statusTone[b.status] || 'neutral'}>{statusLabel[b.status] || b.status}</Badge> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (b.status === 'confirmed' ? <Button size="sm" variant="danger" icon="CalendarX" onClick={() => setCancelId(b.id)}>Cancel</Button> : <span className="tiny dim">—</span>),
    },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="CalendarCheck"
        title="Club bookings"
        subtitle="Every court reservation across the club, with live status and cancellations."
        badge={<Badge tone="info">{bookings.length} total</Badge>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="CalendarDays" label="Total bookings" value={bookings.length} detail="All statuses" />
        <StatCard icon="CheckCircle2" tone="green" label="Confirmed" value={bookings.filter((b) => b.status === 'confirmed').length} detail="Upcoming sessions" delay={0.05} />
        <StatCard icon="Trophy" tone="gold" label="Completed" value={bookings.filter((b) => b.status === 'completed').length} detail="Played sessions" delay={0.1} />
        <StatCard icon="Wallet" label="Revenue" value={formatCurrency(revenue, true)} detail={`${bookings.filter((b) => b.status === 'cancelled').length} cancelled`} delay={0.15} />
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="CalendarCheck" title="All bookings" hint={`${rows.length} shown`} />
          <div className="cb-row wrap" style={{ gap: 10, marginBottom: 14 }}>
            <SearchInput value={q} onChange={setQ} placeholder="Search member, sport or court…" />
            <ChipGroup options={statusOptions} value={status} onChange={(o) => setStatus(o.id)} />
            <ChipGroup options={dateOptions} value={dateF} onChange={(o) => setDateF(o.id)} />
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            empty={<EmptyState icon="CalendarX" title="No bookings match" message="Adjust the search, status or date filters." />}
          />
        </Card>

        <Card glass>
          <CardTitle icon="ClipboardCheck" title="Booking rules" hint="Applied to every reservation" />
          <div className="cb-stack" style={{ gap: 0 }}>
            <RuleRow label="Session length" value={`${rules.sessionMinutes} minutes`} />
            <RuleRow label="Start-time grid" value={`${rules.slotStepMinutes}-minute slots`} />
            <RuleRow label="Max per member / day" value={`${rules.maxBookingsPerDay} sessions`} />
            <RuleRow label="Opening time" value={rules.openingTime} />
            <RuleRow label="Closing time" value={rules.closingTime} />
            <RuleRow label="Peak windows" value={rules.peakWindows.map(([a, b]) => `${a}–${b}`).join(' · ')} last />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={() => { cancelBooking(cancelId); setCancelId(null); }}
        title="Cancel this booking?"
        message="The slot will be released back to the club and the member notified."
        confirmLabel="Cancel booking"
        tone="danger"
        icon="CalendarX"
      />
    </div>
  );
}

function RuleRow({ label, value, last }) {
  return (
    <div className="cb-row between" style={{ padding: '10px 0', borderBottom: last ? 'none' : '1px solid rgba(38,50,71,0.5)' }}>
      <span className="small muted">{label}</span>
      <span className="small semibold mono">{value}</span>
    </div>
  );
}
