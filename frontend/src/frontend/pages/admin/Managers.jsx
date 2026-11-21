import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { addDays, toISODate, formatDate } from '../../utils/format';
import { integrationNotes } from '../../services/api';
import { Avatar, Badge, Button, Card, CardTitle, InfoNote, PageHeader, StatCard } from '../../components/ui/primitives';
import DataTable from '../../components/ui/DataTable';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Checkbox, Field, Input, validateFields } from '../../components/ui/form';

const PERMISSION_OPTIONS = [
  { id: 'members', label: 'Manage members' },
  { id: 'bookings', label: 'Manage bookings' },
  { id: 'courts', label: 'Manage courts' },
  { id: 'memberships', label: 'Manage memberships' },
  { id: 'inventory', label: 'Manage shop inventory' },
  { id: 'cafeteria', label: 'Manage cafeteria' },
  { id: 'staff', label: 'Manage staff' },
  { id: 'finance', label: 'View finance' },
  { id: 'reports', label: 'View reports' },
];

const EXTRA_MANAGERS = [
  { id: 'U-2002', name: 'Neha Grover', email: 'neha.grover@clubbloom.in', phone: '+91 98200 11002', city: 'Delhi', status: 'active', lastLogin: toISODate(addDays(new Date(), -2)), permissions: ['members', 'bookings', 'courts', 'memberships', 'cafeteria'] },
  { id: 'U-2003', name: 'Rohit Malhotra', email: 'rohit.malhotra@clubbloom.in', phone: '+91 98200 11022', city: 'Pune', status: 'suspended', lastLogin: toISODate(addDays(new Date(), -34)), permissions: ['bookings', 'courts'] },
  { id: 'U-2004', name: 'Sunita Rao', email: 'sunita.rao@clubbloom.in', phone: '+91 98200 11033', city: 'Chennai', status: 'active', lastLogin: toISODate(addDays(new Date(), -1)), permissions: ['members', 'memberships', 'inventory', 'cafeteria'] },
];

const RULES = {
  name: { required: true, message: 'Name is required.' },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  city: { required: true, message: 'City is required.' },
};

const EMPTY_FORM = { name: '', email: '', phone: '', city: '', permissions: [] };

export default function Managers() {
  const { accounts, toast } = useApp();

  const [records, setRecords] = useState(() => [
    ...accounts
      .filter((a) => a.role === 'manager')
      .map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        city: a.city,
        status: 'active',
        lastLogin: toISODate(addDays(new Date(), -1)),
        permissions: ['members', 'bookings', 'courts', 'memberships', 'inventory', 'cafeteria', 'staff'],
      })),
    ...EXTRA_MANAGERS,
  ]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const openEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, email: r.email, phone: r.phone, city: r.city, permissions: [...r.permissions] });
    setErrors({});
  };

  const openAdd = () => {
    setCreating(true);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  const togglePermission = (id) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id) ? prev.permissions.filter((p) => p !== id) : [...prev.permissions, id],
    }));
  };

  const save = () => {
    const { valid, errors: e } = validateFields(form, RULES);
    setErrors(e);
    if (!valid) return;
    if (editing) {
      setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...r, name: form.name, email: form.email, phone: form.phone, city: form.city, permissions: form.permissions } : r)));
      toast('Account updated', `${form.name}'s profile has been saved.`, 'success');
    } else {
      setRecords((prev) => [
        { id: `U-${Date.now()}`, name: form.name, email: form.email, phone: form.phone, city: form.city, status: 'active', lastLogin: toISODate(new Date()), permissions: form.permissions },
        ...prev,
      ]);
      toast('Manager added', `${form.name} can now sign in to the manager console.`, 'success');
    }
    closeForm();
  };

  const toggleStatus = (r) => {
    const next = r.status === 'active' ? 'suspended' : 'active';
    setRecords((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    toast('Account updated', `${r.name} is now ${next}.`, next === 'suspended' ? 'warning' : 'success');
  };

  const active = records.filter((r) => r.status === 'active').length;
  const suspended = records.length - active;

  const columns = [
    {
      key: 'name',
      label: 'Manager',
      render: (r) => (
        <div className="cb-row" style={{ gap: 10 }}>
          <Avatar name={r.name} />
          <div>
            <div className="small semibold">{r.name}</div>
            <div className="tiny dim">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'city', label: 'City', render: (r) => <span className="small muted">{r.city}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'active' : 'danger'}>{r.status}</Badge> },
    { key: 'lastLogin', label: 'Last login', render: (r) => <span className="tiny dim">{formatDate(r.lastLogin)}</span> },
    { key: 'permissions', label: 'Permissions', render: (r) => <span className="small mono">{r.permissions.length}</span> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="cb-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" icon="Edit" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant={r.status === 'active' ? 'ghost' : 'primary'} size="sm" icon={r.status === 'active' ? 'Ban' : 'CheckCircle2'} onClick={() => setConfirmTarget(r)}>
            {r.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        icon="UserCog"
        title="Manager Accounts"
        subtitle="Create and govern the club managers who operate the day-to-day console."
        badge={<Badge tone="info">Platform</Badge>}
        actions={<Button icon="Plus" onClick={openAdd}>Add manager</Button>}
      />

      <div className="cb-grid cols-3">
        <StatCard icon="UserCog" label="Managers" value={records.length} detail="Total accounts" />
        <StatCard icon="CheckCircle2" tone="green" label="Active" value={active} detail="Can sign in" delay={0.05} />
        <StatCard icon="Ban" tone="neon" label="Suspended" value={suspended} detail="Access revoked" delay={0.1} />
      </div>

      <Card glass style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: '16px 18px 4px' }}>
          <CardTitle icon="Users" title="Manager directory" hint="Accounts with manager-console access" />
        </div>
        <div style={{ padding: '0 18px 18px' }}>
          <DataTable columns={columns} rows={records} />
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <InfoNote icon="Info">
          Changes here are kept in local demo state only. Persisting accounts and permissions requires the backend — {integrationNotes[0]}
        </InfoNote>
      </div>

      <Modal
        open={Boolean(editing) || creating}
        onClose={closeForm}
        icon="UserCog"
        title={editing ? 'Edit manager' : 'Add manager'}
        subtitle={editing ? editing.name : 'Create a new manager-console account'}
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button icon="Save" onClick={save}>{editing ? 'Save changes' : 'Create account'}</Button>
          </>
        }
      >
        <div className="cb-grid cols-2" style={{ gap: 14 }}>
          <Field label="Full name" required error={errors.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Neha Grover" />
          </Field>
          <Field label="City" required error={errors.city}>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@clubbloom.in" />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98200 00000" />
          </Field>
        </div>
        <div style={{ marginTop: 8 }}>
          <div className="tiny dim" style={{ marginBottom: 8 }}>Console permissions</div>
          <div className="cb-grid cols-2" style={{ gap: 4 }}>
            {PERMISSION_OPTIONS.map((p) => (
              <Checkbox key={p.id} label={p.label} checked={form.permissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
            ))}
          </div>
        </div>
        {!editing ? (
          <p className="tiny dim">New accounts start with the password <span className="mono">clubbloom</span> in the demo.</p>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => toggleStatus(confirmTarget)}
        title={confirmTarget?.status === 'active' ? 'Suspend this manager?' : 'Reactivate this manager?'}
        confirmLabel={confirmTarget?.status === 'active' ? 'Suspend account' : 'Activate account'}
        tone={confirmTarget?.status === 'active' ? 'danger' : 'primary'}
        message={confirmTarget ? `${confirmTarget.name} will be ${confirmTarget.status === 'active' ? 'blocked from the manager console' : 'able to sign in again'}.` : ''}
      />
    </>
  );
}
