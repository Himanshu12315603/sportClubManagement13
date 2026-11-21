import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, InfoNote, KeyValue, PageHeader, SectionHeading } from '../../components/ui/primitives';

const timeline = [
  { year: '2021', title: 'First court', text: 'ClubBloom opens with three floodlit tennis courts and a big idea.' },
  { year: '2023', title: 'Indoor expansion', text: 'Eight badminton courts, cricket lanes and the fitness studio join the club.' },
  { year: '2025', title: 'Padel & social play', text: 'Four glass padel courts make social play the fastest-growing part of the club.' },
  { year: '2026', title: 'The living club', text: 'The virtual garden and ClubBloom AI launch — a club that grows with every member.' },
];

const values = [
  { icon: 'Trophy', title: 'Excellence', text: 'Tournament-grade surfaces and coaching, maintained daily.' },
  { icon: 'Heart', title: 'Belonging', text: 'Leagues, mixers and a community that plays together.' },
  { icon: 'Sprout', title: 'Growth', text: 'Progress you can see — in your game and in your garden.' },
  { icon: 'ShieldCheck', title: 'Fairness', text: 'Clear rules, transparent pricing, no hidden fees.' },
];

export default function AboutPage() {
  return (
    <div className="cb-page cb-container">
      <PageHeader
        title="About ClubBloom"
        icon="Flower2"
        subtitle="A smarter sports club where every match, every membership and every moment grows into something extraordinary."
        actions={<Button icon="CalendarCheck" as={Link} to="/trial">Book a trial</Button>}
      />

      <div className="cb-grid cols-2" style={{ alignItems: 'start', gap: 30 }}>
        <Card glass className="cb-prose">
          <h3 style={{ marginTop: 0 }}>Our story</h3>
          <p>
            ClubBloom began with a frustration: sports clubs were great at sport and poor at everything around it. Booking
            was a phone call, membership was a form, and loyalty was invisible.
          </p>
          <p>
            So we rebuilt the club from the member&apos;s point of view — app-first booking, courtside ordering, transparent
            memberships, and a playful virtual garden that turns engagement into something you can actually watch grow.
          </p>
          <h3>Our mission</h3>
          <p>
            To make playing sport effortless, social and rewarding — for beginners picking up a racket for the first time
            and for regulars chasing a personal best.
          </p>
          <h3>One platform, three experiences</h3>
          <p>
            Members get a living dashboard. Managers get one console for courts, members, the shop, the cafe, staff and
            finance. Administrators get platform governance, reports and audit trails — with permissions kept strictly
            separate from the manager role.
          </p>
        </Card>

        <div className="cb-stack">
          <Card glass>
            <CardTitle icon="Building2" title="Club at a glance" />
            <KeyValue label="Founded" value="2021" />
            <KeyValue label="Members" value="1,570" mono />
            <KeyValue label="Facilities" value="7" mono />
            <KeyValue label="Bookable courts" value="22" mono />
            <KeyValue label="Member rating" value="4.7 ★" mono />
            <KeyValue label="Location" value="Whitefield, Bengaluru" />
          </Card>

          <Card glass>
            <CardTitle icon="Target" title="What we stand for" />
            <div className="cb-stack" style={{ gap: 14 }}>
              {values.map((v) => (
                <div key={v.title} className="cb-row" style={{ gap: 12 }}>
                  <span className="stat-icon" style={{ width: 36, height: 36, borderRadius: 11 }}><Icon name={v.icon} size={16} /></span>
                  <div>
                    <div className="small semibold">{v.title}</div>
                    <div className="tiny dim">{v.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="cb-section">
        <SectionHeading eyebrow="Milestones" title="How ClubBloom grew" center />
        <div className="cb-grid cols-4">
          {timeline.map((t) => (
            <Card key={t.year} glass glow>
              <Badge tone="info">{t.year}</Badge>
              <h4 style={{ margin: '12px 0 6px' }}>{t.title}</h4>
              <p className="tiny">{t.text}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card glass style={{ padding: 0, overflow: 'hidden' }}>
        <div className="cb-grid cols-2" style={{ gap: 0 }}>
          <div style={{ padding: '34px 32px' }}>
            <span className="cb-eyebrow"><Icon name="MapPin" size={13} /> Visit us</span>
            <h2 style={{ margin: '16px 0 12px', fontSize: '1.6rem' }}>Come and see the club</h2>
            <p className="small" style={{ marginBottom: 18 }}>
              Walk-ins welcome during opening hours. Book a trial and a coach will show you around every facility.
            </p>
            <div className="cb-stack" style={{ gap: 10 }}>
              <div className="cb-row small muted" style={{ gap: 9 }}><Icon name="MapPin" size={15} /> ClubBloom Sports Club, Whitefield, Bengaluru 560066</div>
              <div className="cb-row small muted" style={{ gap: 9 }}><Icon name="Phone" size={15} /> +91 80 4000 2200</div>
              <div className="cb-row small muted" style={{ gap: 9 }}><Icon name="Mail" size={15} /> hello@clubbloom.in</div>
              <div className="cb-row small muted" style={{ gap: 9 }}><Icon name="Clock" size={15} /> Open 05:00 – 23:00 daily</div>
            </div>
            <div className="cb-row wrap" style={{ gap: 12, marginTop: 22 }}>
              <Button icon="CalendarCheck" as={Link} to="/trial">Book a free trial</Button>
              <Button variant="ghost" icon="ShoppingBag" as={Link} to="/shop">Visit the shop</Button>
            </div>
          </div>
          <div style={{ padding: '34px 32px', background: 'linear-gradient(160deg, rgba(37,99,235,0.16), rgba(255,23,68,0.10))', borderLeft: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: 14 }}>Frequently asked</h4>
            <div className="cb-stack" style={{ gap: 14 }}>
              <div>
                <div className="small semibold">Do I need to be a member to play?</div>
                <div className="tiny dim">You can start with a free trial, but ongoing court bookings require a membership.</div>
              </div>
              <div>
                <div className="small semibold">Is coaching available for beginners?</div>
                <div className="tiny dim">Yes — group clinics are free for Gold members, and 1-to-1 coaching is available to all.</div>
              </div>
              <div>
                <div className="small semibold">Can I bring a guest?</div>
                <div className="tiny dim">Guest passes are included with Silver and Gold memberships.</div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <InfoNote icon="Sparkles">ClubBloom AI can answer club questions any time from your dashboard.</InfoNote>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
