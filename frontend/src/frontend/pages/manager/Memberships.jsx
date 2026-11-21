import { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { Field, FormRow, Input } from '../../components/ui/form';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { membershipDistribution } from '../../data/analytics';
import { formatCurrency, formatDate, addDays, toISODate, daysLeft } from '../../utils/format';
import { planDurationDays } from '../../utils/membership';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };
const planBadge = { gold: 'gold', silver: 'silver', junior: 'junior', trial: 'info' };
const planLabel = { gold: 'Gold', silver: 'Silver', junior: 'Junior', trial: 'Trial' };

export default function ManagerMemberships() {
  const { plans, savePlan, members, updateMember, toast } = useApp();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});

  const editing = plans.find((p) => p.id === editId) || null;

  const renewals = useMemo(
    () => members
      .map((m) => ({ ...m, days: daysLeft(m.expiryDate) }))
      .filter((m) => m.days <= 30)
      .sort((a, b) => a.days - b.days),
    [members]
  );

  const openEdit = (plan) => {
    setForm({
      price: plan.price,
      courtDiscountPct: plan.courtDiscountPct,
      shopDiscountPct: plan.shopDiscountPct,
      cafeDiscountPct: plan.cafeDiscountPct,
      dailyBookingLimit: plan.dailyBookingLimit,
      advanceBookingDays: plan.advanceBookingDays,
    });
    setEditId(plan.id);
  };

  const submitEdit = () => {
    savePlan(editId, {
      price: Number(form.price) || 0,
      courtDiscountPct: Number(form.courtDiscountPct) || 0,
      shopDiscountPct: Number(form.shopDiscountPct) || 0,
      cafeDiscountPct: Number(form.cafeDiscountPct) || 0,
      dailyBookingLimit: Number(form.dailyBookingLimit) || 1,
      advanceBookingDays: Number(form.advanceBookingDays) || 7,
    });
    setEditId(null);
  };

  const renew = (member) => {
    updateMember(member.id, { expiryDate: toISODate(addDays(new Date(), planDurationDays(member.plan))) });
    toast('Membership renewed', `${member.name} renewed on the ${planLabel[member.plan] || member.plan} plan.`, 'success');
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const columns = [
    { key: 'name', label: 'Member', render: (m) => <span className="small semibold">{m.name}</span> },
    { key: 'plan', label: 'Plan', render: (m) => <Badge tone={planBadge[m.plan] || 'neutral'}>{planLabel[m.plan] || m.plan}</Badge> },
    { key: 'expiry', label: 'Expiry', render: (m) => <span className="small dim">{formatDate(m.expiryDate)}</span> },
    {
      key: 'days',
      label: 'Status',
      render: (m) => <Badge tone={m.days < 0 ? 'danger' : 'warning'}>{m.days < 0 ? `Expired ${Math.abs(m.days)}d ago` : `${m.days}d left`}</Badge>,
    },
    { key: 'spent', label: 'Lifetime', align: 'right', render: (m) => <span className="small mono">{formatCurrency(m.totalSpent, true)}</span> },
    { key: 'actions', label: '', align: 'right', render: (m) => <Button size="sm" variant="outline" icon="RefreshCw" onClick={() => renew(m)}>Mark renewed</Button> },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Crown"
        title="Membership plans"
        subtitle="Tune pricing, discounts and booking limits — then chase renewals before they lapse."
        badge={<Badge tone="info">{plans.length} plans</Badge>}
      />

      <div className="cb-grid cols-3">
        <StatCard icon="Crown" tone="gold" label="Most popular" value={plans.find((p) => p.popular)?.name || '—'} detail="By active members" />
        <StatCard icon="CalendarClock" tone="gold" label="Renewals due" value={renewals.length} detail="Expiring within 30 days" delay={0.05} />
        <StatCard icon="Users" label="Active memberships" value={membershipDistribution.reduce((n, d) => n + d.value, 0)} detail="Across all plans" delay={0.1} />
      </div>

      <div className="cb-grid cols-3">
        {plans.map((plan) => (
          <Card glass key={plan.id} style={{ borderColor: `${plan.accent}44` }}>
            <CardTitle
              icon={plan.popular ? 'Crown' : 'Ticket'}
              iconTone={plan.id === 'gold' ? 'gold' : ''}
              title={plan.name}
              hint={plan.tagline}
              right={<Badge tone={planBadge[plan.id] || 'neutral'}>{plan.period}</Badge>}
            />
            <div className="cb-row between" style={{ marginBottom: 14 }}>
              <span className="bold" style={{ fontSize: '1.5rem' }}>{formatCurrency(plan.price)}</span>
              {plan.popular ? <Badge tone="gold" icon="Star">Popular</Badge> : null}
            </div>
            <div className="cb-stack" style={{ gap: 0 }}>
              <Row label="Court discount" value={`${plan.courtDiscountPct}%`} />
              <Row label="Shop discount" value={`${plan.shopDiscountPct}%`} />
              <Row label="Cafe discount" value={`${plan.cafeDiscountPct}%`} />
              <Row label="Daily booking limit" value={`${plan.dailyBookingLimit} / day`} />
              <Row label="Advance booking" value={`${plan.advanceBookingDays} days`} last />
            </div>
            <Button block variant="outline" icon="Edit" style={{ marginTop: 14 }} onClick={() => openEdit(plan)}>Edit plan</Button>
          </Card>
        ))}
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="PieChart" title="Membership mix" hint="Members by plan" />
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

        <Card glass>
          <CardTitle icon="CalendarClock" title="Renewals due" hint={`${renewals.length} within 30 days`} />
          <DataTable
            columns={columns}
            rows={renewals}
            empty={<EmptyState icon="CheckCircle2" title="All caught up" message="No memberships expire within the next 30 days." />}
          />
        </Card>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditId(null)}
        title={editing ? `Edit ${editing.name} plan` : 'Edit plan'}
        subtitle="Changes apply to new bookings and purchases immediately"
        icon="Crown"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
            <Button icon="Save" onClick={submitEdit}>Save plan</Button>
          </>
        }
      >
        <FormRow>
          <Field label="Annual price (₹)" required><Input type="number" value={form.price ?? ''} onChange={(e) => set('price', e.target.value)} /></Field>
          <Field label="Court discount (%)"><Input type="number" value={form.courtDiscountPct ?? ''} onChange={(e) => set('courtDiscountPct', e.target.value)} /></Field>
        </FormRow>
        <FormRow>
          <Field label="Shop discount (%)"><Input type="number" value={form.shopDiscountPct ?? ''} onChange={(e) => set('shopDiscountPct', e.target.value)} /></Field>
          <Field label="Cafe discount (%)"><Input type="number" value={form.cafeDiscountPct ?? ''} onChange={(e) => set('cafeDiscountPct', e.target.value)} /></Field>
        </FormRow>
        <FormRow>
          <Field label="Daily booking limit"><Input type="number" value={form.dailyBookingLimit ?? ''} onChange={(e) => set('dailyBookingLimit', e.target.value)} /></Field>
          <Field label="Advance booking (days)"><Input type="number" value={form.advanceBookingDays ?? ''} onChange={(e) => set('advanceBookingDays', e.target.value)} /></Field>
        </FormRow>
      </Modal>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div className="cb-row between" style={{ padding: '8px 0', borderBottom: last ? 'none' : '1px solid rgba(38,50,71,0.5)' }}>
      <span className="tiny muted">{label}</span>
      <span className="tiny semibold mono">{value}</span>
    </div>
  );
}
