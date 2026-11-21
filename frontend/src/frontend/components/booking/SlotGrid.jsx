import { Badge } from '../ui/primitives';
import Icon from '../ui/Icon';

const STATUS_META = {
  available: { label: 'Available', tone: 'active' },
  booked: { label: 'Booked', tone: 'danger' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
  past: { label: 'Past', tone: 'neutral' },
  held: { label: 'Held', tone: 'warning' },
};

/**
 * 30-minute start-time grid for a single court on a single day.
 * Sessions are always one hour; unavailable slots are clearly marked.
 */
export default function SlotGrid({ slots, value, onSelect, price, peak }) {
  const live = slots.filter((s) => s.status === 'available').length;

  return (
    <div>
      <div className="cb-row between wrap" style={{ marginBottom: 12, gap: 10 }}>
        <div className="cb-row" style={{ gap: 8 }}>
          <Badge tone="active">{live} open</Badge>
          <Badge tone="danger">{slots.filter((s) => s.status === 'booked').length} booked</Badge>
          <Badge tone="warning">{slots.filter((s) => s.status === 'maintenance').length} maintenance</Badge>
        </div>
        <div className="cb-row tiny dim" style={{ gap: 14 }}>
          <span className="cb-row" style={{ gap: 6 }}>
            <Icon name="Flame" size={13} /> Peak {peak}
          </span>
          <span>{'1-hour sessions · 30-min grid'}</span>
        </div>
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 10 }}>
        {slots.map((slot) => {
          const disabled = slot.status !== 'available';
          const meta = STATUS_META[slot.status];
          return (
            <button
              key={slot.start}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(slot)}
              className={`cb-time-slot ${value === slot.start ? 'selected' : ''} ${
                slot.status === 'booked' ? 'booked' : ''
              } ${disabled ? 'disabled' : ''}`}
            >
              <span className="semibold mono">{slot.start}</span>
              <span className="tiny dim">{slot.end}</span>
              <span className="tiny" style={{ marginTop: 4 }}>
                {disabled ? meta.label : `₹${price(slot)}`}
              </span>
              {slot.peak && !disabled ? (
                <span className="tiny" style={{ color: '#fbbf24' }}>• peak</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
