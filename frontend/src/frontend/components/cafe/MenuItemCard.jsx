import { Badge, Button } from '../ui/primitives';
import Icon from '../ui/Icon';
import { formatCurrency } from '../../utils/format';
import { fallbackCafe } from '../../utils/images';
import { useImage } from '../../hooks/useImage';

/** Cafeteria menu tile with veg marker, prep time and rating. */
export default function MenuItemCard({ item, memberPct = 0, onAdd }) {
  const { src } = useImage(item.image, fallbackCafe(item.id, item.category));

  return (
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
      <div className="product-thumb" style={{ position: 'relative', borderRadius: 0, height: 180, background: '#f8fafc' }}>
        <img src={src} alt={item.name} loading="lazy" style={{ objectFit: 'cover' }} />
        <span style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge tone={item.veg ? 'active' : 'danger'}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: 2,
                border: `2px solid ${item.veg ? '#16a085' : '#ef4444'}`,
                background: item.veg ? '#16a085' : '#ef4444',
                marginRight: 6,
              }}
            />
            {item.veg ? 'Veg' : 'Non-veg'}
          </Badge>
        </span>
      </div>

      <div className="cb-stack" style={{ padding: 16, gap: 10, flex: 1 }}>
        <div className="cb-row between">
          <span className="tiny dim cb-row" style={{ gap: 5 }}>
            <Icon name="Timer" size={13} style={{ color: '#16a085' }} /> {item.prepMins} min prep
          </span>
          <span className="tiny cb-row" style={{ gap: 4, color: '#f59e0b', fontWeight: 600 }}>
            <Icon name="Star" size={13} />
            {item.rating}
          </span>
        </div>

        <h4 style={{ fontSize: '1.02rem', color: '#172b4d', margin: 0 }}>{item.name}</h4>
        <p className="tiny dim" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>

        <div className="cb-row between" style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
          <div className="semibold" style={{ fontSize: '1.1rem', color: '#172b4d' }}>{formatCurrency(item.price)}</div>
          {memberPct ? (
            <span className="tiny semibold" style={{ color: '#16a085', background: '#ddf5ec', padding: '2px 8px', borderRadius: 6 }}>
              {memberPct}% member off
            </span>
          ) : null}
        </div>

        <Button
          icon="Plus"
          size="sm"
          variant="primary"
          block
          onClick={() => onAdd?.(item)}
        >
          Add to Order
        </Button>
      </div>
    </div>
  );
}
