import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import { Badge, Button, Card, SectionHeading } from '../../../components/ui/primitives';
import { membershipPlans } from '../../../data/membershipPlans';
import { formatCurrency } from '../../../utils/format';

/** Membership pricing preview shown on the home page. */
export default function MembershipPreview() {
  return (
    <section className="cb-section" id="membership">
      <div className="cb-container">
        <SectionHeading
          eyebrow="Membership"
          title="Choose the membership that fits your game"
          subtitle="Transparent pricing, real benefits and a garden that grows as you play. Cancel or upgrade any time."
          center
        />

        <div className="cb-grid cols-3">
          {membershipPlans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card
                glass
                glow
                neon={p.popular}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {p.popular ? (
                  <span style={{ position: 'absolute', top: 0, right: 0 }}>
                    <span className="badge badge-info" style={{ borderRadius: '0 0 0 12px', padding: '6px 14px' }}>Most popular</span>
                  </span>
                ) : null}

                <span className={`stat-icon ${p.id === 'gold' ? 'gold' : p.id === 'junior' ? '' : 'green'}`} style={{ marginBottom: 14 }}>
                  <Icon name={p.id === 'junior' ? 'Sprout' : 'Crown'} size={18} />
                </span>
                <h3>{p.name}</h3>
                <p className="tiny dim" style={{ marginTop: 4 }}>{p.tagline}</p>

                <div className="cb-row" style={{ alignItems: 'baseline', gap: 8, margin: '18px 0' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{formatCurrency(p.price)}</span>
                  <span className="tiny dim">/ {p.period}</span>
                </div>

                <ul className="cb-stack" style={{ gap: 9, flex: 1 }}>
                  {p.perks.slice(0, 5).map((perk) => (
                    <li key={perk} className="cb-row tiny" style={{ gap: 9, alignItems: 'flex-start' }}>
                      <Icon name="CheckCircle2" size={14} style={{ color: '#4ade80', marginTop: 2, flex: 'none' }} />
                      <span className="muted">{perk}</span>
                    </li>
                  ))}
                </ul>

                {p.ageGroup ? <div className="tiny dim" style={{ marginTop: 10 }}>Age group: {p.ageGroup}</div> : null}

                <Button
                  variant={p.popular ? 'primary' : 'outline'}
                  block
                  as={Link}
                  to="/membership"
                  iconRight="ArrowRight"
                  style={{ marginTop: 18 }}
                >
                  Choose {p.name}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="cb-row center" style={{ marginTop: 26 }}>
          <Badge tone="info" icon="Info">All plans include app access, court booking and member pricing at the shop & cafe.</Badge>
        </div>
      </div>
    </section>
  );
}
