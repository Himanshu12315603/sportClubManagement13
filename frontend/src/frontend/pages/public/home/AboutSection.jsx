import Icon from '../../../components/ui/Icon';
import { Card, SectionHeading } from '../../../components/ui/primitives';

const pillars = [
  { icon: 'Trophy', tone: 'gold', title: 'World-class facilities', text: 'Championship courts, sprung indoor flooring and a fully equipped fitness studio — all under one roof.' },
  { icon: 'Sprout', tone: 'green', title: 'A club that grows with you', text: 'Your animated 3D virtual tree blooms as you play, renew and take part in club life.' },
  { icon: 'Handshake', tone: '', title: 'Community & social play', text: 'Social mixers, round robins and leagues that keep the club alive beyond your own match.' },
  { icon: 'Bot', tone: '', title: 'Smarter, faster service', text: 'App-first booking, cafe ordering and a ClubBloom AI assistant on every screen.' },
];

export default function AboutSection() {
  return (
    <section className="cb-section">
      <div className="cb-container">
        <SectionHeading
          eyebrow="About ClubBloom"
          title="Not just a sports club — a place that grows with you"
          subtitle="ClubBloom blends premium facilities with a living, gamified member experience. Book in seconds, order courtside, and watch your club journey bloom."
          center
        />

        <div className="cb-grid cols-2" style={{ alignItems: 'center', gap: 40, marginBottom: 46 }}>
          <div>
            <h3 style={{ marginBottom: 14 }}>Play. Grow. Connect. Your club, your world.</h3>
            <p className="small" style={{ marginBottom: 14 }}>
              We built ClubBloom around a simple idea: a club should feel alive. Every booking, shop order and cafe visit
              feeds a virtual tree that mirrors your membership — so retention stops being a spreadsheet and becomes
              something members actually want to watch.
            </p>
            <p className="small">
              Behind the scenes, one platform runs the whole club: court rules, membership plans, the pro shop, the
              cafeteria, staff rosters and finance — for members, managers and administrators alike.
            </p>

            <div className="cb-grid cols-2" style={{ marginTop: 24, gap: 14 }}>
              {[
                { icon: 'CalendarCheck', label: '1-hour sessions', hint: '30-minute slot grid' },
                { icon: 'Percent', label: 'Up to 30% off', hint: 'Member court pricing' },
                { icon: 'Users', label: 'Social play', hint: 'Join a shared court' },
                { icon: 'Wallet', label: 'Cash · Card · UPI', hint: 'Every channel' },
              ].map((f) => (
                <div key={f.label} className="cb-row" style={{ gap: 11 }}>
                  <span className="stat-icon" style={{ width: 36, height: 36, borderRadius: 11 }}><Icon name={f.icon} size={16} /></span>
                  <div>
                    <div className="small semibold">{f.label}</div>
                    <div className="tiny dim">{f.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cb-grid cols-2" style={{ gap: 16 }}>
            {pillars.map((p) => (
              <Card key={p.title} glass glow>
                <span className={`stat-icon ${p.tone}`} style={{ marginBottom: 12 }}><Icon name={p.icon} size={18} /></span>
                <h4 style={{ marginBottom: 6 }}>{p.title}</h4>
                <p className="tiny">{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
