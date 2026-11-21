import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, EmptyState, StatCard } from '../../components/ui/primitives';
import Garden from '../../components/clubbloom/Garden';
import WelcomeCard from './dashboard/WelcomeCard';
import MembershipCard from './dashboard/MembershipCard';
import BookingSummary from './dashboard/BookingSummary';
import { useApp } from '../../context/AppContext';
import { notificationKinds } from '../../data/notifications';
import { formatCurrency, formatDate } from '../../utils/format';

const orderTone = { packing: 'warning', ready: 'info', dispatched: 'info', delivered: 'active', served: 'active', received: 'warning' };

export default function CustomerDashboard() {
  const { stats, gardenState, shopOrders, cafeOrders, notifications, markNotificationRead } = useApp();

  const recentOrders = useMemo(
    () => [...shopOrders, ...cafeOrders].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 4),
    [shopOrders, cafeOrders]
  );

  const inbox = notifications.filter((n) => (n.audience || 'customer') === 'customer').slice(0, 4);

  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <WelcomeCard />

      <div className="cb-grid cols-4">
        <StatCard icon="CalendarDays" label="Sessions this month" value={stats.sessionsThisMonth} detail={`${stats.totalSessions} all time`} trend={12} />
        <StatCard icon="Clock" tone="" label="Hours played" value={stats.hoursPlayed} detail="Tracked from bookings" delay={0.05} />
        <StatCard icon="Trophy" tone="gold" label="Win rate" value={`${stats.winRate}%`} detail="Club social leagues" delay={0.1} />
        <StatCard icon="Award" tone="green" label="Loyalty points" value={stats.loyaltyPoints} detail={`${stats.guestPassesLeft} guest passes left`} trend={6} delay={0.15} />
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <div className="cb-stack" style={{ gap: 20 }}>
          <Card glass>
            <CardTitle
              icon="Sprout"
              title="My living tree"
              hint="Grows with your club activity"
              right={<Button size="sm" variant="outline" iconRight="ArrowRight" as={Link} to="/app/garden">Open tree</Button>}
            />
            <Garden state={gardenState} compact showRibbon />
          </Card>

          <BookingSummary />
        </div>

        <div className="cb-stack" style={{ gap: 20 }}>
          <MembershipCard />

          <Card glass>
            <CardTitle icon="Package" title="Recent orders" hint="Shop & cafeteria" right={<Button size="sm" variant="ghost" as={Link} to="/app/shop">Shop</Button>} />
            {recentOrders.length === 0 ? (
              <EmptyState icon="ShoppingBag" title="No orders yet" message="Your shop and cafe orders will appear here." />
            ) : (
              <div className="cb-stack" style={{ gap: 10 }}>
                {recentOrders.map((o) => (
                  <div key={o.id} className="cb-row between" style={{ gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(38,50,71,0.5)' }}>
                    <div className="cb-row" style={{ gap: 11 }}>
                      <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10 }}>
                        <Icon name={o.channel === 'cafe' ? 'Coffee' : 'ShoppingBag'} size={15} />
                      </span>
                      <div>
                        <div className="small semibold">{o.id}</div>
                        <div className="tiny dim">{o.items?.length || 0} item(s) · {formatDate(o.date)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="small mono semibold">{formatCurrency(o.total)}</div>
                      <Badge tone={orderTone[o.status] || 'neutral'}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card glass>
            <CardTitle
              icon="Bell"
              title="Notifications"
              right={<Button size="sm" variant="ghost" as={Link} to="/app/notifications">View all</Button>}
            />
            <div className="cb-stack" style={{ gap: 8 }}>
              {inbox.map((n) => {
                const meta = notificationKinds[n.kind] || {};
                return (
                  <div
                    key={n.id}
                    className="cb-row"
                    style={{ gap: 10, alignItems: 'flex-start', padding: 10, borderRadius: 12, background: n.read ? 'transparent' : 'rgba(0,163,255,0.07)', border: `1px solid ${n.read ? 'transparent' : 'rgba(0,163,255,0.22)'}`, cursor: 'pointer' }}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <span className={`stat-icon ${meta.tone === 'danger' ? 'neon' : meta.tone === 'warning' ? 'gold' : meta.tone === 'success' ? 'green' : ''}`} style={{ width: 30, height: 30, borderRadius: 9 }}>
                      <Icon name={meta.icon || 'Bell'} size={14} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="tiny semibold">{meta.title || 'Update'}</div>
                      <div className="tiny dim">{n.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card glass glow>
            <CardTitle icon="Bot" title="ClubBloom AI" hint="Ask anything about your club" />
            <p className="small">Need a sport recommendation, tonight&apos;s availability or renewal advice? Your assistant is ready.</p>
            <Button block icon="Sparkles" as={Link} to="/app/ai" style={{ marginTop: 14 }}>Open assistant</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
