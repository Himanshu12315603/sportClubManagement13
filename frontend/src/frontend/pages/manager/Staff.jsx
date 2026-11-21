import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, ProgressBar, StatCard,
} from '../../components/ui/primitives';
import { Field, FormRow, Input, Select, validateFields } from '../../components/ui/form';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { staffRoles, shiftPlan, attendanceTrend } from '../../data/staff';
import { formatCurrency, formatDate } from '../../utils/format';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };
const shiftOptions = [{ value: 'Morning', label: 'Morning' }, { value: 'Evening', label: 'Evening' }, { value: 'Split', label: 'Split' }];
const roleOptions = staffRoles.map((r) => ({ value: r, label: r }));
const leaveTone = { pending: 'warning', approved: 'active', rejected: 'danger' };
const emptyForm = { name: '', role: 'Coach', dept: 'Coaching', shift: 'Morning', salary: '', phone: '' };

export default function ManagerStaff() {
  const { staff, addStaff, updateStaff, leaveRequests, decideLeave, toast } = useApp();
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const payroll = staff.reduce((n, s) => n + s.salary, 0);
  const avgAttendance = staff.length ? Math.round(staff.reduce((n, s) => n + s.attendance, 0) / staff.length) : 0;
  const openLeave = leaveRequests.filter((l) => l.status === 'pending').length;
  const editing = staff.find((s) => s.id === editId) || null;

  const openEdit = (s) => { setEditForm({ role: s.role, dept: s.dept, shift: s.shift, salary: s.salary, phone: s.phone }); setEditId(s.id); };
  const submitEdit = () => {
    updateStaff(editId, { role: editForm.role, dept: editForm.dept, shift: editForm.shift, salary: Number(editForm.salary) || 0, phone: editForm.phone });
    toast('Employee updated', 'Staff record saved.', 'success');
    setEditId(null);
  };

  const submitAdd = () => {
    const { valid, errors: errs } = validateFields(addForm, {
      name: { required: true, message: 'Enter the employee name.' },
      role: { required: true },
      salary: { required: true, min: 0, message: 'Enter a valid salary.' },
    });
    if (!valid) { setErrors(errs); return; }
    addStaff(addForm);
    setAddForm(emptyForm);
    setErrors({});
    setAddOpen(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (s) => (
        <div>
          <div className="small semibold">{s.name}</div>
          <div className="tiny dim mono">{s.id}</div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (s) => <Badge tone="neutral">{s.role}</Badge> },
    { key: 'dept', label: 'Dept', render: (s) => <span className="small dim">{s.dept}</span> },
    { key: 'shift', label: 'Shift', render: (s) => <span className="small">{s.shift}</span> },
    { key: 'attendance', label: 'Attendance', render: (s) => <div className="cb-row" style={{ gap: 8, minWidth: 130 }}><div style={{ flex: 1 }}><ProgressBar value={s.attendance} tone={s.attendance >= 95 ? 'green' : ''} /></div><span className="tiny mono">{s.attendance}%</span></div> },
    { key: 'rating', label: 'Rating', align: 'center', render: (s) => <span className="small mono">{s.rating} ★</span> },
    { key: 'salary', label: 'Salary', align: 'right', render: (s) => <span className="small mono semibold">{formatCurrency(s.salary, true)}</span> },
    { key: 'actions', label: '', align: 'right', render: (s) => <Button size="sm" variant="ghost" icon="Edit" onClick={() => openEdit(s)}>Edit</Button> },
  ];

  const leaveColumns = [
    { key: 'name', label: 'Employee', render: (l) => <span className="small semibold">{l.name}</span> },
    { key: 'type', label: 'Type', render: (l) => <Badge tone="neutral">{l.type}</Badge> },
    { key: 'window', label: 'Dates', render: (l) => <span className="tiny dim">{formatDate(l.from)} → {formatDate(l.to)}</span> },
    { key: 'days', label: 'Days', align: 'center', render: (l) => <span className="small mono">{l.days}</span> },
    { key: 'reason', label: 'Reason', render: (l) => <span className="tiny dim">{l.reason}</span> },
    { key: 'status', label: 'Status', render: (l) => <Badge tone={leaveTone[l.status] || 'neutral'}>{l.status}</Badge> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (l) => (l.status === 'pending' ? (
        <div className="cb-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="outline" icon="Check" onClick={() => decideLeave(l.id, 'approved')}>Approve</Button>
          <Button size="sm" variant="danger" icon="X" onClick={() => decideLeave(l.id, 'rejected')}>Reject</Button>
        </div>
      ) : <span className="tiny dim">—</span>),
    },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Briefcase"
        title="Staff & shifts"
        subtitle="Headcount, attendance, payroll and the weekly shift rota."
        badge={<Badge tone="info">{staff.length} employees</Badge>}
        actions={<Button icon="Plus" onClick={() => { setAddForm(emptyForm); setErrors({}); setAddOpen(true); }}>Add employee</Button>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Users" label="Headcount" value={staff.length} detail={`${staffRoles.length} roles covered`} />
        <StatCard icon="CheckCircle2" tone="green" label="Avg attendance" value={`${avgAttendance}%`} detail="Last 7 days" delay={0.05} />
        <StatCard icon="UserClock" tone="gold" label="Open leave requests" value={openLeave} detail={`${leaveRequests.length} total`} delay={0.1} />
        <StatCard icon="Wallet" label="Monthly payroll" value={formatCurrency(payroll, true)} detail="Base salaries" delay={0.15} />
      </div>

      <Card glass>
        <CardTitle icon="Users" title="Team directory" hint={`${staff.length} employees`} />
        <DataTable
          columns={columns}
          rows={staff}
          empty={<EmptyState icon="Users" title="No employees" message="Add your first team member." action={<Button icon="Plus" onClick={() => setAddOpen(true)}>Add employee</Button>} />}
        />
      </Card>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <Card glass>
          <CardTitle icon="Activity" title="Attendance trend" hint="Present vs absent this week" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceTrend} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} width={44} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" stackId="att" radius={[6, 6, 0, 0]} fill="#00a3ff" />
              <Bar dataKey="absent" name="Absent" stackId="att" fill="#ff1744" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card glass>
          <CardTitle icon="CalendarDays" title="Weekly shift plan" hint="Morning & evening coverage" />
          <div className="cb-stack" style={{ gap: 10 }}>
            {shiftPlan.map((day) => (
              <div key={day.id} className="cb-card glass" style={{ padding: 14 }}>
                <div className="small semibold" style={{ marginBottom: 8 }}>{day.day}</div>
                <div className="cb-grid cols-2" style={{ gap: 10 }}>
                  <div>
                    <div className="tiny dim" style={{ marginBottom: 4 }}>Morning</div>
                    <div className="cb-row wrap" style={{ gap: 6 }}>{day.morning.map((n) => <span key={n} className="chip">{n}</span>)}</div>
                  </div>
                  <div>
                    <div className="tiny dim" style={{ marginBottom: 4 }}>Evening</div>
                    <div className="cb-row wrap" style={{ gap: 6 }}>{day.evening.map((n) => <span key={n} className="chip">{n}</span>)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card glass>
        <CardTitle icon="UserClock" title="Leave requests" hint={`${openLeave} awaiting a decision`} />
        <DataTable
          columns={leaveColumns}
          rows={leaveRequests}
          empty={<EmptyState icon="UserClock" title="No leave requests" message="Staff leave requests will appear here." />}
        />
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditId(null)}
        title="Edit employee"
        subtitle={editing?.name}
        icon="Edit"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
            <Button icon="Save" onClick={submitEdit}>Save</Button>
          </>
        }
      >
        <FormRow>
          <Field label="Role"><Select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} options={roleOptions} /></Field>
          <Field label="Department"><Input value={editForm.dept || ''} onChange={(e) => setEditForm((f) => ({ ...f, dept: e.target.value }))} /></Field>
        </FormRow>
        <FormRow>
          <Field label="Shift"><Select value={editForm.shift} onChange={(e) => setEditForm((f) => ({ ...f, shift: e.target.value }))} options={shiftOptions} /></Field>
          <Field label="Salary (₹)"><Input type="number" value={editForm.salary ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, salary: e.target.value }))} /></Field>
        </FormRow>
        <Field label="Phone"><Input value={editForm.phone || ''} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add employee"
        subtitle="Onboard a new team member"
        icon="Plus"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button icon="Save" onClick={submitAdd}>Add employee</Button>
          </>
        }
      >
        <FormRow>
          <Field label="Full name" required error={errors.name}><Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Aisha Khan" /></Field>
          <Field label="Role" required error={errors.role}><Select value={addForm.role} onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))} options={roleOptions} /></Field>
        </FormRow>
        <FormRow>
          <Field label="Department"><Input value={addForm.dept} onChange={(e) => setAddForm((f) => ({ ...f, dept: e.target.value }))} /></Field>
          <Field label="Shift"><Select value={addForm.shift} onChange={(e) => setAddForm((f) => ({ ...f, shift: e.target.value }))} options={shiftOptions} /></Field>
        </FormRow>
        <FormRow>
          <Field label="Salary (₹)" required error={errors.salary}><Input type="number" value={addForm.salary} onChange={(e) => setAddForm((f) => ({ ...f, salary: e.target.value }))} /></Field>
          <Field label="Phone"><Input value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 …" /></Field>
        </FormRow>
      </Modal>
    </div>
  );
}
