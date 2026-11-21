import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { customerSuggestions } from '../../data/aiResponses';
import { formatCurrency, formatDate } from '../../utils/format';
import ChatPanel from '../../components/ai/ChatPanel';
import { Badge, Button, Card, CardTitle, KeyValue, PageHeader } from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';

const QUICK_ACTIONS = [
  { icon: 'CalendarPlus', label: 'Book a court', to: '/app/bookings' },
  { icon: 'Crown', label: 'Compare plans', to: '/app/membership' },
  { icon: 'Sprout', label: 'Check my garden', to: '/app/garden' },
  { icon: 'Coffee', label: 'Order at the cafe', to: '/app/cafe' },
];

export default function AiAssistant() {
  const { gardenState, membership, bookings, membershipStatus, stats } = useApp();
  const upcoming = bookings.filter((b) => b.status === 'confirmed' && b.date >= new Date().toISOString().slice(0, 10))[0];

  return (
    <>
      <PageHeader
        icon="Sparkles"
        title="ClubBloom AI"
        subtitle="Your in-app assistant for sports, bookings, memberships and your virtual garden."
        badge={<Badge tone="info">Beta</Badge>}
      />

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 22 }}>
        <ChatPanel mode="customer" suggestions={customerSuggestions} />

        <div className="cb-stack">
          <Card glass>
            <CardTitle icon="Activity" title="Your snapshot" hint="What the assistant can see" />
            <KeyValue label="Membership" value={membershipStatus} />
            <KeyValue label="Expires" value={formatDate(membership?.expiryDate)} />
            <KeyValue label="Garden stage" value={`${gardenState.stage.level}/5 · ${gardenState.stage.label}`} />
            <KeyValue label="Activity score" value={`${gardenState.score}/100`} mono />
            <KeyValue label="Sessions this month" value={stats.sessionsThisMonth} mono />
            <KeyValue label="Next booking" value={upcoming ? `${upcoming.sportName} · ${formatDate(upcoming.date)}` : 'None'} />
          </Card>

          <Card glass>
            <CardTitle icon="Zap" title="Quick actions" />
            <div className="cb-stack" style={{ gap: 10 }}>
              {QUICK_ACTIONS.map((a) => (
                <Button key={a.to} variant="outline" icon={a.icon} as={Link} to={a.to} block>
                  {a.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card glass>
            <CardTitle icon="Heart" title="Because your garden is blooming" />
            <p className="small">
              Members who keep an active garden renew earlier and unlock more guest passes. Keep booking — you are
              {' '}
              {Math.max(0, 100 - gardenState.score)} points from the next stage.
            </p>
            <div className="cb-row between small" style={{ marginTop: 12 }}>
              <span className="muted">Loyalty points</span>
              <span className="semibold">{formatCurrency(stats.loyaltyPoints).replace('₹', '')} pts</span>
            </div>
            <Button variant="ghost" icon="Trophy" as={Link} to="/app/membership" style={{ marginTop: 12 }} block>
              View my rewards
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
