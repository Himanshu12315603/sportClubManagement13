import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/format';
import { useDebounced } from '../../hooks/useUi';
import { Badge, Button, Card, CardTitle, ChipGroup, KeyValue, PageHeader, StatCard } from '../../components/ui/primitives';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/form';

const SEVERITY_TONE = { info: 'info', warning: 'warning', critical: 'danger' };

function minsAgo(m) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

const ENTRIES = [
  { id: 'AL-1001', at: minsAgo(6), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Signed in to the admin console', target: 'console.clubbloom.in', ip: '103.21.58.4', severity: 'info' },
  { id: 'AL-1002', at: minsAgo(18), actor: 'Vikram Sethi', actorRole: 'Manager', action: 'Exported finance report', target: 'reports/finance-ytd.csv', ip: '49.36.12.90', severity: 'info' },
  { id: 'AL-1003', at: minsAgo(42), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Granted "Manage finance" to role Manager', target: 'roles/manager', ip: '103.21.58.4', severity: 'warning' },
  { id: 'AL-1004', at: minsAgo(65), actor: 'Vikram Sethi', actorRole: 'Manager', action: 'Updated club setting gstPct → 18', target: 'settings/club', ip: '49.36.12.90', severity: 'info' },
  { id: 'AL-1005', at: minsAgo(88), actor: 'Unknown user', actorRole: 'System', action: 'Failed sign-in attempt (3 tries)', target: 'auth/login', ip: '185.220.101.7', severity: 'critical' },
  { id: 'AL-1006', at: minsAgo(120), actor: 'Vikram Sethi', actorRole: 'Manager', action: 'Suspended member MB-1008', target: 'members/MB-1008', ip: '49.36.12.90', severity: 'warning' },
  { id: 'AL-1007', at: minsAgo(150), actor: 'Vikram Sethi', actorRole: 'Manager', action: 'Payroll CSV export failed', target: 'reports/payroll.csv', ip: '49.36.12.90', severity: 'critical' },
  { id: 'AL-1008', at: minsAgo(180), actor: 'Simran Kaur', actorRole: 'Staff', action: 'Signed in to the staff console', target: 'console.clubbloom.in', ip: '122.176.44.19', severity: 'info' },
  { id: 'AL-1009', at: minsAgo(210), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Created role "Weekend Coach"', target: 'roles', ip: '103.21.58.4', severity: 'info' },
  { id: 'AL-1010', at: minsAgo(240), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Enabled maintenance mode', target: 'settings/platform', ip: '103.21.58.4', severity: 'warning' },
  { id: 'AL-1011', at: minsAgo(280), actor: 'Vikram Sethi', actorRole: 'Manager', action: 'Reactivated member MB-1010', target: 'members/MB-1010', ip: '49.36.12.90', severity: 'info' },
  { id: 'AL-1012', at: minsAgo(320), actor: 'Vikram Sethi', actorRole: 'Manager', action: 'Manually overrode a court booking', target: 'bookings/BK-8841', ip: '49.36.12.90', severity: 'info' },
  { id: 'AL-1013', at: minsAgo(360), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Created staff account ST-11', target: 'staff/ST-11', ip: '103.21.58.4', severity: 'info' },
  { id: 'AL-1014', at: minsAgo(420), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Revoked "Manage platform settings" from Manager', target: 'roles/manager', ip: '103.21.58.4', severity: 'warning' },
  { id: 'AL-1015', at: minsAgo(480), actor: 'Simran Kaur', actorRole: 'Staff', action: 'Exported members list', target: 'members/export.csv', ip: '122.176.44.19', severity: 'info' },
  { id: 'AL-1016', at: minsAgo(520), actor: 'Unknown user', actorRole: 'System', action: 'Blocked repeated failed logins', target: 'auth/login', ip: '45.155.205.233', severity: 'warning' },
  { id: 'AL-1017', at: minsAgo(600), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Reset password for vikram.sethi@clubbloom.in', target: 'accounts/U-2001', ip: '103.21.58.4', severity: 'warning' },
  { id: 'AL-1018', at: minsAgo(700), actor: 'Anita Bhatt', actorRole: 'Administrator', action: 'Updated trial period 14 → 21 days', target: 'settings/rules', ip: '103.21.58.4', severity: 'info' },
];

const SEVERITY_OPTIONS = [
  { id: 'all', label: 'All severities' },
  { id: 'info', label: 'Info' },
  { id: 'warning', label: 'Warning' },
  { id: 'critical', label: 'Critical' },
];

const ROLE_OPTIONS = [
  { id: 'all', label: 'All roles' },
  { id: 'Administrator', label: 'Administrator' },
  { id: 'Manager', label: 'Manager' },
  { id: 'Staff', label: 'Staff' },
  { id: 'System', label: 'System' },
];

export default function Audit() {
  const { toast } = useApp();
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const debounced = useDebounced(query);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return ENTRIES.filter((e) => {
      if (severity !== 'all' && e.severity !== severity) return false;
      if (roleFilter !== 'all' && e.actorRole !== roleFilter) return false;
      if (!q) return true;
      return `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(q);
    });
  }, [debounced, severity, roleFilter]);

  const warnings = ENTRIES.filter((e) => e.severity === 'warning').length;
  const critical = ENTRIES.filter((e) => e.severity === 'critical').length;
  const uniqueActors = new Set(ENTRIES.map((e) => e.actor)).size;

  const exportLog = () => {
    const header = ['id', 'at', 'actor', 'actorRole', 'action', 'target', 'ip', 'severity'];
    const lines = ENTRIES.map((e) => header.map((h) => `"${e[h]}"`).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clubbloom-audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Audit log exported', `${ENTRIES.length} events downloaded as CSV.`, 'success');
  };

  const columns = [
    { key: 'severity', label: 'Severity', render: (r) => <Badge tone={SEVERITY_TONE[r.severity]}>{r.severity}</Badge> },
    {
      key: 'actor',
      label: 'Actor',
      render: (r) => (
        <div>
          <div className="small semibold">{r.actor}</div>
          <div className="tiny dim">{r.actorRole}</div>
        </div>
      ),
    },
    { key: 'action', label: 'Action', render: (r) => <span className="small">{r.action}</span> },
    { key: 'target', label: 'Target', render: (r) => <span className="tiny mono dim">{r.target}</span> },
    { key: 'ip', label: 'IP', render: (r) => <span className="tiny mono">{r.ip}</span> },
    { key: 'at', label: 'When', render: (r) => <span className="tiny dim">{formatDateTime(r.at)}</span> },
  ];

  return (
    <>
      <PageHeader
        icon="ScrollText"
        title="Audit Logs"
        subtitle="Immutable trail of sign-ins, permission changes, exports and system events."
        badge={<Badge tone="info">Governance</Badge>}
        actions={<Button variant="outline" icon="Download" onClick={exportLog}>Export log</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Activity" label="Events today" value={ENTRIES.length} detail="Last 24 hours" />
        <StatCard icon="AlertTriangle" tone="gold" label="Warnings" value={warnings} detail="Needs review" delay={0.05} />
        <StatCard icon="Ban" tone="neon" label="Critical" value={critical} detail="Security events" delay={0.1} />
        <StatCard icon="Users" label="Unique actors" value={uniqueActors} detail="Distinct accounts" delay={0.15} />
      </div>

      <Card glass style={{ marginTop: 18 }}>
        <div className="cb-row between wrap" style={{ gap: 12, marginBottom: 12 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search actor, action or target…" />
          <div className="cb-row wrap" style={{ gap: 10 }}>
            <ChipGroup options={SEVERITY_OPTIONS} value={severity} onChange={(o) => setSeverity(o.id)} />
            <ChipGroup options={ROLE_OPTIONS} value={roleFilter} onChange={(o) => setRoleFilter(o.id)} />
          </div>
        </div>
        <DataTable columns={columns} rows={filtered} onRowClick={setSelected} />
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        icon="ScrollText"
        title={selected?.action}
        subtitle={selected ? `${selected.id} · ${selected.actorRole}` : ''}
        footer={<Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected ? (
          <div>
            <KeyValue label="Event ID" value={selected.id} mono />
            <KeyValue label="Actor" value={selected.actor} />
            <KeyValue label="Role" value={selected.actorRole} />
            <KeyValue label="Action" value={selected.action} />
            <KeyValue label="Target" value={selected.target} mono />
            <KeyValue label="IP address" value={selected.ip} mono />
            <KeyValue label="Timestamp" value={formatDateTime(selected.at)} />
            <div style={{ marginTop: 12 }}>
              <Badge tone={SEVERITY_TONE[selected.severity]}>{selected.severity}</Badge>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
