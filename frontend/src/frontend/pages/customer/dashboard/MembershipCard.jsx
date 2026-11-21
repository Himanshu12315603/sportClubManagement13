import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, KeyValue, ProgressBar } from '../../../components/ui/primitives';
import { useApp } from '../../../context/AppContext';
import { planById } from '../../../data/membershipPlans';
import { formatDate, formatCurrency } from '../../../utils/format';

/** Membership status card: plan, validity, benefits and renewal entry point. */
export default function MembershipCard() {
  const { membership, gardenState, membershipStatus } = useApp();
  const plan = planById(membership?.type);
  const dead = !gardenState.alive;

  return (
    <Card glass neon={dead}>
      <CardTitle
        icon="Crown"
        title="My membership"
        hint={plan ? `${plan.name} plan` : 'Trial membership'}
        right={<Badge tone={gardenState.tone.replace('badge-', '')}>{gardenState.statusLabel}</Badge>}
      />

      <KeyValue label="Plan" value={plan?.name || 'Trial'} />
      <KeyValue label="Started" value={formatDate(membership?.startDate)} />
      <KeyValue label="Expires" value={formatDate(membership?.expiryDate)} />
      <KeyValue label="Days remaining" value={dead ? 'Expired' : `${gardenState.remainingDays} days`} mono />
      <KeyValue label="Plan value" value={formatCurrency(membership?.pricePaid || 0)} mono />

      <div style={{ marginTop: 16 }}>
        <ProgressBar value={gardenState.lifespanPct} label="Validity used" showLabel tone={dead ? 'neon' : 'green'} />
      </div>

      <div className="cb-grid cols-3" style={{ marginTop: 18, gap: 10 }}>
        {[
          { label: 'Courts', value: `${plan?.courtDiscountPct ?? 0}%` },
          { label: 'Shop', value: `${plan?.shopDiscountPct ?? 0}%` },
          { label: 'Cafe', value: `${plan?.cafeDiscountPct ?? 0}%` },
        ].map((d) => (
          <div key={d.label} className="cb-card" style={{ padding: '10px 12px', textAlign: 'center' }}>
            <div className="semibold">{d.value}</div>
            <div className="tiny dim">{d.label} off</div>
          </div>
        ))}
      </div>

      <div className="cb-row" style={{ gap: 10, marginTop: 18 }}>
        <Button block icon={dead ? 'RefreshCw' : 'Repeat'} as={Link} to="/app/membership">
          {dead ? 'Renew membership' : 'Renew / upgrade'}
        </Button>
      </div>

      {membershipStatus === 'EXPIRING' ? (
        <p className="tiny" style={{ marginTop: 12, color: '#fbbf24' }}>
          <Icon name="AlertTriangle" size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Renew within {gardenState.remainingDays} days to keep your priority booking window and garden health.
        </p>
      ) : null}
    </Card>
  );
}
