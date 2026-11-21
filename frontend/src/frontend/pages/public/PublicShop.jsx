import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card, ChipGroup, EmptyState, PageHeader } from '../../components/ui/primitives';
import { SearchInput } from '../../components/ui/form';
import { deliveryOptions, products, shopCategories } from '../../data/products';
import { planById } from '../../data/membershipPlans';
import { formatCurrency } from '../../utils/format';
import { genImage, fallbackImage, fallbackLandscape } from '../../utils/images';
import { useDebounced } from '../../hooks/useUi';
import { useImage } from '../../hooks/useImage';

const memberPct = planById('gold')?.shopDiscountPct ?? 20;

const heroGen = genImage(
  'premium sports pro shop interior, tennis rackets and badminton gear on illuminated shelves, sneakers and sportswear displays, dramatic warm lighting, wide cinematic photograph',
  'landscape_16_9',
);

const categoryTiles = shopCategories
  .filter((c) => c.id !== 'all')
  .map((c) => ({ ...c, image: products.find((p) => p.category === c.id)?.image }));

function ProductImage({ product }) {
  const { src } = useImage(product.image, fallbackImage(product.id, product.category));
  return <img src={src} alt={product.name} loading="lazy" />;
}

function CategoryImage({ tile }) {
  const sample = products.find((p) => p.category === tile.id);
  const { src } = useImage(tile.image, fallbackImage(sample?.id, tile.id));
  return <img src={src} alt={tile.label} loading="lazy" />;
}

export default function PublicShop() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 200);
  const { src: heroImage } = useImage(heroGen, fallbackLandscape('sports-shop'));

  const list = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = category === 'all' || p.category === category;
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [category, debounced]);

  return (
    <div className="cb-page cb-container">
      <PageHeader
        title="Sports Shop"
        icon="ShoppingBag"
        subtitle="Gear, apparel and accessories — ordered online and ready for court-side pickup."
        actions={<Button icon="Sparkles" as={Link} to="/register">Join to buy</Button>}
      />

      <Card glass glow style={{ padding: 0, overflow: 'hidden', marginBottom: 22 }}>
        <div className="cb-shop-hero">
          <img src={heroImage} alt="ClubBloom pro shop" loading="lazy" />
          <div className="cb-shop-hero-overlay">
            <Badge tone="gold" icon="Sparkles">Member pro shop</Badge>
            <h3 style={{ margin: '12px 0 8px' }}>Everything you need, courtside</h3>
            <p className="small" style={{ maxWidth: 520, marginBottom: 16 }}>
              Rackets, footwear and apparel hand-picked by our coaches. Members save {memberPct}% on every product —
              plus free racket stringing.
            </p>
            <div className="cb-row wrap" style={{ gap: 10 }}>
              <Button icon="Crown" as={Link} to="/register">Unlock {memberPct}% member pricing</Button>
              <Button variant="outline" icon="Map" as={Link} to="/facilities">Visit the pro shop</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="cb-grid cols-4" style={{ gap: 14, marginBottom: 22 }}>
        {categoryTiles.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cb-cat-tile ${category === c.id ? 'active' : ''}`}
            onClick={() => setCategory(category === c.id ? 'all' : c.id)}
          >
            <CategoryImage tile={c} />
            <span className="cb-cat-tile-label">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="cb-row between wrap" style={{ gap: 14, marginBottom: 22 }}>
        <ChipGroup options={shopCategories} value={category} onChange={(o) => setCategory(o.id)} />
        <SearchInput value={query} onChange={setQuery} placeholder="Search rackets, shoes, apparel…" />
      </div>

      {list.length === 0 ? (
        <EmptyState icon="Search" title="No products found" message="Try a different category or clear your search." action={<Button variant="ghost" onClick={() => { setQuery(''); setCategory('all'); }}>Reset filters</Button>} />
      ) : (
        <div className="cb-grid cols-4">
          {list.map((p) => (
            <Card key={p.id} glass glow style={{ padding: 14, display: 'flex', flexDirection: 'column' }}>
              <div className="product-thumb" style={{ marginBottom: 12 }}>
                <ProductImage product={p} />
                {p.mrp > p.price ? (
                  <span style={{ position: 'absolute', top: 10, left: 10 }}>
                    <Badge tone="danger">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off</Badge>
                  </span>
                ) : null}
              </div>

              <div className="tiny dim">{p.brand} · {p.sport}</div>
              <div className="small semibold" style={{ margin: '4px 0 8px', lineHeight: 1.3, minHeight: 36 }}>{p.name}</div>

              <div className="cb-row" style={{ gap: 8, alignItems: 'baseline' }}>
                <span className="semibold">{formatCurrency(p.price)}</span>
                {p.mrp > p.price ? <span className="tiny dim" style={{ textDecoration: 'line-through' }}>{formatCurrency(p.mrp)}</span> : null}
              </div>
              <div className="tiny" style={{ color: '#4ade80', marginTop: 4 }}>
                Members save {memberPct}% → {formatCurrency(Math.round(p.price * (1 - memberPct / 100)))}
              </div>

              <div className="cb-row between tiny dim" style={{ marginTop: 10 }}>
                <span className="cb-row" style={{ gap: 4, color: '#fbbf24' }}><Icon name="Star" size={12} /> {p.rating}</span>
                <span>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                block
                icon="Lock"
                as={Link}
                to="/login"
                style={{ marginTop: 12 }}
              >
                Sign in to buy
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card glass style={{ marginTop: 26 }}>
        <div className="cb-grid cols-2" style={{ gap: 20 }}>
          <div>
            <h4 style={{ marginBottom: 10 }}>Delivery or club pickup</h4>
            <div className="cb-stack" style={{ gap: 10 }}>
              {deliveryOptions.map((d) => (
                <div key={d.id} className="cb-row" style={{ gap: 11 }}>
                  <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 11 }}><Icon name={d.icon} size={15} /></span>
                  <div>
                    <div className="small semibold">{d.label}</div>
                    <div className="tiny dim">{d.hint} · {d.fee ? formatCurrency(d.fee) : 'Free'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 10 }}>Why buy from ClubBloom?</h4>
            <ul className="cb-stack" style={{ gap: 8 }}>
              {['Member pricing on every product', 'Free racket stringing with any racket', 'Try before you buy at the pro shop', 'Easy returns within 14 days'].map((t) => (
                <li key={t} className="cb-row tiny" style={{ gap: 9 }}>
                  <Icon name="CheckCircle2" size={14} style={{ color: '#4ade80', flex: 'none' }} />
                  <span className="muted">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
