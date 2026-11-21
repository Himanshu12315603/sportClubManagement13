import { useState } from 'react';
import { Badge, Button } from '../ui/primitives';
import Modal from '../ui/Modal';
import Icon from '../ui/Icon';
import { formatCurrency } from '../../utils/format';
import { fallbackImage } from '../../utils/images';
import { useImage } from '../../hooks/useImage';

/** Shop catalogue tile with product details, stock indicator, and details modal. */
export default function ProductCard({ product, memberPct = 0, onAdd, ctaLabel = 'Add to cart' }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const out = product.stock <= 0;
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const { src } = useImage(product.image, fallbackImage(product.id, product.category));

  return (
    <>
      <div
        className="cb-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="product-thumb" style={{ position: 'relative', borderRadius: 0, height: 190, background: '#f8fafc' }}>
          <img src={src} alt={product.name} loading="lazy" style={{ objectFit: 'cover' }} />
          {off ? (
            <span style={{ position: 'absolute', top: 10, left: 10 }}>
              <Badge tone="danger">{off}% off</Badge>
            </span>
          ) : null}
          {product.stock > 0 && product.stock <= 5 ? (
            <span style={{ position: 'absolute', top: 10, right: 10 }}>
              <Badge tone="warning">Only {product.stock} left</Badge>
            </span>
          ) : product.stock > 5 ? (
            <span style={{ position: 'absolute', top: 10, right: 10 }}>
              <Badge tone="active">{product.stock} in stock</Badge>
            </span>
          ) : (
            <span style={{ position: 'absolute', top: 10, right: 10 }}>
              <Badge tone="danger">Out of stock</Badge>
            </span>
          )}
        </div>

        <div className="cb-stack" style={{ padding: 16, gap: 10, flex: 1 }}>
          <div className="cb-row between" style={{ gap: 8 }}>
            <span className="tiny dim text-uppercase semibold" style={{ letterSpacing: 0.5 }}>
              {product.brand} · {product.sport}
            </span>
            {product.rating && (
              <span className="tiny cb-row" style={{ gap: 4, color: '#f59e0b', fontWeight: 600 }}>
                <Icon name="Star" size={13} />
                {product.rating}
              </span>
            )}
          </div>

          <h4 style={{ fontSize: '1.02rem', color: '#172b4d', margin: 0 }}>{product.name}</h4>
          <p className="tiny dim" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>

          <div className="cb-row between" style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
            <div>
              <div className="semibold" style={{ fontSize: '1.1rem', color: '#172b4d' }}>{formatCurrency(product.price)}</div>
              {product.mrp > product.price ? (
                <div className="tiny dim" style={{ textDecoration: 'line-through' }}>{formatCurrency(product.mrp)}</div>
              ) : null}
            </div>
            {memberPct ? (
              <span className="tiny semibold" style={{ color: '#16a085', background: '#ddf5ec', padding: '2px 8px', borderRadius: 6 }}>
                Save {formatCurrency(Math.round((product.price * memberPct) / 100))}
              </span>
            ) : null}
          </div>

          <div className="cb-row" style={{ gap: 8, marginTop: 4 }}>
            <Button
              variant="ghost"
              size="sm"
              icon="Eye"
              style={{ flex: 1 }}
              onClick={() => setDetailOpen(true)}
            >
              Details
            </Button>
            <Button
              icon={out ? 'Ban' : 'ShoppingCart'}
              variant={out ? 'ghost' : 'primary'}
              size="sm"
              style={{ flex: 1.4 }}
              disabled={out}
              onClick={() => onAdd?.(product)}
            >
              {out ? 'Out of Stock' : ctaLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={product.name}
        subtitle={`${product.brand} · ${product.sport} · Ref: ${product.id}`}
        icon="ShoppingBag"
      >
        <div className="cb-stack" style={{ gap: 16 }}>
          <div style={{ height: 240, borderRadius: 14, overflow: 'hidden', background: '#f8fafc', border: '1px solid var(--border)' }}>
            <img src={src} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div>
            <div className="cb-row between" style={{ marginBottom: 8 }}>
              <div className="semibold" style={{ fontSize: '1.3rem', color: '#172b4d' }}>
                {formatCurrency(product.price)}
              </div>
              <Badge tone={out ? 'danger' : 'active'}>
                {out ? 'Out of stock' : `${product.stock} units available`}
              </Badge>
            </div>
            {product.mrp > product.price && (
              <div className="small dim" style={{ marginBottom: 8 }}>
                MRP <span style={{ textDecoration: 'line-through' }}>{formatCurrency(product.mrp)}</span> ({off}% savings)
              </div>
            )}
            <p className="small" style={{ lineHeight: 1.6, color: '#475569' }}>
              {product.description}
            </p>
          </div>

          <div style={{ padding: 14, background: '#ddf5ec', borderRadius: 12, border: '1px solid #a7f3d0' }}>
            <div className="semibold small" style={{ color: '#065f46' }}>ClubBloom Member Perk</div>
            <p className="tiny" style={{ color: '#065f46', marginTop: 2 }}>
              Active club members automatically receive {memberPct}% discount on checkout at the front desk or online.
            </p>
          </div>

          <div className="cb-row" style={{ gap: 10, marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setDetailOpen(false)} style={{ flex: 1 }}>
              Close
            </Button>
            <Button
              variant="primary"
              icon="ShoppingCart"
              style={{ flex: 2 }}
              disabled={out}
              onClick={() => {
                onAdd?.(product);
                setDetailOpen(false);
              }}
            >
              Add to Cart ({formatCurrency(product.price)})
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
