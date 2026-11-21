import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, ProgressBar, StatCard,
} from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';
import { useApp } from '../../context/AppContext';
import {
  revenueTrend, membershipDistribution, bookingsBySport, managerKpis, lowStockItems,
} from '../../data/analytics';
import { formatCurrency, formatNumber, formatDate, toISODate } from '../../utils/format';

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#172b4d',
  boxShadow: '0 10px 25px -4px rgba(23, 43, 77, 0.12)',
  padding: '10px 14px',
};
const statusTone = { confirmed: 'info', completed: 'active', cancelled: 'danger' };
const statusLabel = { confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

export default function ManagerOverview() {
  const { bookings } = useApp();
  const today = toISODate(new Date());

  const upcoming = useMemo(() => {
    const todays = bookings.filter((b) => b.date === today && b.status !== 'cancelled');
    const list = todays.length ? todays : bookings.filter((b) => b.status === 'confirmed');
    return list.slice(0, 6);
  }, [bookings, today]);

  const quickLinks = [
    { to: '/manager/members', icon: 'Users', label: 'Members' },
    { to: '/manager/bookings', icon: 'CalendarCheck', label: 'Bookings' },
    { to: '/manager/finance', icon: 'Wallet', label: 'Finance' },
    { to: '/manager/ai', icon: 'Sparkles', label: 'AI insights' },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="LayoutDashboard"
        title="Command centre"
        subtitle="Live club performance across members, courts, revenue and inventory."
        badge={<Badge tone="info">Live</Badge>}
        actions={<Button as={Link} to="/manager/ai" icon="Sparkles" variant="outline">Ask ClubBloom AI</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Users" label="Total members" value={formatNumber(managerKpis.totalMembers)} detail={`${managerKpis.activeMemberships} active memberships`} trend={6} />
        <StatCard icon="CalendarCheck" label="Today's bookings" value={formatNumber(managerKpis.todayBookings)} detail={`${managerKpis.newEnquiries} new enquiries`} trend={4} delay={0.05} />
        <StatCard icon="BarChart3" tone="green" label="Court occupancy" value={`${managerKpis.courtOccupancy}%`} detail="Peak-weighted average" delay={0.1} />
        <StatCard icon="Wallet" tone="gold" label="Monthly revenue" value={formatCurrency(managerKpis.monthlyRevenue, true)} detail={`${formatCurrency(managerKpis.monthlyRevenue - managerKpis.monthlyExpenses, true)} profit`} trend={7} delay={0.15} />
        <StatCard icon="Clock" tone="neon" label="Pending payments" value={formatCurrency(managerKpis.pendingPayments, true)} detail={`${formatCurrency(managerKpis.refunds, true)} refunded`} delay={0.2} />
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="LineChart" title="Revenue by channel" hint="Court, membership, shop and cafe vs expenses" right={<Badge tone="info">Last 12 months</Badge>} />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="ovCourt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a085" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#16a085" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} width={54} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="court" stackId="rev" name="Courts" stroke="#16a085" fill="url(#ovCourt)" />
              <Area type="monotone" dataKey="membership" stackId="rev" name="Membership" stroke="#2563eb" fill="#2563eb" fillOpacity={0.22} />
              <Area type="monotone" dataKey="shop" stackId="rev" name="Shop" stroke="#10b981" fill="#10b981" fillOpacity={0.22} />
              <Area type="monotone" dataKey="cafe" stackId="rev" name="Cafe" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.22} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="PieChart" title="Membership mix" hint="Active members by plan" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={membershipDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={3}>
                {membershipDistribution.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="BarChart3" title="Bookings by sport" hint="Monthly session volume" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bookingsBySport} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="sport" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} width={44} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="bookings" name="Bookings" radius={[6, 6, 0, 0]} fill="#00a3ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle
            icon="CalendarClock"
            title="Bookings to watch"
            hint={upcoming.some((b) => b.date === today) ? "Today's session list" : 'Next confirmed sessions'}
            right={<Button size="sm" variant="ghost" as={Link} to="/manager/bookings">All bookings</Button>}
          />
          {upcoming.length === 0 ? (
            <EmptyState icon="CalendarX" title="No bookings" message="New court bookings will appear here." />
          ) : (
            <div className="cb-stack" style={{ gap: 10 }}>
              {upcoming.map((b) => (
                <div key={b.id} className="cb-row between" style={{ gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(38,50,71,0.5)' }}>
                  <div className="cb-row" style={{ gap: 11 }}>
                    <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10 }}>
                      <Icon name="CalendarDays" size={15} />
                    </span>
                    <div>
                      <div className="small semibold">{b.sportName} · {b.courtName}</div>
                      <div className="tiny dim">{formatDate(b.date)} · {b.start}–{b.end} · {b.partner && b.partner !== '—' ? b.partner : b.userId}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="small mono semibold">{formatCurrency(b.payable)}</div>
                    <Badge tone={statusTone[b.status] || 'neutral'}>{statusLabel[b.status] || b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle
            icon="AlertTriangle"
            iconTone="neon"
            title="Low-stock alerts"
            hint="SKUs below the reorder threshold"
            right={<Button size="sm" variant="outline" as={Link} to="/manager/shop">Open shop</Button>}
          />
          {lowStockItems.length === 0 ? (
            <EmptyState icon="Package" title="Stock healthy" message="No items are below their reorder threshold." />
          ) : (
            <div className="cb-stack" style={{ gap: 16 }}>
              {lowStockItems.map((item) => (
                <div key={item.id}>
                  <div className="cb-row between" style={{ marginBottom: 6 }}>
                    <span className="small semibold">{item.name}</span>
                    <span className="tiny mono dim">{item.stock} / {item.threshold}</span>
                  </div>
                  <ProgressBar tone="neon" value={(item.stock / item.threshold) * 100} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card glass>
          <CardTitle icon="Zap" title="Quick links" hint="Jump into the day-to-day tools" />
          <div className="cb-grid cols-2" style={{ gap: 12 }}>
            {quickLinks.map((l) => (
              <Button key={l.to} as={Link} to={l.to} icon={l.icon} variant="ghost" block>{l.label}</Button>
            ))}
          </div>
          <div className="cb-hairline" style={{ margin: '16px 0' }} />
          <div className="cb-row between">
            <span className="small muted">Average member rating</span>
            <span className="small semibold text-electric">{managerKpis.avgRating} ★</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
