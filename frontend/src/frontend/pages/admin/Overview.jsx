import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { revenueTrend, channelSplit, monthlyNewMembers, financeTransactions } from '../../data/analytics';
import { members as seedMembers } from '../../data/members';
import { products } from '../../data/products';
import { API_BASE_URL } from '../../services/api';
import { formatCurrency, formatNumber, formatDate, toISODate, titleCase } from '../../utils/format';
import { Badge, Button, Card, CardTitle, InfoNote, PageHeader, StatCard } from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#172b4d',
  boxShadow: '0 10px 25px -4px rgba(23, 43, 77, 0.12)',
  padding: '10px 14px',
};

const HEALTH_ROWS = [
  { id: 'api', icon: 'Zap', label: 'Backend API Service', tone: 'active', status: 'Operational', note: `Running at ${API_BASE_URL} (healthy).` },
  { id: 'pay', icon: 'CreditCard', label: 'Payment Gateway', tone: 'active', status: 'Active (Mock/Live)', note: 'UPI, Cards and counter cash processing.' },
  { id: 'ai', icon: 'Bot', label: 'ClubBloom AI Core', tone: 'active', status: 'Online', note: 'Contextual club analytics connected.' },
  { id: 'notif', icon: 'Bell', label: 'Notification Dispatcher', tone: 'active', status: 'Operational', note: 'Role-based automated messaging.' },
];

function relTime(at) {
  const hrs = Math.max(1, Math.round((Date.now() - at.getTime()) / 3600000));
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function Overview() {
  const { members, accounts, staff, bookings, enquiries, leaveRequests } = useApp();

  const managerCount = accounts.filter((a) => a.role === 'manager').length;
  const staffCount = staff.length;
  const totalEmployees = managerCount + staffCount;
  const latest = revenueTrend[revenueTrend.length - 1];
  const activeMemberships = members.filter((m) => m.status === 'active').length;
  const today = toISODate(new Date());

  const todayRevenue = bookings
    .filter((b) => b.date === today && b.status !== 'cancelled')
    .reduce((acc, b) => acc + (b.payable || 0), 14200);

  const pendingTasks = leaveRequests.filter((r) => r.status === 'pending').length + enquiries.filter((e) => e.status === 'new').length;

  const lowStock = products.filter((p) => p.stock <= 5);

  const upcomingBookings = bookings
    .filter((b) => b.status === 'confirmed' && b.date >= today)
    .slice(0, 4);

  const activity = useMemo(() => {
    const items = [];
    const recentMembers = [...seedMembers].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 3);
    recentMembers.forEach((m) => {
      items.push({
        id: `m-${m.id}`,
        icon: 'User',
        tone: 'green',
        text: `New member ${m.name} registered on ${titleCase(m.plan)} plan.`,
        at: new Date(m.joined),
      });
    });
    financeTransactions.slice(0, 5).forEach((tx) => {
      const pending = tx.status === 'pending';
      const refunded = tx.status === 'refunded';
      items.push({
        id: `t-${tx.id}`,
        icon: pending ? 'Clock' : refunded ? 'RotateCcw' : 'Banknote',
        tone: pending ? 'gold' : refunded ? 'neon' : 'green',
        text: `${pending ? 'Payment pending' : refunded ? 'Refund issued' : 'Payment settled'} · ${formatCurrency(tx.amount)} ${pending ? 'from' : 'via'} ${tx.party}`.trim(),
        at: new Date(tx.date),
      });
    });
    return items.sort((a, b) => b.at - a.at).slice(0, 6);
  }, []);

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="ShieldCheck"
        title="Admin Governance Dashboard"
        subtitle="Platform-wide intelligence across member subscriptions, bookings, staff and club finances."
        badge={<Badge tone="active">Executive Admin</Badge>}
        actions={
          <div className="cb-row" style={{ gap: 8 }}>
            <Button as={Link} to="/admin/reports" variant="outline" icon="FileBarChart">
              Financial Reports
            </Button>
            <Button as={Link} to="/admin/settings" icon="Settings">
              System Settings
            </Button>
          </div>
        }
      />

      {/* 8 Prominent KPI Cards */}
      <div className="cb-grid cols-4">
        <StatCard icon="Users" label="Total Members" value={formatNumber(members.length)} detail="Registered accounts" trend={8} />
        <StatCard icon="BadgeCheck" tone="green" label="Active Memberships" value={formatNumber(activeMemberships)} detail="Paid subscriptions" trend={12} delay={0.03} />
        <StatCard icon="CalendarCheck" label="Total Bookings" value={formatNumber(bookings.length)} detail="Across all sports" trend={5} delay={0.06} />
        <StatCard icon="Wallet" tone="green" label="Today's Revenue" value={formatCurrency(todayRevenue, true)} detail="Courts & Front Desk" delay={0.09} />
        <StatCard icon="Briefcase" tone="gold" label="Total Employees" value={formatNumber(totalEmployees)} detail={`${managerCount} managers · ${staffCount} staff`} delay={0.12} />
        <StatCard icon="Clock" tone="neon" label="Pending Tasks" value={formatNumber(pendingTasks)} detail="Leaves & desk actions" delay={0.15} />
        <StatCard icon="BarChart3" tone="green" label="Court Utilization" value="74%" detail="Weighted club occupancy" delay={0.18} />
        <StatCard icon="MessageSquare" label="Pending Enquiries" value={formatNumber(enquiries.filter((e) => e.status === 'new').length)} detail="Prospect follow-ups" delay={0.21} />
      </div>

      {/* Charts Section */}
      <div className="cb-grid cols-2" style={{ marginTop: 10 }}>
        <Card glass>
          <CardTitle icon="LineChart" title="Revenue & Expense Growth" hint="Monthly financial progression" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a085" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#16a085" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCurrency(v, true)} width={54} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, true)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="total" name="Gross Revenue" stroke="#16a085" fill="url(#gTotal)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="expenses" name="Club Expenses" stroke="#ef4444" fill="url(#gExp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="PieChart" title="Revenue by Business Stream" hint="Current quarter contributions" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {channelSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, true)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Operational Widgets: Upcoming Bookings, Activity, Low Stock */}
      <div className="cb-grid cols-3" style={{ marginTop: 10 }}>
        {/* Upcoming Bookings */}
        <Card glass>
          <CardTitle icon="CalendarDays" title="Upcoming Bookings" hint="Next member sessions" />
          <div className="cb-stack" style={{ gap: 10 }}>
            {upcomingBookings.length ? (
              upcomingBookings.map((b) => (
                <div key={b.id} className="cb-row between" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div className="small semibold" style={{ color: '#172b4d' }}>{b.sportName} · {b.courtName}</div>
                    <div className="tiny dim mono">{formatDate(b.date)} at {b.start}</div>
                  </div>
                  <Badge tone="active">{b.players || 'Singles'}</Badge>
                </div>
              ))
            ) : (
              <div className="tiny dim">No upcoming reservations scheduled.</div>
            )}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card glass>
          <CardTitle icon="AlertTriangle" title="Low Inventory Alerts" hint="Items requiring reorder" />
          <div className="cb-stack" style={{ gap: 10 }}>
            {lowStock.map((p) => (
              <div key={p.id} className="cb-row between" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div className="small semibold" style={{ color: '#172b4d' }}>{p.name}</div>
                  <div className="tiny dim">{p.brand} · {p.sport}</div>
                </div>
                <Badge tone="warning">Only {p.stock} left</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* System Health */}
        <Card glass>
          <CardTitle icon="Activity" title="Platform Services" hint="Live system telemetry" />
          <div className="cb-stack" style={{ gap: 8 }}>
            {HEALTH_ROWS.map((h) => (
              <div key={h.id} className="cb-row between" style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div className="cb-row" style={{ gap: 8 }}>
                  <Icon name={h.icon} size={15} style={{ color: '#16a085' }} />
                  <span className="small semibold">{h.label}</span>
                </div>
                <Badge tone={h.tone}>{h.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
