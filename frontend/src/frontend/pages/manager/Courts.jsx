import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard, ChipGroup,
} from '../../components/ui/primitives';
import { Field, FormRow, Input, Select } from '../../components/ui/form';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Icon from '../../components/ui/Icon';
import { useApp } from '../../context/AppContext';
import { bookableSports, BOOKING_RULES } from '../../data/courts';
import { courtUtilization } from '../../data/analytics';
import { formatCurrency, formatDate, toISODate } from '../../utils/format';

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#172b4d',
  boxShadow: '0 10px 25px -4px rgba(23, 43, 77, 0.12)',
  padding: '10px 14px',
};

function slotOptions() {
  const [oh, om] = BOOKING_RULES.openingTime.split(':').map(Number);
  const [ch, cm] = BOOKING_RULES.closingTime.split(':').map(Number);
  const last = ch * 60 + cm - BOOKING_RULES.slotStepMinutes;
  const opts = [];
  for (let m = oh * 60 + om; m <= last; m += BOOKING_RULES.slotStepMinutes) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const label = `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    opts.push({ value: label, label });
  }
  return opts;
}

const SLOT_OPTIONS = slotOptions();
const COURT_OPTIONS = bookableSports.flatMap((s) => s.courts.map((c) => ({ value: c.id, label: `${c.id} · ${s.name} · ${c.name}` })));

const dateRangeOptions = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'This Month' },
  { id: '90d', label: 'Quarterly' },
];

export default function ManagerCourts() {
  const { maintenance, blockCourt, unblockCourt, bookings } = useApp();
  const [blockOpen, setBlockOpen] = useState(false);
  const [form, setForm] = useState({ courtId: COURT_OPTIONS[0]?.value || '', date: toISODate(new Date()), start: '12:00', end: '14:00', reason: '' });
  const [removeIndex, setRemoveIndex] = useState(null);
  const [range, setRange] = useState('7d');

  const utilById = useMemo(() => Object.fromEntries(courtUtilization.map((c) => [c.court, c])), []);
  const totalCourts = bookableSports.reduce((n, s) => n + s.courts.length, 0);
  const avgUtil = Math.round(courtUtilization.reduce((n, c) => n + c.utilization, 0) / courtUtilization.length);

  // Enhanced dataset with hours calculation
  const chartData = useMemo(() => {
    return courtUtilization.map((c) => {
      const totalHours = 16; // 06:00 to 22:00
      const bookedHours = Math.round((totalHours * c.utilization) / 100);
      const availableHours = totalHours - bookedHours;
      return {
        ...c,
        bookedHours,
        availableHours,
      };
    });
  }, []);

  const maintenanceRows = maintenance.map((m, i) => ({ ...m, id: `${m.courtId}-${m.date}-${m.start}-${i}`, index: i }));

  const openBlock = (courtId) => {
    setForm((f) => ({ ...f, courtId: courtId || f.courtId }));
    setBlockOpen(true);
  };

  const submitBlock = () => {
    blockCourt({ courtId: form.courtId, date: form.date, start: form.start, end: form.end, reason: form.reason || 'Routine Maintenance' });
    setBlockOpen(false);
    setForm((f) => ({ ...f, reason: '' }));
  };

  const maintColumns = [
    { key: 'court', label: 'Court Ref', render: (r) => <span className="small semibold mono">{r.courtId}</span> },
    { key: 'date', label: 'Date', render: (r) => <span className="small dim">{formatDate(r.date)}</span> },
    { key: 'window', label: 'Maintenance Window', render: (r) => <span className="small mono">{r.start}–{r.end}</span> },
    { key: 'reason', label: 'Reason', render: (r) => <span className="small muted">{r.reason}</span> },
    { key: 'actions', label: '', align: 'right', render: (r) => <Button size="sm" variant="danger" icon="Trash2" onClick={() => setRemoveIndex(r.index)}>Release</Button> },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Map"
        title="Court Operations & Status"
        subtitle="Live court utilization, maintenance scheduling and hourly capacity analytics."
        badge={<Badge tone="info">{totalCourts} sports facilities</Badge>}
        actions={<Button icon="Ban" variant="outline" onClick={() => openBlock()}>Schedule Maintenance</Button>}
      />

      <div className="cb-grid cols-3">
        <StatCard icon="Building2" label="Total Courts" value={totalCourts} detail={`${bookableSports.length} active disciplines`} />
        <StatCard icon="Wrench" tone="neon" label="Maintenance Holds" value={maintenance.length} detail="Blocked court intervals" delay={0.05} />
        <StatCard icon="BarChart3" tone="green" label="Average Occupancy" value={`${avgUtil}%`} detail="Peak-weighted club usage" delay={0.1} />
      </div>

      {/* Modern Analytics Bar Chart with Rounded Gradient Styling */}
      <Card glass>
        <div className="cb-row between wrap" style={{ marginBottom: 18, gap: 12 }}>
          <CardTitle icon="BarChart3" title="Court Utilization Analytics" hint="Percentage of daily bookable hours booked by members" />
          <div className="cb-row" style={{ gap: 8 }}>
            <ChipGroup options={dateRangeOptions} value={range} onChange={(o) => setRange(o.id)} />
          </div>
        </div>

        <div className="cb-row wrap" style={{ gap: 16, marginBottom: 14 }}>
          <div className="cb-row tiny" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#16a085', display: 'inline-block' }} />
            <span className="semibold">High Utilization (≥80%)</span>
          </div>
          <div className="cb-row tiny" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#3b82f6', display: 'inline-block' }} />
            <span className="semibold">Healthy Usage (60%–79%)</span>
          </div>
          <div className="cb-row tiny" style={{ gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b', display: 'inline-block' }} />
            <span className="semibold">Off-Peak Opportunity (&lt;60%)</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="court" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} width={48} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v, name, item) => [
                `${v}% (${item.payload.bookedHours}h booked / ${item.payload.availableHours}h open)`,
                'Occupancy Rate',
              ]}
              labelFormatter={(label) => `Facility: ${label}`}
            />
            <Bar dataKey="utilization" name="Occupancy" radius={[8, 8, 0, 0]}>
              {chartData.map((c) => (
                <Cell
                  key={c.court}
                  fill={c.utilization >= 80 ? '#16a085' : c.utilization >= 60 ? '#3b82f6' : '#f59e0b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Facilities Grid */}
      {bookableSports.map((sport) => (
        <Card glass key={sport.id}>
          <CardTitle
            icon={sport.icon}
            title={`${sport.name} Courts`}
            hint={`${sport.courts.length} courts · ${sport.hours}`}
            right={<Badge tone="neutral">{formatCurrency(sport.peakPrice)} peak rate</Badge>}
          />
          <div className="cb-grid cb-auto" style={{ gap: 16 }}>
            {sport.courts.map((court) => {
              const util = utilById[court.id];
              return (
                <div
                  key={court.id}
                  className="cb-card"
                  style={{
                    padding: 16,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    background: '#ffffff',
                  }}
                >
                  <div className="cb-row between" style={{ marginBottom: 8 }}>
                    <span className="small semibold mono">{court.id}</span>
                    <Badge tone={util ? (util.utilization >= 80 ? 'active' : util.utilization >= 60 ? 'info' : 'warning') : 'neutral'}>
                      {util ? `${util.utilization}% Occupancy` : 'Open'}
                    </Badge>
                  </div>
                  <div className="small semibold" style={{ color: '#172b4d' }}>{court.name}</div>
                  <div className="tiny dim" style={{ marginBottom: 10 }}>{court.surface}</div>

                  <div className="cb-row wrap" style={{ gap: 6 }}>
                    {court.indoor ? <Badge tone="neutral" icon="Building2">Indoor</Badge> : <Badge tone="neutral" icon="Sun">Outdoor</Badge>}
                    {court.shared ? <Badge tone="info" icon="Shuffle">Shared</Badge> : null}
                    {court.lights ? <Badge tone="warning" icon="Zap">Floodlit</Badge> : null}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    icon="Ban"
                    block
                    style={{ marginTop: 14 }}
                    onClick={() => openBlock(court.id)}
                  >
                    Hold for Maintenance
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Maintenance Table */}
      <Card glass>
        <CardTitle
          icon="Wrench"
          title="Scheduled Maintenance Holds"
          hint={`${maintenanceRows.length} active court reservations`}
          right={
            <Button size="sm" variant="outline" icon="Plus" onClick={() => openBlock()}>
              Hold a Court
            </Button>
          }
        />
        <DataTable
          columns={maintColumns}
          rows={maintenanceRows}
          empty={
            <EmptyState
              icon="Wrench"
              title="No maintenance holds active"
              message="All club courts are in prime condition and open for member bookings."
            />
          }
        />
      </Card>

      {/* Maintenance Block Modal */}
      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Schedule Court Maintenance"
        subtitle="Block a court for repairs, cleaning, or tournaments"
        icon="Ban"
      >
        <div className="cb-stack" style={{ gap: 14 }}>
          <Field label="Target Court">
            <Select
              value={form.courtId}
              onChange={(e) => setForm((f) => ({ ...f, courtId: e.target.value }))}
              options={COURT_OPTIONS}
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </Field>
          <FormRow>
            <Field label="Start Time">
              <Select
                value={form.start}
                onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                options={SLOT_OPTIONS}
              />
            </Field>
            <Field label="End Time">
              <Select
                value={form.end}
                onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                options={SLOT_OPTIONS}
              />
            </Field>
          </FormRow>
          <Field label="Reason / Notes">
            <Input
              placeholder="e.g. Grass re-seeding, net repair, tournament setup"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </Field>
          <div className="cb-row between" style={{ marginTop: 10, gap: 12 }}>
            <Button variant="ghost" onClick={() => setBlockOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="primary" icon="Ban" onClick={submitBlock} style={{ flex: 1 }}>
              Apply Maintenance Hold
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unblock Confirmation */}
      <ConfirmDialog
        open={removeIndex !== null}
        onClose={() => setRemoveIndex(null)}
        onConfirm={() => {
          if (removeIndex !== null) {
            unblockCourt(removeIndex);
            setRemoveIndex(null);
          }
        }}
        title="Remove Maintenance Hold?"
        message="This will release the court hold and immediately make time slots bookable for members."
        confirmLabel="Release Court"
      />
    </div>
  );
}
