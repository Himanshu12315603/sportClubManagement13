import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Button, Card } from '../../../components/ui/primitives';

const steps = [
  { icon: 'ClipboardCheck', title: 'Tell us your sport', text: 'Pick the facility and a slot that suits you.' },
  { icon: 'CalendarCheck', title: 'We confirm your trial', text: 'A coach greets you and shows you around.' },
  { icon: 'Sprout', title: 'Plant your first seed', text: 'Love it? Upgrade and your garden starts to bloom.' },
];

/** Free-trial call to action. */
export default function TrialSection() {
  return (
    <section className="cb-section" id="trial">
      <div className="cb-container">
        <Card glass style={{ padding: 0, overflow: 'hidden' }}>
          <div className="cb-grid cols-2" style={{ gap: 0, alignItems: 'stretch' }}>
            <div style={{ padding: '42px 38px' }}>
              <span className="cb-eyebrow"><Icon name="Gift" size={13} /> 14-day free trial</span>
              <h2 style={{ margin: '18px 0 14px' }}>Try ClubBloom free — no card required</h2>
              <p className="small" style={{ maxWidth: 460 }}>
                Pick two sports, book two sessions each and get a guided tour of the club. It is the fastest way to feel
                the difference before you commit.
              </p>

              <div className="cb-stack" style={{ marginTop: 24, gap: 16 }}>
                {steps.map((s, i) => (
                  <div key={s.title} className="cb-row" style={{ gap: 14, alignItems: 'flex-start' }}>
                    <span className="stat-icon" style={{ width: 38, height: 38, borderRadius: 12, flex: 'none' }}><Icon name={s.icon} size={17} /></span>
                    <div>
                      <div className="small semibold">{i + 1}. {s.title}</div>
                      <div className="tiny dim">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cb-row wrap" style={{ gap: 12, marginTop: 28 }}>
                <Button size="lg" icon="CalendarCheck" as={Link} to="/trial">Book my free trial</Button>
                <Button size="lg" variant="ghost" as={Link} to="/membership">See membership plans</Button>
              </div>
            </div>

            <div
              style={{
                padding: '42px 38px',
                background: 'linear-gradient(160deg, rgba(37,99,235,0.18), rgba(255,23,68,0.10))',
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              {[
                { icon: 'Users', label: '2 sports of your choice' },
                { icon: 'CalendarDays', label: '2 trial sessions per sport' },
                { icon: 'Map', label: 'Guided facility tour' },
                { icon: 'Sparkles', label: 'Full app + garden preview' },
                { icon: 'Trophy', label: 'No commitment, no card' },
              ].map((r) => (
                <div key={r.label} className="cb-row" style={{ gap: 12 }}>
                  <span className="stat-icon green" style={{ width: 34, height: 34, borderRadius: 11 }}><Icon name={r.icon} size={15} /></span>
                  <span className="small semibold">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
