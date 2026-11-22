import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardTitle, ChipGroup, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { Field, FormRow, Input, SearchInput, Select, validateFields } from '../../components/ui/form';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { membershipTypeFilters } from '../../data/members';
import { membershipPlans } from '../../data/membershipPlans';
import { formatCurrency, formatDate, addDays, toISODate, daysLeft } from '../../utils/format';
import { useDebounced } from '../../hooks/useUi';

const planBadge = { gold: 'gold', silver: 'silver', junior: 'junior', trial: 'info' };
const planLabel = { gold: 'Gold', silver: 'Silver', junior: 'Junior', trial: 'Trial' };
const emptyForm = { name: '', email: '', phone: '', plan: 'gold', age: '25', city: '' };
const memberStatusLabel = (member) => member.memberStatus || (member.suspended ? 'suspended' : 'active');

function expiryTone(days) {
  if (days < 0) return 'danger';
  if (days <= 30) return 'warning';
  return 'active';
}
function expiryLabel(days) {
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  return `${days}d left`;
}

export default function ManagerMembers() {
  const { members, addMember, updateMember, suspendMember, toast } = useApp();
  const [q, setQ] = useState('');
  const [plan, setPlan] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const debounced = useDebounced(q);

  const selected = members.find((m) => m.id === selectedId) || null;

  const rows = useMemo(() => {
    const needle = debounced.trim().toLowerCase();
    return members.filter((m) => {
      const planOk = plan === 'all' || m.plan === plan;
      const textOk = !needle || [m.name, m.email, m.phone, m.id].some((v) => String(v).toLowerCase().includes(needle));
      return planOk && textOk;
    });
  }, [members, plan, debounced]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submitAdd = () => {
    const { valid, errors: errs } = validateFields(form, {
      name: { required: true, message: 'Enter the member name.' },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      plan: { required: true },
    });
    if (!valid) {
      setErrors(errs);
      return;
    }
    addMember(form);
    setForm(emptyForm);
    setErrors({});
    setAddOpen(false);
  };

  const extend = (member) => {
    const base = Math.max(Date.now(), new Date(member.expiryDate).getTime());
    updateMember(member.id, { expiryDate: toISODate(addDays(new Date(base), 30)) });
    toast('Membership extended', `${member.name} extended by 30 days.`, 'success');
  };

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (m) => (
        <div className="cb-row" style={{ gap: 11 }}>
          <span className="cb-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
          <div>
            <div className="small semibold">{m.name}</div>
            <div className="tiny dim mono">{m.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'plan', label: 'Plan', render: (m) => <Badge tone={planBadge[m.plan] || 'neutral'}>{planLabel[m.plan] || m.plan}</Badge> },
    {
      key: 'contact',
      label: 'Contact',
      render: (m) => (
        <div>
          <div className="tiny">{m.phone}</div>
          <div className="tiny dim">{m.email}</div>
        </div>
      ),
    },
    { key: 'joined', label: 'Joined', render: (m) => <span className="tiny dim">{formatDate(m.joined)}</span> },
    {
      key: 'expiry',
      label: 'Expiry',
      render: (m) => (
        <div className="cb-row" style={{ gap: 8 }}>
          <span className="tiny dim">{formatDate(m.expiryDate)}</span>
          <Badge tone={expiryTone(daysLeft(m.expiryDate))}>{expiryLabel(daysLeft(m.expiryDate))}</Badge>
        </div>
      ),
    },
    { key: 'sessions', label: 'Sessions', align: 'center', render: (m) => <span className="small mono">{m.sessionsThisMonth}</span> },
    { key: 'spent', label: 'Spent', align: 'right', render: (m) => <span className="small mono semibold">{formatCurrency(m.totalSpent, true)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (m) => {
        const status = memberStatusLabel(m);
        const tone = status === 'active' ? 'active' : status === 'suspended' ? 'danger' : 'warning';
        return <Badge tone={tone}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
      },
    },
    { key: 'actions', label: '', align: 'right', render: (m) => <Button size="sm" variant="ghost" icon="Eye" onClick={() => setSelectedId(m.id)}>View</Button> },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Users"
        title="Member directory"
        subtitle="Search, filter and manage every ClubBloom membership."
        badge={<Badge tone="info">{members.length} total</Badge>}
        actions={<Button icon="Plus" onClick={() => { setForm(emptyForm); setErrors({}); setAddOpen(true); }}>Add member</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Users" label="Members" value={members.length} detail="All plans" />
        <StatCard icon="BadgeCheck" tone="green" label="Active" value={members.filter((m) => memberStatusLabel(m) === 'active').length} detail="Active memberships" delay={0.05} />
        <StatCard icon="AlertTriangle" tone="gold" label="Expiring ≤30d" value={members.filter((m) => { const d = daysLeft(m.expiryDate); return d >= 0 && d <= 30; }).length} detail="Needs a renewal nudge" delay={0.1} />
        <StatCard icon="CalendarX" tone="neon" label="Expired" value={members.filter((m) => daysLeft(m.expiryDate) < 0).length} detail="Lapsed memberships" delay={0.15} />
      </div>

      <Card glass>
        <CardTitle
          icon="Users"
          title="All members"
          hint={`${rows.length} shown`}
          right={
            <div className="cb-row wrap" style={{ gap: 10 }}>
              <SearchInput value={q} onChange={setQ} placeholder="Search name, email or ID…" />
              <ChipGroup options={membershipTypeFilters} value={plan} onChange={(o) => setPlan(o.id)} />
            </div>
          }
        />
        <DataTable
          columns={columns}
          rows={rows}
          empty={<EmptyState icon="Users" title="No members found" message="Try a different search term or plan filter." action={<Button icon="Plus" onClick={() => setAddOpen(true)}>Add member</Button>} />}
        />
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add member"
        subtitle="Create a new club membership"
        icon="User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button icon="Save" onClick={submitAdd}>Save member</Button>
          </>
        }
      >
        <FormRow>
          <Field label="Full name" required error={errors.name}><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Riya Sharma" /></Field>
          <Field label="Email" required error={errors.email}><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" /></Field>
        </FormRow>
        <FormRow>
          <Field label="Phone" required error={errors.phone}><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 …" /></Field>
          <Field label="Plan" required error={errors.plan}>
            <Select
              value={form.plan}
              onChange={(e) => set('plan', e.target.value)}
              options={[...membershipPlans.map((p) => ({ value: p.id, label: p.name })), { value: 'trial', label: 'Trial' }]}
            />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Age" error={errors.age}><Input type="number" value={form.age} onChange={(e) => set('age', e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Mumbai" /></Field>
        </FormRow>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name}
        subtitle={selected ? `${selected.id} · joined ${formatDate(selected.joined)}` : ''}
        icon="User"
        footer={
          selected ? (
            <>
              <Button variant="ghost" icon="Trash2" onClick={() => { suspendMember(selected.id); }}>{selected.suspended ? 'Reactivate' : 'Suspend'}</Button>
              <Button variant="outline" icon="CalendarPlus" onClick={() => extend(selected)}>Extend 30 days</Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="cb-stack" style={{ gap: 14 }}>
            <div className="cb-grid cols-2">
              <div><div className="tiny dim">Plan</div><Badge tone={planBadge[selected.plan] || 'neutral'}>{planLabel[selected.plan] || selected.plan}</Badge></div>
              <div><div className="tiny dim">Status</div><Badge tone={selected.suspended ? 'danger' : 'active'}>{selected.suspended ? 'Suspended' : 'Active'}</Badge></div>
              <div><div className="tiny dim">Email</div><div className="small">{selected.email}</div></div>
              <div><div className="tiny dim">Phone</div><div className="small">{selected.phone}</div></div>
              <div><div className="tiny dim">City</div><div className="small">{selected.city}</div></div>
              <div><div className="tiny dim">Age</div><div className="small">{selected.age}</div></div>
              <div><div className="tiny dim">Expiry</div><div className="small">{formatDate(selected.expiryDate)} · <span className={daysLeft(selected.expiryDate) < 0 ? 'text-neon' : 'text-warning'}>{expiryLabel(daysLeft(selected.expiryDate))}</span></div></div>
              <div><div className="tiny dim">Last visit</div><div className="small">{formatDate(selected.lastVisit)}</div></div>
              <div><div className="tiny dim">Sessions this month</div><div className="small mono">{selected.sessionsThisMonth}</div></div>
              <div><div className="tiny dim">Total spent</div><div className="small mono">{formatCurrency(selected.totalSpent)}</div></div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
