import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { notificationFilterTabs, notificationKinds } from '../../data/notifications';
import { formatDateTime, toISODate } from '../../utils/format';
import { Badge, Button, Card, CardTitle, ChipGroup, EmptyState, PageHeader, Tabs } from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';
import { Checkbox, Field, Select, Textarea } from '../../components/ui/form';

const TONE_ICON_CLASS = { success: 'green', warning: 'gold', danger: 'neon', info: '' };

const AUDIENCE_OPTIONS = [
  { id: 'customer', label: 'All members' },
  { id: 'manager', label: 'Managers' },
  { id: 'staff', label: 'Staff' },
  { id: 'all', label: 'Everyone' },
];

const AUDIENCE_LABEL = { customer: 'Members', manager: 'Managers', staff: 'Staff', all: 'Everyone' };

const ROLE_FILTER_OPTIONS = [
  { id: 'all', label: 'All audiences' },
  { id: 'customer', label: 'Members' },
  { id: 'manager', label: 'Managers' },
  { id: 'staff', label: 'Staff' },
];

const CATEGORY_OPTIONS = Object.keys(notificationKinds).map((k) => ({ value: k, label: notificationKinds[k].title }));

const PREFERENCE_ROWS = [
  { id: 'expiry', label: 'Membership expiry alerts' },
  { id: 'booking', label: 'Booking confirmations' },
  { id: 'receipts', label: 'Payment receipts' },
  { id: 'stock', label: 'Low-stock alerts' },
  { id: 'leave', label: 'Staff leave requests' },
  { id: 'digest', label: 'Weekly digest' },
];

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, pushNotification, toast } = useApp();

  const [tab, setTab] = useState('inbox');
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [broadcast, setBroadcast] = useState({ audience: 'customer', kind: CATEGORY_OPTIONS[0].value, message: '', schedule: '' });
  const [sent, setSent] = useState([]);

  const [prefs, setPrefs] = useState(() => Object.fromEntries(PREFERENCE_ROWS.map((p) => [p.id, true])));

  const list = useMemo(() => {
    let out = notifications;
    if (filter === 'unread') out = out.filter((n) => !n.read);
    else if (filter === 'customer' || filter === 'manager') out = out.filter((n) => n.audience === filter);
    if (roleFilter !== 'all') out = out.filter((n) => n.audience === roleFilter);
    return out;
  }, [notifications, filter, roleFilter]);

  const unread = notifications.filter((n) => !n.read).length;
  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: 'Bell', count: unread },
    { id: 'broadcast', label: 'Broadcast', icon: 'Send' },
    { id: 'prefs', label: 'Preferences', icon: 'Settings' },
  ];

  const sendBroadcast = () => {
    if (!broadcast.message.trim()) {
      toast('Message required', 'Write a message before queueing the broadcast.', 'error');
      return;
    }
    pushNotification(broadcast.kind, broadcast.message.trim(), broadcast.audience);
    setSent((prev) => [
      { id: `BC-${Date.now()}`, audience: broadcast.audience, kind: broadcast.kind, message: broadcast.message.trim(), schedule: broadcast.schedule, at: new Date().toISOString() },
      ...prev,
    ]);
    toast('Broadcast queued', `Message queued for ${AUDIENCE_LABEL[broadcast.audience]}.`, 'success');
    setBroadcast({ audience: broadcast.audience, kind: broadcast.kind, message: '', schedule: '' });
  };

  const togglePref = (row) => {
    const next = !prefs[row.id];
    setPrefs((prev) => ({ ...prev, [row.id]: next }));
    toast('Preferences updated', `${row.label} turned ${next ? 'on' : 'off'}.`, 'info');
  };

  return (
    <>
      <PageHeader
        icon="Bell"
        title="Notification Centre"
        subtitle="Monitor platform notifications and broadcast messages to club audiences."
        badge={unread ? <Badge tone="danger">{unread} unread</Badge> : <Badge tone="active">All read</Badge>}
        actions={
          <Button variant="outline" icon="Check" disabled={!unread} onClick={markAllNotificationsRead}>
            Mark all as read
          </Button>
        }
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      <div style={{ marginTop: 18 }}>
        {tab === 'inbox' ? (
          <Card glass>
            <CardTitle icon="Bell" title="Platform inbox" hint="Every notification delivered across roles" />
            <div className="cb-row between wrap" style={{ gap: 12, marginBottom: 14 }}>
              <ChipGroup options={notificationFilterTabs} value={filter} onChange={(o) => setFilter(o.id)} />
              <ChipGroup options={ROLE_FILTER_OPTIONS} value={roleFilter} onChange={(o) => setRoleFilter(o.id)} />
            </div>

            {list.length ? (
              <div>
                {list.map((n) => {
                  const meta = notificationKinds[n.kind] || { icon: 'Bell', tone: 'info', title: 'Notification' };
                  return (
                    <div
                      key={n.id}
                      className="cb-row"
                      style={{
                        gap: 14,
                        padding: '14px 4px',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid rgba(38,50,71,0.5)',
                        background: n.read ? 'transparent' : 'rgba(0,163,255,0.05)',
                        cursor: n.read ? 'default' : 'pointer',
                      }}
                      onClick={() => !n.read && markNotificationRead(n.id)}
                    >
                      <span className={`stat-icon ${TONE_ICON_CLASS[meta.tone] || ''}`} style={{ width: 38, height: 38, borderRadius: 12, flex: 'none' }}>
                        <Icon name={meta.icon} size={16} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="cb-row" style={{ gap: 8 }}>
                          <span className="small semibold">{n.title || meta.title}</span>
                          {!n.read ? <span className="notif-dot" /> : null}
                          <Badge tone="neutral">{AUDIENCE_LABEL[n.audience] || n.audience}</Badge>
                        </div>
                        <div className="small" style={{ marginTop: 2 }}>{n.message}</div>
                        <div className="tiny dim" style={{ marginTop: 4 }}>{formatDateTime(n.at)}</div>
                      </div>
                      {!n.read ? (
                        <Button variant="ghost" size="sm" icon="Check" onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}>Read</Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="Bell" title="No notifications match" message="Try a different filter or audience." />
            )}
          </Card>
        ) : null}

        {tab === 'broadcast' ? (
          <div className="cb-grid cols-2">
            <Card glass>
              <CardTitle icon="Send" title="Compose broadcast" hint="Send a message to a club audience" />
              <Field label="Audience">
                <ChipGroup options={AUDIENCE_OPTIONS} value={broadcast.audience} onChange={(o) => setBroadcast({ ...broadcast, audience: o.id })} />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Category">
                <Select value={broadcast.kind} onChange={(e) => setBroadcast({ ...broadcast, kind: e.target.value })} options={CATEGORY_OPTIONS} />
              </Field>
              <Field label="Message" hint="Shown as the notification body">
                <Textarea rows={4} value={broadcast.message} onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} placeholder="e.g. New padel courts open from Monday — book your slot!" />
              </Field>
              <Field label="Schedule (optional)" hint="Leave blank to send now">
                <input className="input" type="date" value={broadcast.schedule} min={toISODate(new Date())} onChange={(e) => setBroadcast({ ...broadcast, schedule: e.target.value })} />
              </Field>
              <div className="cb-row" style={{ marginTop: 6 }}>
                <Button icon="Send" onClick={sendBroadcast}>Queue broadcast</Button>
              </div>
            </Card>

            <Card glass>
              <CardTitle icon="Clock" title="Sent broadcasts" hint="Demo session queue" />
              {sent.length ? (
                <div className="cb-stack" style={{ gap: 10 }}>
                  {sent.map((b) => (
                    <div key={b.id} className="cb-card glass" style={{ padding: 12 }}>
                      <div className="cb-row between wrap" style={{ gap: 8 }}>
                        <Badge tone="info">{AUDIENCE_LABEL[b.audience]}</Badge>
                        <span className="tiny dim">{b.schedule ? `Scheduled ${b.schedule}` : 'Sent now'}</span>
                      </div>
                      <div className="small" style={{ marginTop: 6 }}>{b.message}</div>
                      <div className="tiny dim" style={{ marginTop: 4 }}>{notificationKinds[b.kind]?.title || b.kind} · {formatDateTime(b.at)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="Send" title="No broadcasts yet" message="Messages you queue will appear here." />
              )}
            </Card>
          </div>
        ) : null}

        {tab === 'prefs' ? (
          <Card glass>
            <CardTitle icon="Settings" title="Notification preferences" hint="Choose which platform alerts are delivered" />
            <div className="cb-grid cols-2" style={{ gap: 4 }}>
              {PREFERENCE_ROWS.map((row) => (
                <Checkbox key={row.id} label={row.label} checked={prefs[row.id]} onChange={() => togglePref(row)} />
              ))}
            </div>
            <p className="tiny dim" style={{ marginTop: 8 }}>Preferences are stored locally for the demo and will sync to your profile once the backend is connected.</p>
          </Card>
        ) : null}
      </div>
    </>
  );
}
