import { Badge, Button } from '../ui/primitives';
import Icon from '../ui/Icon';
import { formatCurrency } from '../../utils/format';
import { fallbackImage } from '../../utils/images';
import { useImage } from '../../hooks/useImage';

/** Shop catalogue tile used on both the public and customer shop screens. */
export default function ProductCard({ product, memberPct = 0, onAdd, ctaLabel = 'Add to cart' }) {
  const out = product.stock <= 0;
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const { src } = useImage(product.image, fallbackImage(product.id, product.category));

  return (
    <div className="cb-card glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="product-thumb" style={{ position: 'relative', borderRadius: '14px 14px 0 0' }}>
        <img src={src} alt={product.name} loading="lazy" />
        {off ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge tone="danger">{off}% off</Badge>
          </span>
        ) : null}
        {product.stock > 0 && product.stock <= 5 ? (
          <span style={{ position: 'absolute', top: 10, right: 10 }}>
            <Badge tone="warning">Only {product.stock} left</Badge>
          </span>
        ) : null}
      </div>

      <div className="cb-stack" style={{ padding: 16, gap: 8, flex: 1 }}>
        <div className="cb-row between" style={{ gap: 8 }}>
          <span className="tiny dim">{product.brand} · {product.sport}</span>
          <span className="tiny cb-row" style={{ gap: 4 }}>
            <Icon name="Star" size={12} className="text-warning" />
            {product.rating}
          </span>
        </div>
        <h4 style={{ fontSize: '1rem' }}>{product.name}</h4>
        <p className="tiny dim">{product.description}</p>

        <div className="cb-row between" style={{ marginTop: 'auto', paddingTop: 8 }}>
          <div>
            <div className="semibold">{formatCurrency(product.price)}</div>
            {product.mrp > product.price ? (
              <div className="tiny dim" style={{ textDecoration: 'line-through' }}>{formatCurrency(product.mrp)}</div>
            ) : null}
          </div>
          {memberPct ? (
            <span className="tiny text-success semibold">
              Members save {formatCurrency(Math.round((product.price * memberPct) / 100))}
            </span>
          ) : null}
        </div>

        <Button
          icon={out ? 'Ban' : ctaLabel === 'Add to cart' ? 'Plus' : 'ShoppingBag'}
          variant={out ? 'ghost' : 'primary'}
          size="sm"
          block
          disabled={out}
          onClick={() => onAdd?.(product)}
        >
          {out ? 'Out of stock' : ctaLabel}
        </Button>
      </div>
    </div>
  );
}
