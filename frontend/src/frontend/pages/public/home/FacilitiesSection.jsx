import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import { Badge, Button, Card, SectionHeading } from '../../../components/ui/primitives';
import { facilities } from '../../../data/facilities';

/**
 * Home-page facilities preview. Each card carries an image, description,
 * live availability and an Explore action that deep-links into the facilities page.
 */
export default function FacilitiesSection({ limit }) {
  const list = limit ? facilities.slice(0, limit) : facilities;

  return (
    <section className="cb-section" id="facilities">
      <div className="cb-container">
        <SectionHeading
          eyebrow="Our Facilities"
          title="Seven ways to play"
          subtitle="From floodlit tennis courts to a courtside cafe — explore everything ClubBloom has to offer."
          center
        />

        <div className="cb-grid cols-3">
          {list.map((f) => (
            <Card key={f.id} glass glow as="article" style={{ padding: 0 }}>
              <div className="product-thumb" style={{ aspectRatio: '16 / 10', borderRadius: '18px 18px 0 0' }}>
                <img src={f.image} alt={f.name} loading="lazy" />
                <span style={{ position: 'absolute', top: 12, left: 12 }}>
                  <Badge tone={f.availabilityTone.replace('badge-', '')}>{f.availability}</Badge>
                </span>
              </div>
              <div style={{ padding: 18 }}>
                <div className="cb-row between" style={{ marginBottom: 8 }}>
                  <div className="cb-row" style={{ gap: 9 }}>
                    <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10, color: f.accent }}><Icon name={f.icon} size={16} /></span>
                    <h4>{f.name}</h4>
                  </div>
                  <span className="cb-row tiny" style={{ gap: 4, color: '#fbbf24' }}>
                    <Icon name="Star" size={13} /> {f.rating}
                  </span>
                </div>
                <p className="tiny" style={{ minHeight: 42 }}>{f.description}</p>

                <div className="cb-row between wrap" style={{ marginTop: 14, gap: 8 }}>
                  <span className="cb-row tiny dim" style={{ gap: 6 }}>
                    <Icon name="Clock" size={13} /> {f.hours}
                  </span>
                  {f.peakPrice > 0 ? (
                    <span className="tiny semibold text-electric">from ₹{f.offPeakPrice}/hr</span>
                  ) : (
                    <span className="tiny semibold text-success">Included</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  block
                  iconRight="ArrowRight"
                  as={Link}
                  to="/facilities"
                  style={{ marginTop: 14 }}
                >
                  Explore {f.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {limit ? (
          <div className="cb-row center" style={{ marginTop: 34 }}>
            <Button variant="ghost" iconRight="ArrowRight" as={Link} to="/facilities">
              View all facilities
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
