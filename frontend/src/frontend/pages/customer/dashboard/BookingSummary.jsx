import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, EmptyState, ProgressBar } from '../../../components/ui/primitives';
import { useApp } from '../../../context/AppContext';
import { toISODate } from '../../../utils/format';

const today = toISODate(new Date());

/** Next booking + simple booking statistics. */
export default function BookingSummary() {
  const { bookings, stats, rules } = useApp();

  const upcoming = bookings
    .filter((b) => b.status === 'confirmed' && b.date >= today)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  const next = upcoming[0];
  const played = bookings.filter((b) => b.status === 'completed').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
  const monthPct = Math.min(100, Math.round((stats.sessionsThisMonth / 12) * 100));

  return (
    <Card glass>
      <CardTitle icon="CalendarDays" title="Next booking" hint={`${rules.maxBookingsPerDay} sessions/day limit`} right={<Button size="sm" variant="outline" as={Link} to="/app/bookings">Manage</Button>} />

      {next ? (
        <div className="cb-card" style={{ padding: 16, background: 'linear-gradient(150deg, rgba(37,99,235,0.14), rgba(21,28,41,0))' }}>
          <div className="cb-row between wrap" style={{ gap: 12 }}>
            <div className="cb-row" style={{ gap: 12 }}>
              <span className="stat-icon" style={{ width: 40, height: 40, borderRadius: 12 }}><Icon name="Tennis" size={18} /></span>
              <div>
                <div className="semibold">{next.sportName} · {next.courtName}</div>
                <div className="tiny dim">{next.date} · {next.start} – {next.end} · {next.players}</div>
              </div>
            </div>
            <Badge tone="active">Confirmed</Badge>
          </div>
          <div className="cb-row between tiny dim" style={{ marginTop: 12 }}>
            <span className="cb-row" style={{ gap: 6 }}><Icon name="MapPin" size={12} /> ClubBloom, Whitefield</span>
            <span className="mono">₹{next.payable?.toLocaleString('en-IN')} paid</span>
          </div>
        </div>
      ) : (
        <EmptyState icon="CalendarX" title="No upcoming sessions" message="Book a court and start growing your garden again." action={<Button size="sm" icon="Plus" as={Link} to="/app/bookings">Book a court</Button>} />
      )}

      <div className="cb-grid cols-3" style={{ marginTop: 18, gap: 12 }}>
        {[
          { label: 'Confirmed', value: confirmed, tone: '' },
          { label: 'Completed', value: played, tone: 'green' },
          { label: 'Cancelled', value: cancelled, tone: 'neon' },
        ].map((s) => (
          <div key={s.label} className="cb-card" style={{ padding: '12px 14px' }}>
            <div className="cb-row between">
              <span className="tiny dim">{s.label}</span>
              <span className={`stat-icon ${s.tone}`} style={{ width: 26, height: 26, borderRadius: 8 }}><Icon name="CalendarCheck" size={12} /></span>
            </div>
            <div className="semibold" style={{ fontSize: '1.3rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <ProgressBar value={monthPct} label={`${stats.sessionsThisMonth} of 12 monthly sessions`} showLabel />
      </div>
    </Card>
  );
}
