import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { revenueTrend, expenseBreakdown, paymentSplit, bookingsBySport, retentionCohorts, financeTransactions } from '../../data/analytics';
import { formatCurrency, formatNumber } from '../../utils/format';
import { Badge, Button, Card, CardTitle, ChipGroup, PageHeader, StatCard } from '../../components/ui/primitives';
import DataTable from '../../components/ui/DataTable';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };

const RANGES = [
  { id: 'month', label: 'This month', months: 1 },
  { id: 'quarter', label: 'Last quarter', months: 3 },
  { id: 'ytd', label: 'Year to date', months: 12 },
];

const cohortColumns = [
  { key: 'cohort', label: 'Cohort', render: (r) => <span className="small semibold">{r.cohort}</span> },
  { key: 'size', label: 'Size', align: 'right', render: (r) => <span className="small mono">{r.size}</span> },
  { key: 'm1', label: 'M1', align: 'right', render: (r) => <span className="small">{r.m1 ? `${r.m1}%` : '—'}</span> },
  { key: 'm2', label: 'M2', align: 'right', render: (r) => <span className="small">{r.m2 ? `${r.m2}%` : '—'}</span> },
  { key: 'm3', label: 'M3', align: 'right', render: (r) => <span className="small">{r.m3 ? `${r.m3}%` : '—'}</span> },
  { key: 'm4', label: 'M4', align: 'right', render: (r) => <span className="small">{r.m4 ? `${r.m4}%` : '—'}</span> },
];

export default function Reports() {
  const { toast } = useApp();
  const [range, setRange] = useState(RANGES[2]);

  const slice = useMemo(() => revenueTrend.slice(-range.months), [range]);

  const totals = useMemo(() => {
    const revenue = revenueTrend.reduce((s, m) => s + m.total, 0);
    const expenses = revenueTrend.reduce((s, m) => s + m.expenses, 0);
    const pending = financeTransactions.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    return { revenue, expenses, profit: revenue - expenses, pending };
  }, []);

  const exportCsv = () => {
    const header = ['id', 'date', 'party', 'channel', 'method', 'amount', 'status'];
    const lines = financeTransactions.map((t) => header.map((h) => `"${t[h]}"`).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clubbloom-finance-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Export ready', 'Finance transactions downloaded as CSV.', 'success');
  };

  return (
    <>
      <PageHeader
        icon="FileBarChart"
        title="Financial Reports"
        subtitle="Revenue, expenses and retention reporting across the club."
        badge={<Badge tone="info">Governance</Badge>}
        actions={
          <>
            <Button variant="outline" icon="Download" onClick={exportCsv}>Export CSV</Button>
            <Button icon="Printer" onClick={() => toast('Report queued', 'PDF generation requires the backend.', 'info')}>Download PDF</Button>
          </>
        }
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Wallet" label="YTD revenue" value={formatCurrency(totals.revenue, true)} detail="All channels" />
        <StatCard icon="Banknote" tone="neon" label="YTD expenses" value={formatCurrency(totals.expenses, true)} detail="Operating cost" delay={0.05} />
        <StatCard icon="TrendingUp" tone="green" label="YTD profit" value={formatCurrency(totals.profit, true)} detail="Revenue − expenses" delay={0.1} />
        <StatCard icon="Clock" tone="gold" label="Pending payments" value={formatCurrency(totals.pending)} detail="Awaiting settlement" delay={0.15} />
      </div>

      <div className="cb-row between wrap" style={{ marginTop: 18, gap: 12 }}>
        <div>
          <div className="small semibold">Reporting period</div>
          <div className="tiny dim">Switch the window to slice the revenue trend</div>
        </div>
        <ChipGroup options={RANGES} value={range.id} onChange={setRange} />
      </div>

      <div className="cb-grid cols-2" style={{ marginTop: 14 }}>
        <Card glass>
          <CardTitle icon="LineChart" title="Revenue vs expenses" hint={`${range.label} · ${slice.length} month${slice.length === 1 ? '' : 's'}`} />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={slice}>
              <defs>
                <linearGradient id="revTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00A3FF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00A3FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF1744" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF1744" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => formatCurrency(v, true)} width={60} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, true)} />
              <Legend />
              <Area type="monotone" dataKey="total" name="Revenue" stroke="#00A3FF" fill="url(#revTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#FF1744" fill="url(#revExp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="PieChart" title="Expense breakdown" hint="Year to date" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {expenseBreakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v, true)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="cb-grid cols-2" style={{ marginTop: 18 }}>
        <Card glass>
          <CardTitle icon="CreditCard" title="Payment methods" hint="Share of transactions" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {paymentSplit.map((p) => <Cell key={p.name} fill={p.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="BarChart3" title="Bookings by sport" hint="Volume this year" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bookingsBySport}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="sport" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="bookings" name="Bookings" fill="#00A3FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card glass style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: '16px 18px 4px' }}>
          <CardTitle icon="Users" title="Retention cohorts" hint="Monthly retention by joining cohort" />
        </div>
        <div style={{ padding: '0 18px 18px' }}>
          <DataTable columns={cohortColumns} rows={retentionCohorts} />
        </div>
      </Card>

      <div style={{ marginTop: 14 }} className="tiny dim">
        Showing {formatNumber(financeTransactions.length)} recent transactions in the CSV export · figures are demo analytics.
      </div>
    </>
  );
}
