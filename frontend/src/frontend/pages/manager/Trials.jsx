import { useMemo, useState } from 'react';
import {
  Badge, Button, Card, CardTitle, EmptyState, PageHeader, StatCard, Tabs, ChipGroup,
} from '../../components/ui/primitives';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Icon from '../../components/ui/Icon';
import { useApp } from '../../context/AppContext';
import { trialStatuses, trialConversion } from '../../data/trials';
import { formatDate, formatNumber, addDays, toISODate, titleCase } from '../../utils/format';

const enquiryTone = { new: 'info', contacted: 'warning', converted: 'active' };
const stripBadge = (tone) => String(tone || 'neutral').replace('badge-', '');

const dateFilters = [
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: '1y', label: 'This Year' },
];

export default function ManagerTrials() {
  const { trials, updateTrial, enquiries, updateEnquiry } = useApp();
  const [tab, setTab] = useState('trials');
  const [note, setNote] = useState(null);
  const [timeRange, setTimeRange] = useState('90d');

  const createdDate = (offset) => toISODate(addDays(new Date(), offset));

  // 5-Stage Conversion Funnel Data
  const funnelStages = useMemo(() => {
    const visitors = 1480;
    const enquiriesCount = 380 + enquiries.length;
    const bookingsCount = trialConversion.total; // 148
    const attendedCount = trialConversion.completed; // 71
    const convertedCount = trialConversion.converted; // 34

    return [
      {
        id: 'visitors',
        stage: '1. Website Visitors',
        count: visitors,
        subtext: 'Unique landing page visitors',
        icon: 'Eye',
        color: '#16a085',
        bgColor: '#ddf5ec',
        convPct: 100,
        dropPct: 0,
      },
      {
        id: 'enquiries',
        stage: '2. Trial Enquiries',
        count: enquiriesCount,
        subtext: 'Inbound chat & contact inquiries',
        icon: 'MessageSquare',
        color: '#0d9488',
        bgColor: '#ccfbf1',
        convPct: Math.round((enquiriesCount / visitors) * 100),
        dropPct: Math.round(((visitors - enquiriesCount) / visitors) * 100),
      },
      {
        id: 'bookings',
        stage: '3. Trial Bookings',
        count: bookingsCount,
        subtext: 'Confirmed trial court sessions',
        icon: 'Ticket',
        color: '#2563eb',
        bgColor: '#dbeafe',
        convPct: Math.round((bookingsCount / enquiriesCount) * 100),
        dropPct: Math.round(((enquiriesCount - bookingsCount) / enquiriesCount) * 100),
      },
      {
        id: 'attended',
        stage: '4. Trial Attended',
        count: attendedCount,
        subtext: 'Completed session at the club',
        icon: 'UserCheck',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        convPct: Math.round((attendedCount / bookingsCount) * 100),
        dropPct: Math.round(((bookingsCount - attendedCount) / bookingsCount) * 100),
      },
      {
        id: 'converted',
        stage: '5. Converted Members',
        count: convertedCount,
        subtext: 'Purchased paid membership plan',
        icon: 'Crown',
        color: '#22c55e',
        bgColor: '#dcfce7',
        convPct: Math.round((convertedCount / attendedCount) * 100),
        dropPct: Math.round(((attendedCount - convertedCount) / attendedCount) * 100),
      },
    ];
  }, [enquiries.length]);

  const trialColumns = [
    {
      key: 'name',
      label: 'Prospect Member',
      render: (t) => (
        <div>
          <div className="small semibold" style={{ color: '#172b4d' }}>{t.name}</div>
          <div className="tiny dim">{t.email} · {t.phone}</div>
        </div>
      ),
    },
    { key: 'sport', label: 'Sport', render: (t) => <Badge tone="neutral">{titleCase(t.sport)}</Badge> },
    { key: 'date', label: 'Date', render: (t) => <span className="small dim">{formatDate(t.date)}</span> },
    { key: 'slot', label: 'Slot', render: (t) => <span className="small mono bold">{t.slot}</span> },
    { key: 'source', label: 'Source', render: (t) => <span className="tiny dim">{t.source}</span> },
    { key: 'status', label: 'Status', render: (t) => <Badge tone={stripBadge(trialStatuses[t.status]?.tone)}>{trialStatuses[t.status]?.label || t.status}</Badge> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (t) => (
        <div className="cb-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
          {t.status === 'requested' || t.status === 'expired' ? <Button size="sm" variant="primary" onClick={() => updateTrial(t.id, 'scheduled')}>Approve Slot</Button> : null}
          {t.status === 'scheduled' ? <Button size="sm" variant="outline" icon="Check" onClick={() => updateTrial(t.id, 'completed')}>Check-in</Button> : null}
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
    { key: 'note', label: 'Note', render: (e) => <Button size="sm" variant="ghost" icon="Eye" onClick={() => setNote(e)}>View Note</Button> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (e) => (
        <div className="cb-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
          {e.status === 'new' ? <Button size="sm" variant="ghost" onClick={() => updateEnquiry(e.id, 'contacted')}>Mark Contacted</Button> : null}
          {e.status !== 'converted' ? <Button size="sm" variant="primary" onClick={() => updateEnquiry(e.id, 'converted')}>Convert Member</Button> : <span className="tiny dim">Converted</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Ticket"
        title="Visitor Trials & Enquiries"
        subtitle="Manage visitor intake, track conversion funnel metrics and convert guests into club members."
        badge={<Badge tone="active">{trials.length} trials · {enquiries.length} enquiries</Badge>}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'trials', label: 'Trial Registrations', icon: 'Ticket', count: trials.length },
          { id: 'enquiries', label: 'Inbound Enquiries', icon: 'MessageSquare', count: enquiries.length },
        ]}
      />

      {tab === 'trials' ? (
        <div className="cb-stack" style={{ gap: 20 }}>
          <div className="cb-grid cols-4">
            <StatCard icon="Ticket" label="Total Trial Requests" value={formatNumber(trialConversion.total)} detail="Last 90 days" />
            <StatCard icon="CalendarCheck" tone="gold" label="Scheduled Sessions" value={formatNumber(trialConversion.scheduled)} detail={`${trialConversion.completed} completed visits`} delay={0.05} />
            <StatCard icon="BadgeCheck" tone="green" label="Converted to Plans" value={formatNumber(trialConversion.converted)} detail={`${trialConversion.conversionRate}% visit-to-member`} delay={0.1} />
            <StatCard icon="Clock" label="Avg Conversion Speed" value={`${trialConversion.avgDaysToConvert} days`} detail="From request to membership" delay={0.15} />
          </div>

          {/* 5-Stage Modern Conversion Funnel */}
          <Card glass>
            <div className="cb-row between wrap" style={{ marginBottom: 18, gap: 12 }}>
              <CardTitle
                icon="Filter"
                title="Trial Visitor Conversion Funnel"
                hint="5-stage conversion progression from initial website landing to paying member"
              />
              <ChipGroup options={dateFilters} value={timeRange} onChange={(o) => setTimeRange(o.id)} />
            </div>

            <div className="cb-stack" style={{ gap: 12 }}>
              {funnelStages.map((stage, idx) => {
                const isFinal = idx === funnelStages.length - 1;
                return (
                  <div
                    key={stage.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: '16px 20px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="cb-row between wrap" style={{ gap: 10, marginBottom: 8 }}>
                      <div className="cb-row" style={{ gap: 12 }}>
                        <span
                          className="stat-icon"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: stage.bgColor,
                            color: stage.color,
                            border: `1px solid ${stage.color}33`,
                          }}
                        >
                          <Icon name={stage.icon} size={16} />
                        </span>
                        <div>
                          <div className="semibold small" style={{ color: '#172b4d' }}>{stage.stage}</div>
                          <div className="tiny dim">{stage.subtext}</div>
                        </div>
                      </div>

                      <div className="cb-row" style={{ gap: 20 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="bold" style={{ fontSize: '1.25rem', color: stage.color }}>
                            {formatNumber(stage.count)}
                          </div>
                          <div className="tiny dim">prospects</div>
                        </div>

                        {idx > 0 && (
                          <div
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              textAlign: 'center',
                            }}
                          >
                            <div className="semibold tiny" style={{ color: '#16a085' }}>
                              {stage.convPct}%
                            </div>
                            <div className="tiny dim" style={{ fontSize: '0.65rem' }}>stage rate</div>
                          </div>
                        )}

                        {idx > 0 && (
                          <div
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              textAlign: 'center',
                            }}
                          >
                            <div className="semibold tiny" style={{ color: '#991b1b' }}>
                              -{stage.dropPct}%
                            </div>
                            <div className="tiny dim" style={{ fontSize: '0.65rem', color: '#991b1b' }}>drop-off</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Funnel Progress Bar */}
                    <div className="progress" style={{ height: 9, background: '#f1f5f9' }}>
                      <span
                        style={{
                          width: `${Math.max(8, Math.round((stage.count / funnelStages[0].count) * 100))}%`,
                          background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Trial Requests Table */}
          <Card glass>
            <CardTitle icon="Ticket" title="Active Trial Registrations" hint={`${trials.length} total prospect requests`} />
            <DataTable
              columns={trialColumns}
              rows={trials}
              empty={<EmptyState icon="Ticket" title="No trial requests" message="New trial registrations will appear here." />}
            />
          </Card>
        </div>
      ) : (
        <Card glass>
          <CardTitle icon="MessageSquare" title="Inbound Enquiries" hint={`${enquiries.length} total received`} />
          <DataTable
            columns={enquiryColumns}
            rows={enquiries}
            empty={<EmptyState icon="MessageSquare" title="No enquiries" message="Inbound visitor queries will appear here." />}
          />
        </Card>
      )}

      {/* Note Inspection Modal */}
      <Modal
        open={Boolean(note)}
        onClose={() => setNote(null)}
        title={note ? `Enquiry from ${note.name}` : ''}
        subtitle="Prospect message details"
        icon="MessageSquare"
      >
        {note && (
          <div className="cb-stack" style={{ gap: 14 }}>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Contact Phone</span>
                <span className="semibold">{note.phone}</span>
              </div>
              <div className="cb-row between small" style={{ marginBottom: 6 }}>
                <span className="muted">Sport Interest</span>
                <Badge tone="neutral">{note.interest}</Badge>
              </div>
              <div className="cb-row between small">
                <span className="muted">Channel Source</span>
                <span>{note.source}</span>
              </div>
            </div>

            <div style={{ padding: 14, background: '#ffffff', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div className="tiny dim semibold" style={{ marginBottom: 6 }}>MESSAGE NOTE</div>
              <p className="small" style={{ lineHeight: 1.5 }}>
                {note.notes || 'Prospect is interested in weekend morning courts and requested details regarding Gold vs Silver membership fees.'}
              </p>
            </div>

            <div className="cb-row between" style={{ gap: 10, marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setNote(null)} style={{ flex: 1 }}>
                Close
              </Button>
              {note.status !== 'converted' && (
                <Button
                  variant="primary"
                  icon="Check"
                  onClick={() => {
                    updateEnquiry(note.id, 'converted');
                    setNote(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Mark as Converted
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
