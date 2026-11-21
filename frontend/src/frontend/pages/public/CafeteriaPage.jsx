import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, ChipGroup, EmptyState, PageHeader, SectionHeading } from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import { cafeCategories, cafeMenu, cafeTables } from '../../data/cafeMenu';
import { formatCurrency } from '../../utils/format';
import { genImage, fallbackCafe, fallbackLandscape } from '../../utils/images';
import { useDebounced } from '../../hooks/useUi';
import { useImage } from '../../hooks/useImage';

const heroGen = genImage(
  'modern sports club cafeteria interior, wooden tables with court view windows, barista counter and healthy food display, warm ambient lighting, wide cinematic photograph',
  'landscape_16_9',
);

const zones = ['Terrace', 'Garden', 'Indoor'];

function MenuImage({ item }) {
  const { src } = useImage(item.image, fallbackCafe(item.id, item.category));
  return <img src={src} alt={item.name} loading="lazy" />;
}

/**
 * Public cafeteria page — the courtside cafe is a full club feature of its own:
 * browse the menu, see the seating zones, then sign in to order.
 */
export default function CafeteriaPage() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 200);
  const { src: heroImage } = useImage(heroGen, fallbackLandscape('cafeteria-restaurant'));

  const list = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return cafeMenu.filter((m) => {
      const inCat = category === 'all' || m.category === category;
      const inQuery = !q || `${m.name} ${m.description}`.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [category, debounced]);

  const featured = cafeMenu.filter((m) => m.rating >= 4.6).slice(0, 3);

  return (
    <div className="cb-page cb-container">
      <PageHeader
        icon="Coffee"
        title="Courtside Cafeteria"
        subtitle="Fresh, fast and player-friendly — eat well before and after you play, right beside the courts."
        actions={<Button icon="Sparkles" as={Link} to="/login">Sign in to order</Button>}
      />

      <Card glass glow style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div className="cb-shop-hero">
          <img src={heroImage} alt="ClubBloom cafeteria" loading="lazy" />
          <div className="cb-shop-hero-overlay">
            <Badge tone="info" icon="Coffee">Cafeteria &amp; bar</Badge>
            <h3 style={{ margin: '12px 0 8px' }}>Fuel your game, courtside</h3>
            <p className="small" style={{ maxWidth: 540, marginBottom: 16 }}>
              Cold-pressed juices, protein shakes, healthy bowls and comfort snacks. Order from your phone and collect at
              the counter — or have it served to your table.
            </p>
            <div className="cb-row wrap" style={{ gap: 10 }}>
              <Button icon="Coffee" as={Link} to="/login">Order now</Button>
              <Button variant="outline" icon="Map" as={Link} to="/facilities">See the club</Button>
            </div>
          </div>
        </div>
      </Card>

      {featured.length ? (
        <div className="cb-grid cols-3" style={{ gap: 16, marginBottom: 26 }}>
          {featured.map((m) => (
            <Card key={m.id} glass style={{ padding: 0, overflow: 'hidden' }}>
              <div className="product-thumb" style={{ borderRadius: '18px 18px 0 0' }}>
                <MenuImage item={m} />
                <span style={{ position: 'absolute', top: 10, left: 10 }}>
                  <Badge tone="warning" icon="Star">{m.rating}</Badge>
                </span>
              </div>
              <div style={{ padding: 14 }}>
                <div className="cb-row between" style={{ gap: 8 }}>
                  <div className="small semibold">{m.name}</div>
                  <span className="semibold text-electric tiny">{formatCurrency(m.price)}</span>
                </div>
                <p className="tiny dim" style={{ marginTop: 4 }}>{m.description}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <SectionHeading
        eyebrow="Full menu"
        title="Something for every craving"
        subtitle="Filter by category or search the whole menu — member pricing applies at checkout."
      />

      <div className="cb-row between wrap" style={{ gap: 14, marginBottom: 22 }}>
        <ChipGroup options={cafeCategories} value={category} onChange={(o) => setCategory(o.id)} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search the menu…" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="Search"
          title="No dishes found"
          message="Try a different category or clear your search."
          action={<Button variant="ghost" onClick={() => { setQuery(''); setCategory('all'); }}>Reset filters</Button>}
        />
      ) : (
        <div className="cb-grid cols-3" style={{ gap: 16 }}>
          {list.map((m) => (
            <Card key={m.id} glass glow style={{ padding: 0, overflow: 'hidden' }}>
              <div className="product-thumb">
                <MenuImage item={m} />
                <span style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                  <Badge tone={m.veg ? 'active' : 'danger'}>{m.veg ? 'Veg' : 'Non-veg'}</Badge>
                </span>
                <span style={{ position: 'absolute', top: 10, right: 10 }}>
                  <Badge tone="warning" icon="Star">{m.rating}</Badge>
                </span>
              </div>
              <div style={{ padding: 14 }}>
                <div className="cb-row between" style={{ gap: 8 }}>
                  <div className="small semibold" style={{ lineHeight: 1.3 }}>{m.name}</div>
                  <span className="semibold text-electric">{formatCurrency(m.price)}</span>
                </div>
                <p className="tiny dim" style={{ margin: '6px 0 10px', minHeight: 34 }}>{m.description}</p>
                <div className="cb-row between">
                  <span className="cb-row tiny dim" style={{ gap: 5 }}>
                    <Icon name="Timer" size={13} /> ~{m.prepMins} min
                  </span>
                  <Button size="sm" variant="outline" icon="Lock" as={Link} to="/login">Sign in to order</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="cb-section" style={{ paddingBottom: 0 }}>
        <SectionHeading
          eyebrow="Seating"
          title="Pick a spot"
          subtitle="Reserve a table when you order — courtside terrace, garden deck or the indoor lounge."
        />
        <div className="cb-grid cols-3" style={{ gap: 16 }}>
          {zones.map((z) => {
            const tables = cafeTables.filter((t) => t.zone === z);
            return (
              <Card key={z} glass>
                <CardTitle
                  icon={z === 'Terrace' ? 'Sun' : z === 'Garden' ? 'Sprout' : 'Utensils'}
                  title={`${z} seating`}
                  hint={`${tables.reduce((n, t) => n + t.seats, 0)} seats`}
                />
                <div className="cb-stack" style={{ gap: 10 }}>
                  {tables.map((t) => (
                    <div key={t.id} className="cb-row between">
                      <span className="cb-row small" style={{ gap: 9 }}>
                        <span className="stat-icon" style={{ width: 28, height: 28, borderRadius: 9 }}><Icon name="MapPin" size={13} /></span>
                        {t.label}
                      </span>
                      <span className="tiny dim">{t.seats} seats</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="cb-row center" style={{ marginTop: 30 }}>
          <Button icon="Coffee" as={Link} to="/login">Sign in to order at the cafe</Button>
        </div>
      </div>
    </div>
  );
}
