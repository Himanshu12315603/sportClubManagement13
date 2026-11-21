import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Badge, Button, Card, CardTitle, ChipGroup, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import {
  revenueTrend, expenseBreakdown, paymentSplit, revenueForecast, financeTransactions, managerKpis,
} from '../../data/analytics';
import { formatCurrency, formatDate } from '../../utils/format';
import { useDebounced } from '../../hooks/useUi';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };
const statusOptions = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'refunded', label: 'Refunded' },
];
const statusTone = { paid: 'active', pending: 'warning', refunded: 'danger' };

export default function ManagerFinance() {
  const { toast } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const debounced = useDebounced(q);

  const last = revenueTrend[revenueTrend.length - 1];

  const rows = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return financeTransactions.filter((t) => {
      const statusOk = status === 'all' || t.status === status;
      const textOk = !needle || [t.id, t.party, t.channel, t.method].some((v) => String(v).toLowerCase().includes(needle));
      return statusOk && textOk;
    });
  }, [debounced, status]);

  const exportCsv = () => {
    const header = ['ID', 'Date', 'Party', 'Channel', 'Method', 'Amount', 'Status'];
    const lines = rows.map((t) => [t.id, t.date, t.party, t.channel, t.method, t.amount, t.status]);
    const csv = [header, ...lines]
      .map((cols) => cols.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clubbloom-transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Export started', `${rows.length} transactions exported to CSV.`, 'success');
  };

  const columns = [
    { key: 'id', label: 'Txn', render: (t) => <span className="small semibold mono">{t.id}</span> },
    { key: 'date', label: 'Date', render: (t) => <span className="small dim">{formatDate(t.date)}</span> },
    { key: 'party', label: 'Party', render: (t) => <span className="small">{t.party}</span> },
    { key: 'channel', label: 'Channel', render: (t) => <Badge tone="neutral">{t.channel}</Badge> },
    { key: 'method', label: 'Method', render: (t) => <span className="small dim">{t.method}</span> },
    { key: 'amount', label: 'Amount', align: 'right', render: (t) => <span className="small mono semibold">{formatCurrency(t.amount)}</span> },
    { key: 'status', label: 'Status', render: (t) => <Badge tone={statusTone[t.status] || 'neutral'}>{t.status}</Badge> },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Wallet"
        title="Finance"
        subtitle="Revenue channels, expenses, payment mix and the transaction ledger."
        badge={<Badge tone="info">{last.month} close</Badge>}
        actions={<Button icon="Download" variant="outline" onClick={exportCsv}>Export CSV</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Wallet" label="Monthly revenue" value={formatCurrency(managerKpis.monthlyRevenue, true)} detail={`${last.month} · all channels`} trend={7} />
        <StatCard icon="Receipt" tone="neon" label="Expenses" value={formatCurrency(last.expenses, true)} detail="Operating cost" delay={0.05} />
        <StatCard icon="TrendingUp" tone="green" label="Profit" value={formatCurrency(last.profit, true)} detail="Revenue − expenses" trend={5} delay={0.1} />
        <StatCard icon="Clock" tone="gold" label="Pending payments" value={formatCurrency(managerKpis.pendingPayments, true)} detail={`${formatCurrency(managerKpis.refunds, true)} refunded`} delay={0.15} />
      </div>

      <Card glass>
        <CardTitle icon="BarChart3" title="Revenue vs expenses" hint="Stacked channels with profit line" />
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={revenueTrend} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} width={54} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="court" stackId="rev" name="Courts" fill="#00a3ff" radius={[0, 0, 0, 0]} />
            <Bar dataKey="membership" stackId="rev" name="Membership" fill="#2563eb" />
            <Bar dataKey="shop" stackId="rev" name="Shop" fill="#38bdf8" />
            <Bar dataKey="cafe" stackId="rev" name="Cafe" fill="#ff1744" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="cb-grid cols-3">
        <Card glass>
          <CardTitle icon="PieChart" title="Expense breakdown" hint="Where the money goes" />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78} paddingAngle={3}>
                {expenseBreakdown.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="CreditCard" title="Payment mix" hint="Share of transactions" />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={paymentSplit} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78} paddingAngle={3}>
                {paymentSplit.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="LineChart" title="Revenue forecast" hint="Actual vs projected" />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueForecast} margin={{ top: 6, right: 8, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} width={50} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="#00a3ff" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#fbbf24" strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card glass>
        <CardTitle
          icon="Receipt"
          title="Transactions"
          hint={`${rows.length} shown`}
          right={
            <div className="cb-row wrap" style={{ gap: 10 }}>
              <SearchInput value={q} onChange={setQ} placeholder="Search party, channel or txn…" />
              <ChipGroup options={statusOptions} value={status} onChange={(o) => setStatus(o.id)} />
              <Button size="sm" variant="outline" icon="Download" onClick={exportCsv}>Export CSV</Button>
            </div>
          }
        />
        <DataTable
          columns={columns}
          rows={rows}
          empty={<EmptyState icon="Receipt" title="No transactions" message="Adjust the search or status filter." />}
        />
      </Card>
    </div>
  );
}
