import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, PageHeader, SectionHeading, Tabs } from '../../components/ui/primitives';
import { membershipPlans, paymentMethods, trialPlan } from '../../data/membershipPlans';
import { formatCurrency } from '../../utils/format';

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes — upgrade or downgrade at any time. The difference is pro-rated and your garden keeps its growth stage.' },
  { q: 'How does the court discount work?', a: 'The discount is applied automatically at checkout, based on your plan. Gold members save 30% on every court booking.' },
  { q: 'What happens when my membership expires?', a: 'Bookings pause and your virtual garden gradually withers. Renew any time within 30 days and it blooms back to full health.' },
  { q: 'Is there a joining fee?', a: 'No joining fee. The price you see is the price you pay, plus applicable GST.' },
];

export default function MembershipPage() {
  const [tab, setTab] = useState('plans');

  return (
    <div className="cb-page cb-container">
      <PageHeader
        title="Membership"
        icon="Crown"
        subtitle="Transparent pricing with real, usable benefits. Every plan includes the full ClubBloom app."
        actions={<Button icon="CalendarCheck" as={Link} to="/trial">Try 14 days free</Button>}
      />

      <Tabs
        tabs={[
          { id: 'plans', label: 'Plans', icon: 'Crown' },
          { id: 'compare', label: 'Compare', icon: 'BarChart3' },
          { id: 'payment', label: 'Payments', icon: 'Wallet' },
          { id: 'faq', label: 'FAQ', icon: 'Info' },
        ]}
        value={tab}
        onChange={setTab}
        className=""
      />

      <div style={{ marginTop: 26 }}>
        {tab === 'plans' ? (
          <div className="cb-grid cols-3">
            {membershipPlans.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <Card glass glow neon={p.popular} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="cb-row between">
                    <span className={`stat-icon ${p.id === 'gold' ? 'gold' : p.id === 'junior' ? '' : 'green'}`}>
                      <Icon name={p.id === 'junior' ? 'Sprout' : 'Crown'} size={18} />
                    </span>
                    {p.popular ? <Badge tone="info">Most popular</Badge> : <Badge tone="neutral">{p.badge.replace('badge-', '')}</Badge>}
                  </div>

                  <h3 style={{ marginTop: 16 }}>{p.name}</h3>
                  <p className="tiny dim" style={{ marginTop: 4 }}>{p.tagline}</p>

                  <div className="cb-row" style={{ alignItems: 'baseline', gap: 8, margin: '18px 0' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{formatCurrency(p.price)}</span>
                    <span className="tiny dim">/ {p.period}</span>
                  </div>

                  <ul className="cb-stack" style={{ gap: 10, flex: 1 }}>
                    {p.perks.map((perk) => (
                      <li key={perk} className="cb-row tiny" style={{ gap: 9, alignItems: 'flex-start' }}>
                        <Icon name="CheckCircle2" size={14} style={{ color: '#4ade80', marginTop: 2, flex: 'none' }} />
                        <span className="muted">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant={p.popular ? 'primary' : 'outline'} block as={Link} to="/register" style={{ marginTop: 20 }}>
                    Join {p.name}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null}

        {tab === 'compare' ? (
          <Card glass style={{ padding: 0 }}>
            <div className="cb-table-wrap" style={{ border: 0, borderRadius: 0, background: 'transparent' }}>
              <table className="cb-table">
                <thead>
                  <tr>
                    <th>Benefit</th>
                    {membershipPlans.map((p) => <th key={p.id} style={{ textAlign: 'center' }}>{p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Annual price', render: (p) => formatCurrency(p.price) },
                    { label: 'Court discount', render: (p) => `${p.courtDiscountPct}%` },
                    { label: 'Shop discount', render: (p) => `${p.shopDiscountPct}%` },
                    { label: 'Cafeteria discount', render: (p) => `${p.cafeDiscountPct}%` },
                    { label: 'Sessions / day', render: (p) => p.dailyBookingLimit },
                    { label: 'Advance booking window', render: (p) => `${p.advanceBookingDays} days` },
                    { label: 'Guest passes', render: (p) => (p.id === 'gold' ? '4 / month' : p.id === 'silver' ? '2 / month' : '—') },
                    { label: 'Coaching included', render: (p) => (p.id === 'gold' ? 'Monthly' : p.id === 'junior' ? 'Academy' : '—') },
                    { label: 'Age group', render: (p) => p.ageGroup || 'All ages' },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="semibold">{row.label}</td>
                      {membershipPlans.map((p) => (
                        <td key={p.id} style={{ textAlign: 'center' }} className="mono">{row.render(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {tab === 'payment' ? (
          <div className="cb-grid cols-2">
            <Card glass>
              <CardTitle icon="Wallet" title="Ways to pay" hint="Choose what suits you at checkout" />
              <div className="cb-stack" style={{ gap: 12 }}>
                {paymentMethods.map((m) => (
                  <div key={m.id} className="cb-row" style={{ gap: 12 }}>
                    <span className="stat-icon" style={{ width: 38, height: 38, borderRadius: 12 }}><Icon name={m.icon} size={17} /></span>
                    <div>
                      <div className="small semibold">{m.label}</div>
                      <div className="tiny dim">{m.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card glass>
              <CardTitle icon="Gift" title="Start with a free trial" hint={trialPlan.tagline} />
              <ul className="cb-stack" style={{ gap: 10 }}>
                {trialPlan.perks.map((perk) => (
                  <li key={perk} className="cb-row tiny" style={{ gap: 9 }}>
                    <Icon name="CheckCircle2" size={14} style={{ color: '#4ade80', flex: 'none' }} />
                    <span className="muted">{perk}</span>
                  </li>
                ))}
              </ul>
              <Button block icon="CalendarCheck" as={Link} to="/trial" style={{ marginTop: 18 }}>Book my free trial</Button>
            </Card>
          </div>
        ) : null}

        {tab === 'faq' ? (
          <div className="cb-grid cols-2">
            {faqs.map((f) => (
              <Card key={f.q} glass>
                <div className="cb-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span className="stat-icon" style={{ width: 32, height: 32, borderRadius: 10, flex: 'none' }}><Icon name="Info" size={14} /></span>
                  <div>
                    <h4 style={{ marginBottom: 6 }}>{f.q}</h4>
                    <p className="tiny">{f.a}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      <div className="cb-section" style={{ paddingBottom: 0 }}>
        <SectionHeading eyebrow="Not sure yet?" title="Try before you commit" subtitle="A 14-day trial gives you two sports, two sessions each and a guided tour — no card required." center />
        <div className="cb-row center">
          <Button size="lg" icon="CalendarCheck" as={Link} to="/trial">Book my free trial</Button>
        </div>
      </div>
    </div>
  );
}
