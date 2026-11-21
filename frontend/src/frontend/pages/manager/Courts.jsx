import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard,
} from '../../components/ui/primitives';
import { Field, FormRow, Input, Select } from '../../components/ui/form';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { bookableSports, BOOKING_RULES } from '../../data/courts';
import { courtUtilization } from '../../data/analytics';
import { bookingHeatmap, heatmapHours } from '../../data/seed';
import { formatCurrency, formatDate, toISODate } from '../../utils/format';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };

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

export default function ManagerCourts() {
  const { maintenance, blockCourt, unblockCourt } = useApp();
  const [blockOpen, setBlockOpen] = useState(false);
  const [form, setForm] = useState({ courtId: COURT_OPTIONS[0]?.value || '', date: toISODate(new Date()), start: '12:00', end: '14:00', reason: '' });
  const [removeIndex, setRemoveIndex] = useState(null);

  const utilById = useMemo(() => Object.fromEntries(courtUtilization.map((c) => [c.court, c])), []);
  const totalCourts = bookableSports.reduce((n, s) => n + s.courts.length, 0);
  const avgUtil = Math.round(courtUtilization.reduce((n, c) => n + c.utilization, 0) / courtUtilization.length);
  const heatMax = Math.max(...bookingHeatmap.flatMap((r) => r.slots));

  const maintenanceRows = maintenance.map((m, i) => ({ ...m, id: `${m.courtId}-${m.date}-${m.start}-${i}`, index: i }));

  const openBlock = (courtId) => {
    setForm((f) => ({ ...f, courtId: courtId || f.courtId }));
    setBlockOpen(true);
  };

  const submitBlock = () => {
    blockCourt({ courtId: form.courtId, date: form.date, start: form.start, end: form.end, reason: form.reason || 'Maintenance' });
    setBlockOpen(false);
    setForm((f) => ({ ...f, reason: '' }));
  };

  const maintColumns = [
    { key: 'court', label: 'Court', render: (r) => <span className="small semibold mono">{r.courtId}</span> },
    { key: 'date', label: 'Date', render: (r) => <span className="small dim">{formatDate(r.date)}</span> },
    { key: 'window', label: 'Window', render: (r) => <span className="small mono">{r.start}–{r.end}</span> },
    { key: 'reason', label: 'Reason', render: (r) => <span className="small muted">{r.reason}</span> },
    { key: 'actions', label: '', align: 'right', render: (r) => <Button size="sm" variant="danger" icon="Trash2" onClick={() => setRemoveIndex(r.index)}>Remove</Button> },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Tennis"
        title="Court operations"
        subtitle="Monitor utilisation, block courts for maintenance and read weekly demand."
        badge={<Badge tone="info">{totalCourts} courts</Badge>}
        actions={<Button icon="Ban" variant="outline" onClick={() => openBlock()}>Block a court</Button>}
      />

      <div className="cb-grid cols-3">
        <StatCard icon="Building2" label="Total courts" value={totalCourts} detail={`${bookableSports.length} sports`} />
        <StatCard icon="Wrench" tone="neon" label="Maintenance blocks" value={maintenance.length} detail="Active reservations" delay={0.05} />
        <StatCard icon="BarChart3" tone="green" label="Avg utilisation" value={`${avgUtil}%`} detail="Across all courts" delay={0.1} />
      </div>

      <Card glass>
        <CardTitle icon="BarChart3" title="Utilisation by court" hint="Percent of bookable hours used" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={courtUtilization} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="court" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} width={44} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
            <Bar dataKey="utilization" name="Utilisation" radius={[6, 6, 0, 0]}>
              {courtUtilization.map((c) => <Cell key={c.court} fill={c.utilization >= 85 ? '#22c55e' : c.utilization >= 60 ? '#00a3ff' : '#f59e0b'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {bookableSports.map((sport) => (
        <Card glass key={sport.id}>
          <CardTitle
            icon={sport.icon}
            title={`${sport.name} courts`}
            hint={`${sport.courts.length} courts · ${sport.hours}`}
            right={<Badge tone="neutral">{formatCurrency(sport.peakPrice)} peak</Badge>}
          />
          <div className="cb-grid cb-auto" style={{ gap: 14 }}>
            {sport.courts.map((court) => {
              const util = utilById[court.id];
              return (
                <div key={court.id} className="cb-card glass" style={{ padding: 14, borderColor: `${sport.accent}33` }}>
                  <div className="cb-row between" style={{ marginBottom: 8 }}>
                    <span className="small semibold mono">{court.id}</span>
                    <Badge tone={util ? (util.utilization >= 85 ? 'active' : util.utilization >= 60 ? 'info' : 'warning') : 'neutral'}>{util ? `${util.utilization}%` : 'n/a'}</Badge>
                  </div>
                  <div className="small semibold">{court.name}</div>
                  <div className="tiny dim" style={{ marginBottom: 8 }}>{court.surface}</div>
                  <div className="cb-row wrap" style={{ gap: 6 }}>
                    {court.indoor ? <Badge tone="neutral" icon="Building2">Indoor</Badge> : <Badge tone="neutral" icon="Sun">Outdoor</Badge>}
                    {court.shared ? <Badge tone="info" icon="Shuffle">Shared</Badge> : null}
                    {court.lights ? <Badge tone="warning" icon="Zap">Lights</Badge> : null}
                  </div>
                  <Button size="sm" variant="ghost" icon="Ban" block style={{ marginTop: 12 }} onClick={() => openBlock(court.id)}>Block</Button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Card glass>
        <CardTitle icon="Wrench" title="Maintenance blocks" hint={`${maintenanceRows.length} scheduled`} right={<Button size="sm" variant="outline" icon="Plus" onClick={() => openBlock()}>Block a court</Button>} />
        <DataTable
          columns={maintColumns}
          rows={maintenanceRows}
          empty={<EmptyState icon="Wrench" title="No maintenance blocks" message="Courts are fully bookable." action={<Button icon="Plus" onClick={() => openBlock()}>Block a court</Button>} />}
        />
      </Card>

      <Card glass>
        <CardTitle icon="CalendarDays" title="Weekday demand heatmap" hint="Bookings per start-hour — darker means busier" />
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${heatmapHours.length}, minmax(0,1fr))`, gap: 4, minWidth: 480 }}>
            <div />
            {heatmapHours.map((h) => <div key={h} className="tiny dim center-text">{h}</div>)}
            {bookingHeatmap.map((row) => (
              <div key={row.day} style={{ display: 'contents' }}>
                <div className="tiny semibold" style={{ alignSelf: 'center' }}>{row.day}</div>
                {row.slots.map((v, i) => {
                  const intensity = v / heatMax;
                  return (
                    <div
                      key={`${row.day}-${i}`}
                      title={`${row.day} ${heatmapHours[i]} · ${v} bookings`}
                      className="mono tiny"
                      style={{
                        padding: '10px 0', textAlign: 'center', borderRadius: 8,
                        background: `rgba(0,163,255,${(0.08 + 0.7 * intensity).toFixed(2)})`,
                        border: '1px solid rgba(38,50,71,0.6)', color: intensity > 0.5 ? '#F8FAFC' : '#94A3B8',
                      }}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Block a court"
        subtitle="Reserve a court window for maintenance or private use"
        icon="Ban"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlockOpen(false)}>Cancel</Button>
            <Button variant="danger" icon="Ban" onClick={submitBlock}>Block court</Button>
          </>
        }
      >
        <Field label="Court" required>
          <Select value={form.courtId} onChange={(e) => setForm((f) => ({ ...f, courtId: e.target.value }))} options={COURT_OPTIONS} />
        </Field>
        <FormRow>
          <Field label="Date" required><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Field>
          <Field label="Reason"><Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Net replacement" /></Field>
        </FormRow>
        <FormRow>
          <Field label="Start" required><Select value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} options={SLOT_OPTIONS} /></Field>
          <Field label="End" required><Select value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} options={SLOT_OPTIONS} /></Field>
        </FormRow>
      </Modal>

      <ConfirmDialog
        open={removeIndex !== null}
        onClose={() => setRemoveIndex(null)}
        onConfirm={() => { unblockCourt(removeIndex); setRemoveIndex(null); }}
        title="Remove maintenance block?"
        message="The court will become bookable again for the affected window."
        confirmLabel="Remove block"
        tone="danger"
        icon="Trash2"
      />
    </div>
  );
}
