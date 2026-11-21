import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Badge, Button, Card, SectionHeading } from '../../../components/ui/primitives';
import { cafeMenu } from '../../../data/cafeMenu';
import { formatCurrency } from '../../../utils/format';
import { genImage, fallbackCafe, fallbackLandscape } from '../../../utils/images';
import { useImage } from '../../../hooks/useImage';

const heroGen = genImage(
  'modern sports club cafeteria interior, wooden tables with court view windows, barista counter and healthy food display, warm ambient lighting, wide cinematic photograph',
  'landscape_4_3',
);

function MenuImage({ item }) {
  const { src } = useImage(item.image, fallbackCafe(item.id, item.category));
  return <img src={src} alt={item.name} loading="lazy" />;
}

const highlights = [
  { icon: 'GlassWater', label: 'Cold-pressed bar', hint: 'Fresh juices & smoothies' },
  { icon: 'Salad', label: 'Healthy bowls', hint: 'Athlete breakfasts & mains' },
  { icon: 'Coffee', label: 'Barista coffee', hint: 'Chai, espresso & shakes' },
  { icon: 'IceCream', label: 'Desserts', hint: 'Cheesecakes & treats' },
];

/**
 * Home-page cafeteria section — the courtside cafe as a standalone feature
 * with its own imagery, popular items and a link to the full public menu.
 */
export default function CafeSection() {
  const popular = [...cafeMenu].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const { src: cafeHero } = useImage(heroGen, fallbackLandscape('cafeteria-restaurant'));

  return (
    <section className="cb-section" id="cafeteria">
      <div className="cb-container">
        <SectionHeading
          eyebrow="Courtside Cafeteria"
          title="Eat, refuel and unwind"
          subtitle="A full cafe and bar beside the courts — order from your phone or relax at a table between sessions."
          center
        />

        <div className="cb-grid cols-2" style={{ alignItems: 'center', gap: 34, marginBottom: 30 }}>
          <Card glass glow style={{ padding: 0, overflow: 'hidden' }}>
            <div className="product-thumb" style={{ aspectRatio: '16 / 11', borderRadius: 0 }}>
              <img src={cafeHero} alt="ClubBloom cafeteria" loading="lazy" />
              <span style={{ position: 'absolute', top: 12, left: 12 }}>
                <Badge tone="info" icon="Coffee">Open daily</Badge>
              </span>
            </div>
          </Card>

          <div>
            <h3 style={{ marginBottom: 12 }}>Fuel your game, courtside</h3>
            <p className="small" style={{ marginBottom: 20 }}>
              Whether it is a pre-match protein shake or a post-game feast, the ClubBloom cafeteria keeps you performing.
              Members enjoy priority table service right next to the courts.
            </p>

            <div className="cb-grid cols-2" style={{ gap: 14, marginBottom: 22 }}>
              {highlights.map((h) => (
                <div key={h.label} className="cb-row" style={{ gap: 11 }}>
                  <span className="stat-icon" style={{ width: 38, height: 38, borderRadius: 12 }}><Icon name={h.icon} size={17} /></span>
                  <div>
                    <div className="small semibold">{h.label}</div>
                    <div className="tiny dim">{h.hint}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cb-row wrap" style={{ gap: 10 }}>
              <Button icon="Coffee" as={Link} to="/cafeteria">Explore the cafeteria</Button>
              <Button variant="outline" icon="Sparkles" as={Link} to="/register">Join for member pricing</Button>
            </div>
          </div>
        </div>

        <div className="cb-grid cols-4" style={{ gap: 16 }}>
          {popular.map((m) => (
            <Card key={m.id} glass style={{ padding: 0, overflow: 'hidden' }}>
              <div className="product-thumb" style={{ borderRadius: '18px 18px 0 0' }}>
                <MenuImage item={m} />
                <span style={{ position: 'absolute', top: 10, left: 10 }}>
                  <Badge tone="warning" icon="Star">{m.rating}</Badge>
                </span>
              </div>
              <div style={{ padding: 14 }}>
                <div className="small semibold" style={{ lineHeight: 1.3, minHeight: 36 }}>{m.name}</div>
                <div className="cb-row between" style={{ marginTop: 8 }}>
                  <span className="semibold text-electric">{formatCurrency(m.price)}</span>
                  <span className="tiny dim">~{m.prepMins} min</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="cb-row center" style={{ marginTop: 30 }}>
          <Button variant="ghost" iconRight="ArrowRight" as={Link} to="/cafeteria">
            View the full menu
          </Button>
        </div>
      </div>
    </section>
  );
}
