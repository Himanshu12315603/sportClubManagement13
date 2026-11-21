import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { revenueTrend, channelSplit, monthlyNewMembers, financeTransactions } from '../../data/analytics';
import { members as seedMembers } from '../../data/members';
import { API_BASE_URL } from '../../services/api';
import { formatCurrency, formatNumber, titleCase } from '../../utils/format';
import { Badge, Button, Card, CardTitle, InfoNote, PageHeader, StatCard } from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };

const HEALTH_ROWS = [
  { id: 'api', icon: 'Zap', label: 'Backend API', tone: 'active', status: 'Operational', note: `Connected to ${API_BASE_URL} (mock).` },
  { id: 'pay', icon: 'CreditCard', label: 'Payments', tone: 'warning', status: 'Mock gateway', note: 'No live gateway connected — checkout records mock transactions.' },
  { id: 'ai', icon: 'Bot', label: 'AI Assistant', tone: 'active', status: 'Online', note: 'ClubBloom AI runs fully offline in the browser.' },
  { id: 'notif', icon: 'Bell', label: 'Notifications', tone: 'active', status: 'Operational', note: 'In-app notifications are delivered to every role.' },
];

const QUICK_LINKS = [
  { to: '/admin/managers', icon: 'UserCog', label: 'Manager accounts' },
  { to: '/admin/roles', icon: 'ShieldCheck', label: 'Roles & permissions' },
  { to: '/admin/reports', icon: 'FileBarChart', label: 'Financial reports' },
  { to: '/admin/settings', icon: 'Settings', label: 'System settings' },
];

function relTime(at) {
  const hrs = Math.max(1, Math.round((Date.now() - at.getTime()) / 3600000));
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function Overview() {
  const { members, accounts, staff } = useApp();

  const managerCount = accounts.filter((a) => a.role === 'manager').length;
  const latest = revenueTrend[revenueTrend.length - 1];

  const activity = useMemo(() => {
    const items = [];
    const recentMembers = [...seedMembers].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 3);
    recentMembers.forEach((m) => {
      items.push({
        id: `m-${m.id}`,
        icon: 'User',
        tone: '',
        text: `New member ${m.name} joined on the ${titleCase(m.plan)} plan.`,
        at: new Date(m.joined),
      });
    });
    financeTransactions.slice(0, 6).forEach((tx) => {
      const pending = tx.status === 'pending';
      const refunded = tx.status === 'refunded';
      items.push({
        id: `t-${tx.id}`,
        icon: pending ? 'Clock' : refunded ? 'RotateCcw' : 'Banknote',
        tone: pending ? 'gold' : refunded ? 'neon' : 'green',
        text: `${pending ? 'Payment pending' : refunded ? 'Refund issued' : 'Payment received'} · ${formatCurrency(tx.amount)} ${pending ? 'from' : ''} ${tx.party}`.trim(),
        at: new Date(tx.date),
      });
    });
    return items.sort((a, b) => b.at - a.at).slice(0, 7);
  }, []);

  return (
    <>
      <PageHeader
        icon="ShieldCheck"
        title="Platform Overview"
        subtitle="Governance-level view of accounts, revenue and platform health."
        badge={<Badge tone="active">Admin</Badge>}
        actions={
          <>
            <Button as={Link} to="/admin/reports" variant="outline" icon="FileBarChart">Reports</Button>
            <Button as={Link} to="/admin/settings" icon="Settings">System settings</Button>
          </>
        }
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Users" label="Total members" value={formatNumber(members.length)} detail="Across all plans" />
        <StatCard icon="UserCog" tone="gold" label="Manager accounts" value={managerCount} detail="Club operators" delay={0.05} />
        <StatCard icon="Briefcase" tone="green" label="Staff accounts" value={staff.length} detail="Team directory" delay={0.1} />
        <StatCard icon="Wallet" tone="neon" label="Monthly revenue" value={formatCurrency(latest.total, true)} detail={`${latest.month} · profit ${formatCurrency(latest.profit, true)}`} trend={4} delay={0.15} />
        <StatCard icon="Activity" label="System uptime" value="99.98%" detail="Last 30 days" trend={1} delay={0.2} />
      </div>

      <div className="cb-grid cols-2" style={{ marginTop: 18 }}>
        <Card glass>
          <CardTitle icon="LineChart" title="Revenue trend" hint="Total revenue vs expenses" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A3FF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00A3FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF1744" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF1744" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => formatCurrency(v, true)} width={60} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, true)} />
              <Legend />
              <Area type="monotone" dataKey="total" name="Revenue" stroke="#00A3FF" fill="url(#gTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#FF1744" fill="url(#gExp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="PieChart" title="Revenue by channel" hint="Latest month" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {channelSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, true)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="cb-grid cols-2" style={{ marginTop: 18 }}>
        <Card glass>
          <CardTitle icon="BarChart3" title="New members by tier" hint="Monthly acquisition" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyNewMembers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="gold" name="Gold" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Bar dataKey="silver" name="Silver" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="junior" name="Junior" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="Bell" title="Recent platform activity" hint="Payments & new members" />
          <div className="cb-stack" style={{ gap: 4 }}>
            {activity.map((a) => (
              <div key={a.id} className="cb-row between" style={{ gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(38,50,71,0.5)' }}>
                <div className="cb-row" style={{ gap: 10 }}>
                  <span className={`stat-icon ${a.tone}`} style={{ width: 32, height: 32, borderRadius: 10 }}>
                    <Icon name={a.icon} size={15} />
                  </span>
                  <span className="small">{a.text}</span>
                </div>
                <span className="tiny dim" style={{ whiteSpace: 'nowrap' }}>{relTime(a.at)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="cb-grid cols-2" style={{ marginTop: 18 }}>
        <Card glass>
          <CardTitle icon="Activity" title="System health" hint="Platform services" />
          <div className="cb-stack" style={{ gap: 12 }}>
            {HEALTH_ROWS.map((h) => (
              <div key={h.id} className="cb-stack" style={{ gap: 8 }}>
                <div className="cb-row between">
                  <div className="cb-row" style={{ gap: 10 }}>
                    <span className="stat-icon" style={{ width: 32, height: 32, borderRadius: 10 }}><Icon name={h.icon} size={15} /></span>
                    <span className="small semibold">{h.label}</span>
                  </div>
                  <Badge tone={h.tone} icon={h.tone === 'warning' ? 'AlertTriangle' : 'CheckCircle2'}>{h.status}</Badge>
                </div>
                <InfoNote>{h.note}</InfoNote>
              </div>
            ))}
          </div>
        </Card>

        <div className="cb-stack" style={{ gap: 18 }}>
          <Card glass>
            <CardTitle icon="Zap" title="Quick links" hint="Jump to a governance area" />
            <div className="cb-grid cols-2">
              {QUICK_LINKS.map((q) => (
                <Button key={q.to} as={Link} to={q.to} variant="outline" icon={q.icon} style={{ justifyContent: 'flex-start' }}>
                  {q.label}
                </Button>
              ))}
            </div>
          </Card>
          <Card glass>
            <CardTitle icon="Info" title="Integration status" hint="Backend hand-off" />
            <InfoNote>Platform data is served from the demo store today. Wiring the Express backend at {API_BASE_URL} will persist every governance action.</InfoNote>
          </Card>
        </div>
      </div>
    </>
  );
}
