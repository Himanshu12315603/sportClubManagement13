import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { staffRoles } from '../../data/staff';
import { addDays, toISODate, formatDate } from '../../utils/format';
import { Avatar, Badge, Button, Card, CardTitle, InfoNote, PageHeader, StatCard } from '../../components/ui/primitives';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Field, Input, Select, validateFields } from '../../components/ui/form';

const DEPT_ACCESS = {
  Coaching: 'Elevated',
  Accounts: 'Elevated',
  Operations: 'Standard',
  Cafeteria: 'Standard',
  Retail: 'Standard',
  Facilities: 'Restricted',
};

const DEPTS = ['Coaching', 'Operations', 'Cafeteria', 'Retail', 'Facilities', 'Accounts'];
const ACCESS_LEVELS = ['Standard', 'Elevated', 'Restricted'];
const SHIFTS = ['Morning', 'Evening', 'Split'];

const ACCESS_TONE = { Elevated: 'gold', Restricted: 'danger', Standard: 'neutral' };

function emailFor(name) {
  const parts = String(name).toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
  return `${parts[0]}.${parts[parts.length - 1]}@clubbloom.in`;
}

export default function StaffAccounts() {
  const { staff, addStaff, updateStaff, toast } = useApp();

  const [overrides, setOverrides] = useState({});
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ accessLevel: 'Standard', dept: 'Operations' });
  const [addForm, setAddForm] = useState({ name: '', role: '', dept: 'Operations', shift: 'Morning', phone: '', salary: '' });
  const [errors, setErrors] = useState({});

  const records = useMemo(
    () =>
      staff.map((s, i) => {
        const ov = overrides[s.id] || {};
        return {
          id: s.id,
          name: s.name,
          role: s.role,
          dept: s.dept,
          email: emailFor(s.name),
          accessLevel: ov.accessLevel || DEPT_ACCESS[s.dept] || 'Standard',
          lastLogin: toISODate(addDays(new Date(), -(i + 1))),
          status: ov.status || 'active',
        };
      }),
    [staff, overrides]
  );

  const openEdit = (r) => {
    setEditing(r);
    setForm({ accessLevel: r.accessLevel, dept: r.dept });
  };

  const saveAccess = () => {
    updateStaff(editing.id, { dept: form.dept });
    setOverrides((prev) => ({
      ...prev,
      [editing.id]: { ...prev[editing.id], accessLevel: form.accessLevel, dept: form.dept },
    }));
    toast('Access updated', `${editing.name} now has ${form.accessLevel.toLowerCase()} access.`, 'success');
    setEditing(null);
  };

  const toggleStatus = (r) => {
    const next = r.status === 'active' ? 'disabled' : 'active';
    setOverrides((prev) => ({ ...prev, [r.id]: { ...prev[r.id], status: next } }));
    toast('Account updated', `${r.name}'s account has been ${next === 'disabled' ? 'disabled' : 're-enabled'}.`, next === 'disabled' ? 'warning' : 'success');
  };

  const openAdd = () => {
    setCreating(true);
    setAddForm({ name: '', role: '', dept: 'Operations', shift: 'Morning', phone: '', salary: '' });
    setErrors({});
  };

  const saveAdd = () => {
    const { valid, errors: e } = validateFields(addForm, {
      name: { required: true, message: 'Name is required.' },
      role: { required: true, message: 'Choose a role.' },
      phone: { required: true, phone: true },
    });
    setErrors(e);
    if (!valid) return;
    addStaff(addForm);
    setCreating(false);
  };

  const elevated = records.filter((r) => r.accessLevel === 'Elevated').length;
  const restricted = records.filter((r) => r.accessLevel === 'Restricted').length;
  const disabled = records.filter((r) => r.status === 'disabled').length;

  const columns = [
    {
      key: 'name',
      label: 'Staff account',
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
    { key: 'role', label: 'Role', render: (r) => <span className="small muted">{r.role}</span> },
    { key: 'dept', label: 'Department', render: (r) => <span className="small">{r.dept}</span> },
    { key: 'accessLevel', label: 'Access', render: (r) => <Badge tone={ACCESS_TONE[r.accessLevel]}>{r.accessLevel}</Badge> },
    { key: 'lastLogin', label: 'Last login', render: (r) => <span className="tiny dim">{formatDate(r.lastLogin)}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'active' : 'danger'}>{r.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="cb-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" icon="Edit" onClick={() => openEdit(r)}>Edit access</Button>
          <Button variant={r.status === 'active' ? 'ghost' : 'primary'} size="sm" icon={r.status === 'active' ? 'Ban' : 'CheckCircle2'} onClick={() => toggleStatus(r)}>
            {r.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        icon="Users"
        title="Staff Accounts"
        subtitle="Platform accounts for every team member, with console access levels."
        badge={<Badge tone="info">Platform</Badge>}
        actions={<Button icon="Plus" onClick={openAdd}>Add staff account</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Users" label="Total accounts" value={records.length} detail="All staff" />
        <StatCard icon="ShieldCheck" tone="gold" label="Elevated access" value={elevated} detail="Coaching & Accounts" delay={0.05} />
        <StatCard icon="Lock" tone="neon" label="Restricted" value={restricted} detail="Facilities only" delay={0.1} />
        <StatCard icon="Ban" label="Disabled" value={disabled} detail="Sign-in blocked" delay={0.15} />
      </div>

      <Card glass style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: '16px 18px 4px' }}>
          <CardTitle icon="Briefcase" title="Staff account directory" hint="Derived from the staff directory" />
        </div>
        <div style={{ padding: '0 18px 18px' }}>
          <DataTable columns={columns} rows={records} />
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <InfoNote icon="Info">
          Access levels are demo-only labels stored in local state. Enforcing them server-side requires the backend account API.
        </InfoNote>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        icon="ShieldCheck"
        title="Edit access"
        subtitle={editing ? editing.name : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button icon="Save" onClick={saveAccess}>Save access</Button>
          </>
        }
      >
        <div className="cb-grid cols-2" style={{ gap: 14 }}>
          <Field label="Access level" hint="Controls what this account can reach">
            <Select value={form.accessLevel} onChange={(e) => setForm({ ...form, accessLevel: e.target.value })} options={ACCESS_LEVELS.map((a) => ({ value: a, label: a }))} />
          </Field>
          <Field label="Department" hint="Also updates the staff directory">
            <Select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} options={DEPTS.map((d) => ({ value: d, label: d }))} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        icon="Users"
        title="Add staff account"
        subtitle="Create a console account for a new team member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button icon="Save" onClick={saveAdd}>Create account</Button>
          </>
        }
      >
        <div className="cb-grid cols-2" style={{ gap: 14 }}>
          <Field label="Full name" required error={errors.name}>
            <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="e.g. Kavya Menon" />
          </Field>
          <Field label="Role" required error={errors.role}>
            <Select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} placeholder="Select role" options={staffRoles.map((r) => ({ value: r, label: r }))} />
          </Field>
          <Field label="Department">
            <Select value={addForm.dept} onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })} options={DEPTS.map((d) => ({ value: d, label: d }))} />
          </Field>
          <Field label="Shift">
            <Select value={addForm.shift} onChange={(e) => setAddForm({ ...addForm, shift: e.target.value })} options={SHIFTS.map((s) => ({ value: s, label: s }))} />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+91 98200 00000" />
          </Field>
          <Field label="Monthly salary">
            <Input type="number" value={addForm.salary} onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })} placeholder="e.g. 45000" />
          </Field>
        </div>
      </Modal>
    </>
  );
}
