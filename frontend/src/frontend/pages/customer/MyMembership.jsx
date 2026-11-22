import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { planById } from '../../data/membershipPlans';
import { formatCurrency, formatDate } from '../../utils/format';
import { planDurationDays } from '../../utils/membership';
import {
  Badge,
  Button,
  Card,
  CardTitle,
  KeyValue,
  PageHeader,
  ProgressBar,
  Tabs,
} from '../../components/ui/primitives';
import DataTable from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import RazorpayModal from '../../components/ui/RazorpayModal';

const DISCOUNT_TILES = [
  { key: 'courtDiscountPct', label: 'Court bookings', icon: 'CalendarDays' },
  { key: 'shopDiscountPct', label: 'Pro shop', icon: 'ShoppingBag' },
  { key: 'cafeDiscountPct', label: 'Cafeteria', icon: 'Coffee' },
];

export default function MyMembership() {
  const {
    membership, membershipStatus, gardenState, plans, payments,
    subscribeMembership, completeMembershipPayment, toast,
  } = useApp();
  const [tab, setTab] = useState('overview');
  const [renewFor, setRenewFor] = useState(null);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = (plans || []).find((p) => p.id === membership?.type) || planById(membership?.type);
  const livePlans = plans?.length ? plans : (current ? [current] : []);
  const tone = gardenState.tone.replace('badge-', '');
  const dead = !gardenState.alive;
  const active = Boolean(membership) && !dead;

  const openRenew = (plan) => {
    if (!plan) return;
    setRenewFor(plan);
  };

  const confirmRenew = async () => {
    if (!renewFor) return;
    if (renewFor.price > 0) {
      setPaymentPlan(renewFor);
      setRenewFor(null);
      return;
    }

    setSaving(true);
    try {
      const res = await subscribeMembership(renewFor.id, 'free_trial');
      if (res.ok) setRenewFor(null);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'invoice', label: 'Invoice', render: (r) => <span className="mono tiny">{r.invoice}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'description', label: 'Description' },
    { key: 'method', label: 'Method' },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (r) => <span className="semibold">{formatCurrency(r.amount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'right',
      render: (r) => <Badge tone={r.status === 'paid' ? 'active' : 'warning'}>{r.status}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        icon="Crown"
        title="My Membership"
        subtitle="Your plan, benefits, renewal options and complete payment history."
        badge={<Badge tone={tone}>{gardenState.statusLabel}</Badge>}
        actions={
          <Button icon={active ? 'RefreshCw' : 'Crown'} onClick={() => openRenew(current || livePlans[0])}>
            {active ? 'Renew your plan' : 'Choose a plan'}
          </Button>
        }
      />

      {!membership ? (
        <Card glass glow neon style={{ marginTop: 18 }}>
          <CardTitle icon="Crown" title="You don't have a membership yet" hint="Join a plan to unlock courts, the shop and the cafeteria" />
          <p className="small muted">
            Pick one of the plans below to activate your membership. You can only hold one plan at a time — your plan
            can be renewed, but you cannot switch to a different plan while it is active.
          </p>
        </Card>
      ) : null}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview', icon: 'BadgeCheck' },
          { id: 'payments', label: 'Payments', icon: 'Receipt', count: payments.length },
        ]}
      />

      {tab === 'overview' ? (
        <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 22, marginTop: 18 }}>
          <div className="cb-stack">
            <Card glass glow neon={dead}>
              <CardTitle
                icon="Crown"
                title={current ? `${current.name} Membership` : 'Membership'}
                hint={current?.tagline}
                iconTone="gold"
                right={<Badge tone={tone}>{gardenState.statusLabel}</Badge>}
              />
              <KeyValue label="Plan" value={current?.name || '—'} />
              <KeyValue label="Status" value={membership?.status || '—'} />
              <KeyValue label="Started" value={formatDate(membership?.startDate)} />
              <KeyValue label="Expires" value={formatDate(membership?.expiryDate)} />
              <KeyValue label="Days remaining" value={dead ? 'Expired' : `${gardenState.remainingDays} days`} mono />
              <KeyValue label="Price paid" value={formatCurrency(membership?.pricePaid)} mono />
              <div style={{ marginTop: 14 }}>
                <ProgressBar
                  value={gardenState.lifespanPct}
                  label="Membership validity"
                  showLabel
                  tone={dead ? 'neon' : 'green'}
                />
              </div>
              {membershipStatus === 'EXPIRING' ? (
                <p className="tiny" style={{ color: '#fbbf24', marginTop: 12 }}>
                  Your membership expires soon — renew to keep priority bookings and an alive garden.
                </p>
              ) : null}
            </Card>

            <Card glass>
              <CardTitle icon="Percent" title="Your discounts" hint="Applied automatically at checkout" />
              <div className="cb-grid cols-3" style={{ gap: 12 }}>
                {DISCOUNT_TILES.map((t) => (
                  <div key={t.key} className="cb-card glass" style={{ padding: 14 }}>
                        <span className="stat-icon" style={{ width: 32, height: 32, borderRadius: 10 }}>
                          <Icon name={t.icon} size={14} />
                        </span>
                    <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: 8 }}>
                      {current?.[t.key] ?? 0}%
                    </div>
                    <div className="tiny dim">{t.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card glass>
              <CardTitle icon="Target" title="Included benefits" />
              <div className="cb-stack" style={{ gap: 10 }}>
                {(current?.perks || []).map((p) => (
                  <div key={p} className="cb-row" style={{ gap: 10 }}>
                    <span className="badge badge-active" style={{ padding: '3px 6px' }}>
                      <Icon name="Check" size={12} />
                    </span>
                    <span className="small">{p}</span>
                  </div>
                ))}
                <div className="cb-row between" style={{ paddingTop: 8 }}>
                  <span className="small muted">Booking window</span>
                  <span className="small semibold">{current?.advanceBookingDays ?? '—'} days advance</span>
                </div>
                <div className="cb-row between">
                  <span className="small muted">Daily session limit</span>
                  <span className="small semibold">{current?.dailyBookingLimit ?? '—'} per day</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="cb-stack">
            <Card glass>
              <CardTitle
                icon="Shuffle"
                title={active ? 'Renew your plan' : 'Choose your plan'}
                hint={active ? 'You hold one plan at a time — switching is locked until it expires' : 'Pick a plan to activate your membership'}
              />
              <div className="cb-stack" style={{ gap: 14 }}>
                {livePlans.map((p) => {
                  const isCurrent = p.id === membership?.type;
                  const canSelect = isCurrent || !active;
                  return (
                    <div
                      key={p.id}
                      className="cb-card glass"
                      style={{ padding: 16, borderColor: isCurrent ? p.accent : undefined, opacity: canSelect ? 1 : 0.6 }}
                    >
                      <div className="cb-row between wrap" style={{ gap: 12 }}>
                        <div>
                          <div className="cb-row" style={{ gap: 8 }}>
                            <strong>{p.name}</strong>
                            {isCurrent ? <Badge tone="active">Current</Badge> : null}
                            {p.popular ? <Badge tone="gold">Popular</Badge> : null}
                          </div>
                          <div className="tiny dim">{p.tagline}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="semibold">{formatCurrency(p.price)}</div>
                          <div className="tiny dim">per {p.period}</div>
                        </div>
                      </div>
                      <div className="cb-row wrap tiny dim" style={{ gap: 14, marginTop: 12 }}>
                        <span>{p.courtDiscountPct}% off courts</span>
                        <span>{p.shopDiscountPct}% off shop</span>
                        <span>{p.dailyBookingLimit} session/day</span>
                      </div>
                      <Button
                        variant={isCurrent ? 'outline' : 'primary'}
                        size="sm"
                        icon={isCurrent ? 'RefreshCw' : canSelect ? 'Crown' : 'Lock'}
                        style={{ marginTop: 14 }}
                        disabled={!canSelect}
                        onClick={() => openRenew(p)}
                      >
                        {isCurrent ? 'Renew this plan' : canSelect ? `Join ${p.name}` : 'Locked while active'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card glass>
              <CardTitle icon="Bot" title="Need advice?" hint="ClubBloom AI can compare plans for you" />
              <Button variant="outline" icon="Sparkles" as={Link} to="/app/ai" block>
                Ask which plan suits me
              </Button>
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <Card glass>
            <CardTitle
              icon="Receipt"
              title="Payment history"
              hint="Membership, bookings, shop and cafeteria transactions"
            />
            <DataTable columns={columns} rows={payments} />
          </Card>
        </div>
      )}

      <Modal
        open={Boolean(renewFor)}
        onClose={() => setRenewFor(null)}
        title={renewFor ? `${renewFor.name} membership` : 'Renew membership'}
        subtitle="12-month term · instant activation"
        icon="Crown"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenewFor(null)}>Cancel</Button>
            <Button icon="Check" onClick={confirmRenew} disabled={saving}>
              {saving ? 'Processing…' : `${active ? 'Pay' : 'Join'} ${renewFor ? formatCurrency(renewFor.price) : ''}`}
            </Button>
          </>
        }
      >
        {renewFor ? (
          <>
            <div className="cb-card glass" style={{ padding: 14, marginBottom: 16 }}>
              <div className="cb-row between">
                <span className="small muted">Plan</span>
                <span className="small semibold">{renewFor.name}</span>
              </div>
              <div className="cb-row between" style={{ marginTop: 8 }}>
                <span className="small muted">Term</span>
                <span className="small semibold">{planDurationDays(renewFor.id)} days</span>
              </div>
              <div className="cb-row between" style={{ marginTop: 8 }}>
                <span className="small muted">Total payable</span>
                <span className="semibold">{formatCurrency(renewFor.price)}</span>
              </div>
            </div>
            <p className="tiny dim">
              Paid plans are activated only after Razorpay verifies the test payment. Free trials do not require payment.
            </p>
          </>
        ) : null}
      </Modal>
      <RazorpayModal
        open={Boolean(paymentPlan)}
        onClose={() => setPaymentPlan(null)}
        onCancel={() => setPaymentPlan(null)}
        onError={(message) => toast('Membership checkout cancelled', message, 'error')}
        amount={paymentPlan?.price || 0}
        purpose="membership"
        relatedId={paymentPlan?._id || paymentPlan?.id}
        description={`${paymentPlan?.name || 'Membership'} plan`}
        onSuccess={async () => {
          await completeMembershipPayment();
          setPaymentPlan(null);
        }}
      />
    </>
  );
}
