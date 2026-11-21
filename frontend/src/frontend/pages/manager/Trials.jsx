import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard, Tabs,
} from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useApp } from '../../context/AppContext';
import { trialStatuses, trialConversion, trialFunnel } from '../../data/trials';
import { formatDate, formatNumber, addDays, toISODate, titleCase } from '../../utils/format';

const tooltipStyle = { background: '#151C29', border: '1px solid #263247', borderRadius: 12, color: '#F8FAFC' };
const enquiryTone = { new: 'info', contacted: 'warning', converted: 'active' };
const stripBadge = (tone) => String(tone || 'neutral').replace('badge-', '');

export default function ManagerTrials() {
  const { trials, updateTrial, enquiries, updateEnquiry } = useApp();
  const [tab, setTab] = useState('trials');
  const [note, setNote] = useState(null);

  const createdDate = (offset) => toISODate(addDays(new Date(), offset));

  const trialColumns = [
    {
      key: 'name',
      label: 'Prospect',
      render: (t) => (
        <div>
          <div className="small semibold">{t.name}</div>
          <div className="tiny dim">{t.email}</div>
        </div>
      ),
    },
    { key: 'sport', label: 'Sport', render: (t) => <Badge tone="neutral">{titleCase(t.sport)}</Badge> },
    { key: 'date', label: 'Date', render: (t) => <span className="small dim">{formatDate(t.date)}</span> },
    { key: 'slot', label: 'Slot', render: (t) => <span className="small mono">{t.slot}</span> },
    { key: 'source', label: 'Source', render: (t) => <span className="tiny dim">{t.source}</span> },
    { key: 'status', label: 'Status', render: (t) => <Badge tone={stripBadge(trialStatuses[t.status]?.tone)}>{trialStatuses[t.status]?.label || t.status}</Badge> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (t) => (
        <div className="cb-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
          {t.status === 'requested' || t.status === 'expired' ? <Button size="sm" variant="ghost" onClick={() => updateTrial(t.id, 'scheduled')}>Approve</Button> : null}
          {t.status === 'scheduled' ? <Button size="sm" variant="ghost" icon="Check" onClick={() => updateTrial(t.id, 'completed')}>Complete</Button> : null}
          {t.status === 'requested' || t.status === 'scheduled' ? <Button size="sm" variant="danger" onClick={() => updateTrial(t.id, 'declined')}>Decline</Button> : null}
        </div>
      ),
    },
  ];

  const enquiryColumns = [
    { key: 'name', label: 'Name', render: (e) => <span className="small semibold">{e.name}</span> },
    { key: 'interest', label: 'Interest', render: (e) => <Badge tone="neutral">{e.interest}</Badge> },
    { key: 'source', label: 'Source', render: (e) => <span className="tiny dim">{e.source}</span> },
    { key: 'created', label: 'Received', render: (e) => <span className="small dim">{formatDate(createdDate(e.createdOffset))}</span> },
    { key: 'status', label: 'Status', render: (e) => <Badge tone={enquiryTone[e.status] || 'neutral'}>{titleCase(e.status)}</Badge> },
    { key: 'note', label: 'Note', render: (e) => <Button size="sm" variant="ghost" icon="Eye" onClick={() => setNote(e)}>View</Button> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (e) => (
        <div className="cb-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
          {e.status === 'new' ? <Button size="sm" variant="ghost" onClick={() => updateEnquiry(e.id, 'contacted')}>Contacted</Button> : null}
          {e.status !== 'converted' ? <Button size="sm" variant="outline" onClick={() => updateEnquiry(e.id, 'converted')}>Converted</Button> : <span className="tiny dim">Done</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Ticket"
        title="Trials & enquiries"
        subtitle="Convert visitor trials and inbound enquiries into paying members."
        badge={<Badge tone="info">{trials.length} trials · {enquiries.length} enquiries</Badge>}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'trials', label: 'Trial registrations', icon: 'Ticket', count: trials.length },
          { id: 'enquiries', label: 'Enquiries', icon: 'MessageSquare', count: enquiries.length },
        ]}
      />

      {tab === 'trials' ? (
        <div className="cb-stack" style={{ gap: 20 }}>
          <div className="cb-grid cols-4">
            <StatCard icon="Ticket" label="Total trials" value={formatNumber(trialConversion.total)} detail="Last 90 days" />
            <StatCard icon="CalendarCheck" tone="gold" label="Scheduled" value={formatNumber(trialConversion.scheduled)} detail={`${trialConversion.completed} completed`} delay={0.05} />
            <StatCard icon="BadgeCheck" tone="green" label="Converted" value={formatNumber(trialConversion.converted)} detail={`${trialConversion.conversionRate}% conversion`} delay={0.1} />
            <StatCard icon="Clock" label="Avg days to convert" value={trialConversion.avgDaysToConvert} detail="Request → membership" delay={0.15} />
          </div>

          <Card glass>
            <CardTitle icon="BarChart3" title="Trial funnel" hint="Requests → scheduled → completed → converted" />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trialFunnel} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} width={44} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Trials" radius={[6, 6, 0, 0]}>
                  {trialFunnel.map((d) => <Cell key={d.stage} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card glass>
            <CardTitle icon="Ticket" title="Trial registrations" hint={`${trials.length} requests`} />
            <DataTable
              columns={trialColumns}
              rows={trials}
              empty={<EmptyState icon="Ticket" title="No trial requests" message="New trial registrations will appear here." />}
            />
          </Card>
        </div>
      ) : (
        <Card glass>
          <CardTitle icon="MessageSquare" title="Website & walk-in enquiries" hint={`${enquiries.length} enquiries`} />
          <DataTable
            columns={enquiryColumns}
            rows={enquiries}
            empty={<EmptyState icon="MessageSquare" title="No enquiries" message="New enquiries will appear here." />}
          />
        </Card>
      )}

      <Modal
        open={Boolean(note)}
        onClose={() => setNote(null)}
        title={note?.name}
        subtitle={note ? `${note.interest} interest · ${note.source}` : ''}
        icon="MessageSquare"
        footer={<Button variant="ghost" onClick={() => setNote(null)}>Close</Button>}
      >
        {note ? (
          <div className="cb-stack" style={{ gap: 12 }}>
            <div><div className="tiny dim">Contact</div><div className="small">{note.email} · {note.phone}</div></div>
            <div><div className="tiny dim">Status</div><Badge tone={enquiryTone[note.status] || 'neutral'}>{titleCase(note.status)}</Badge></div>
            <div><div className="tiny dim">Note</div><p className="small">{note.note}</p></div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
