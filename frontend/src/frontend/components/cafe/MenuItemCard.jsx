import { Badge, Button } from '../ui/primitives';
import Icon from '../ui/Icon';
import { formatCurrency } from '../../utils/format';
import { fallbackCafe } from '../../utils/images';
import { useImage } from '../../hooks/useImage';

/** Cafeteria menu tile with veg marker, prep time and rating. */
export default function MenuItemCard({ item, memberPct = 0, onAdd }) {
  const { src } = useImage(item.image, fallbackCafe(item.id, item.category));
  return (
    <div className="cb-card glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="product-thumb" style={{ position: 'relative', borderRadius: '14px 14px 0 0' }}>
        <img src={src} alt={item.name} loading="lazy" />
        <span style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge tone={item.veg ? 'active' : 'danger'}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: 2,
                border: `2px solid ${item.veg ? '#22c55e' : '#ff1744'}`,
                marginRight: 6,
              }}
            />
            {item.veg ? 'Veg' : 'Non-veg'}
          </Badge>
        </span>
      </div>
      <div className="cb-stack" style={{ padding: 16, gap: 8, flex: 1 }}>
        <div className="cb-row between">
          <span className="tiny dim cb-row" style={{ gap: 4 }}>
            <Icon name="Timer" size={12} /> {item.prepMins} min
          </span>
          <span className="tiny cb-row" style={{ gap: 4 }}>
            <Icon name="Star" size={12} className="text-warning" />
            {item.rating}
          </span>
        </div>
        <h4 style={{ fontSize: '1rem' }}>{item.name}</h4>
        <p className="tiny dim">{item.description}</p>
        <div className="cb-row between" style={{ marginTop: 'auto', paddingTop: 8 }}>
          <div className="semibold">{formatCurrency(item.price)}</div>
          {memberPct ? <span className="tiny text-success semibold">{memberPct}% off</span> : null}
        </div>
        <Button icon="Plus" size="sm" block onClick={() => onAdd?.(item)}>
          Add to order
        </Button>
      </div>
    </div>
  );
}
