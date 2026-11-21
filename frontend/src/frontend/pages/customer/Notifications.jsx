import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { notificationFilterTabs, notificationKinds } from '../../data/notifications';
import { formatDateTime } from '../../utils/format';
import { Badge, Button, Card, CardTitle, EmptyState, PageHeader, Tabs } from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';

const TONE_ICON_CLASS = {
  success: 'green',
  warning: 'gold',
  danger: 'neon',
  info: '',
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [tab, setTab] = useState('all');

  const list = useMemo(() => {
    if (tab === 'unread') return notifications.filter((n) => !n.read);
    if (tab === 'customer' || tab === 'manager') return notifications.filter((n) => n.audience === tab);
    return notifications;
  }, [notifications, tab]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        icon="Bell"
        title="Notifications"
        subtitle="Booking updates, payment receipts, garden milestones and club announcements."
        badge={unread ? <Badge tone="danger">{unread} unread</Badge> : <Badge tone="active">All read</Badge>}
        actions={
          <Button variant="outline" icon="Check" onClick={markAllNotificationsRead} disabled={!unread}>
            Mark all as read
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={notificationFilterTabs.map((t) => ({
          ...t,
          count: t.id === 'unread' ? unread : undefined,
        }))}
      />

      <div style={{ marginTop: 18 }}>
        {list.length ? (
          <Card glass style={{ padding: 0 }}>
            {list.map((n) => {
              const meta = notificationKinds[n.kind] || { icon: 'Bell', tone: 'info', title: 'Notification' };
              return (
                <div
                  key={n.id}
                  className="cb-row"
                  style={{
                    gap: 14,
                    padding: '16px 18px',
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
                      {n.audience === 'manager' ? <Badge tone="neutral">Club</Badge> : null}
                    </div>
                    <div className="small" style={{ marginTop: 2 }}>{n.message}</div>
                    <div className="tiny dim" style={{ marginTop: 4 }}>{formatDateTime(n.at)}</div>
                  </div>
                  {!n.read ? (
                    <Button variant="ghost" size="sm" icon="Check" onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}>
                      Read
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </Card>
        ) : (
          <Card glass>
            <EmptyState icon="Bell" title="You're all caught up" message="New notifications will appear here." />
          </Card>
        )}
      </div>
    </>
  );
}
