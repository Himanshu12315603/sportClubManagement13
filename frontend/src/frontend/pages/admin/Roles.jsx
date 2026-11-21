import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, CardTitle, InfoNote, PageHeader } from '../../components/ui/primitives';
import DataTable from '../../components/ui/DataTable';
import Icon from '../../components/ui/Icon';
import { Checkbox } from '../../components/ui/form';

const PERMISSIONS = [
  { id: 'members', label: 'Manage members' },
  { id: 'bookings', label: 'Manage bookings' },
  { id: 'courts', label: 'Manage courts' },
  { id: 'memberships', label: 'Manage memberships' },
  { id: 'shop', label: 'Manage shop inventory' },
  { id: 'cafeteria', label: 'Manage cafeteria' },
  { id: 'staff', label: 'Manage staff' },
  { id: 'viewFinance', label: 'View finance' },
  { id: 'manageFinance', label: 'Manage finance' },
  { id: 'settings', label: 'Manage platform settings' },
  { id: 'accounts', label: 'Manage accounts & roles' },
  { id: 'audit', label: 'View audit logs' },
  { id: 'notifications', label: 'Send notifications' },
];

const ROLES = ['Administrator', 'Manager', 'Staff'];
const ROLE_META = {
  Administrator: { icon: 'ShieldCheck', iconTone: 'gold', badge: 'gold', desc: 'Full platform control across every club and setting.' },
  Manager: { icon: 'Briefcase', iconTone: '', badge: 'neutral', desc: 'Day-to-day club operations and reporting.' },
  Staff: { icon: 'Users', iconTone: 'green', badge: 'active', desc: 'Front-line access to bookings and the cafeteria.' },
};

const MANAGER_ON = ['members', 'bookings', 'courts', 'memberships', 'shop', 'cafeteria', 'staff', 'viewFinance', 'notifications'];
const STAFF_ON = ['cafeteria', 'bookings'];

function buildInitial() {
  const admin = {};
  const manager = {};
  const staff = {};
  PERMISSIONS.forEach((p) => {
    admin[p.id] = true;
    manager[p.id] = MANAGER_ON.includes(p.id);
    staff[p.id] = STAFF_ON.includes(p.id);
  });
  return { Administrator: admin, Manager: manager, Staff: staff };
}

export default function Roles() {
  const { accounts, staff, toast } = useApp();
  const [matrix, setMatrix] = useState(buildInitial);

  const counts = {
    Administrator: accounts.filter((a) => a.role === 'admin').length,
    Manager: accounts.filter((a) => a.role === 'manager').length,
    Staff: staff.length,
  };

  const toggle = (role, permId) => {
    const next = !matrix[role][permId];
    setMatrix((prev) => ({ ...prev, [role]: { ...prev[role], [permId]: next } }));
    const label = PERMISSIONS.find((p) => p.id === permId)?.label || permId;
    toast('Permission updated', `${label} turned ${next ? 'on' : 'off'} for ${role}.`, 'info');
  };

  const enabledCount = (role) => PERMISSIONS.filter((p) => matrix[role][p.id]).length;

  const columns = [
    { key: 'label', label: 'Permission', render: (r) => <span className="small semibold">{r.label}</span> },
    ...ROLES.map((role) => ({
      key: role,
      label: role,
      align: 'center',
      render: (r) => <Checkbox label="" checked={matrix[role][r.id]} onChange={() => toggle(role, r.id)} />,
    })),
  ];

  return (
    <>
      <PageHeader
        icon="ShieldCheck"
        title="Roles & Permissions"
        subtitle="Define what each console role is allowed to do across the platform."
        badge={<Badge tone="info">Governance</Badge>}
        actions={<Button icon="Save" onClick={() => toast('Roles saved', 'Role configuration applied to the demo session.', 'success')}>Save role configuration</Button>}
      />

      <div className="cb-grid cols-3">
        {ROLES.map((role) => (
          <Card glass key={role}>
            <CardTitle icon={ROLE_META[role].icon} title={role} hint={`${counts[role]} account${counts[role] === 1 ? '' : 's'}`} right={<Badge tone={ROLE_META[role].badge}>{enabledCount(role)} / {PERMISSIONS.length}</Badge>} />
            <p className="small muted" style={{ marginBottom: 12 }}>{ROLE_META[role].desc}</p>
            <div className="cb-row wrap" style={{ gap: 6 }}>
              {PERMISSIONS.filter((p) => matrix[role][p.id]).slice(0, 6).map((p) => (
                <span key={p.id} className="chip active" style={{ fontSize: 11 }}>{p.label}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card glass style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: '16px 18px 4px' }}>
          <CardTitle icon="Lock" title="Permission matrix" hint="Toggle a cell to grant or revoke a capability" />
        </div>
        <div style={{ padding: '0 18px 18px' }}>
          <DataTable columns={columns} rows={PERMISSIONS} />
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <InfoNote icon="ShieldCheck">
          These permissions are demo toggles held in local state — they are not yet enforced. Wire them to server-side role checks before relying on them.
        </InfoNote>
      </div>

      <div className="cb-grid cols-3" style={{ marginTop: 18 }}>
        {ROLES.map((role) => (
          <Card glass key={`${role}-note`}>
            <div className="cb-row" style={{ gap: 10 }}>
              <span className={`stat-icon ${ROLE_META[role].iconTone}`} style={{ width: 34, height: 34, borderRadius: 10 }}><Icon name={ROLE_META[role].icon} size={16} /></span>
              <div>
                <div className="small semibold">{role} capabilities</div>
                <div className="tiny dim">{enabledCount(role)} of {PERMISSIONS.length} permissions enabled</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
