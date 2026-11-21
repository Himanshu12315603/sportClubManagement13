import { Badge } from '../ui/primitives';
import Icon from '../ui/Icon';

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    badgeTone: 'active',
    style: {
      background: '#ddf5ec',
      borderColor: '#a7f3d0',
      color: '#065f46',
    },
    actionLabel: 'Book Now',
  },
  confirmed: {
    label: 'Confirmed',
    badgeTone: 'info',
    style: {
      background: '#dbeafe',
      borderColor: '#93c5fd',
      color: '#1e40af',
    },
    actionLabel: 'Reserved',
  },
  booked: {
    label: 'Booked',
    badgeTone: 'danger',
    style: {
      background: '#fee2e2',
      borderColor: '#fca5a5',
      color: '#991b1b',
    },
    actionLabel: 'Booked',
  },
  pending: {
    label: 'Pending',
    badgeTone: 'warning',
    style: {
      background: '#fef3c7',
      borderColor: '#fcd34d',
      color: '#92400e',
    },
    actionLabel: 'Pending',
  },
  cancelled: {
    label: 'Cancelled',
    badgeTone: 'neutral',
    style: {
      background: '#f1f5f9',
      borderColor: '#cbd5e1',
      color: '#64748b',
    },
    actionLabel: 'Cancelled',
  },
  maintenance: {
    label: 'Maintenance',
    badgeTone: 'warning',
    style: {
      background: '#fef3c7',
      borderColor: '#fcd34d',
      color: '#92400e',
    },
    actionLabel: 'Blocked',
  },
  past: {
    label: 'Past',
    badgeTone: 'neutral',
    style: {
      background: '#f1f5f9',
      borderColor: '#e2e8f0',
      color: '#94a3b8',
    },
    actionLabel: 'Past',
  },
};

/**
 * Modern 30-minute start-time grid with 60-minute sessions.
 * Color-coded slot cards with time range, status, price, and Book Now action.
 */
export default function SlotGrid({ slots, value, onSelect, price, peak }) {
  const live = slots.filter((s) => s.status === 'available').length;
  const bookedCount = slots.filter((s) => s.status === 'booked' || s.status === 'confirmed').length;
  const maintCount = slots.filter((s) => s.status === 'maintenance').length;

  return (
    <div>
      <div className="cb-row between wrap" style={{ marginBottom: 16, gap: 12 }}>
        <div className="cb-row wrap" style={{ gap: 8 }}>
          <Badge tone="active">{live} Available</Badge>
          <Badge tone="danger">{bookedCount} Booked</Badge>
          {maintCount > 0 && <Badge tone="warning">{maintCount} Maintenance</Badge>}
        </div>
        <div className="cb-row tiny dim" style={{ gap: 14 }}>
          <span className="cb-row" style={{ gap: 5, color: '#d97706', fontWeight: 600 }}>
            <Icon name="Flame" size={13} /> Peak {peak}
          </span>
          <span>1-hour sessions · 30-min start grid</span>
        </div>
      </div>

      <div
        className="cb-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 12,
        }}
      >
        {slots.map((slot) => {
          const isAvail = slot.status === 'available';
          const isSelected = value === slot.start;
          const config = STATUS_CONFIG[slot.status] || STATUS_CONFIG.past;
          const slotPrice = price ? price(slot) : 0;

          return (
            <div
              key={slot.start}
              onClick={() => {
                if (isAvail) onSelect(slot);
              }}
              style={{
                borderRadius: 14,
                border: isSelected ? '2px solid #16a085' : `1.5px solid ${config.style.borderColor}`,
                background: isSelected ? '#16a085' : config.style.background,
                color: isSelected ? '#ffffff' : config.style.color,
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: isAvail ? 'pointer' : 'not-allowed',
                opacity: isAvail ? 1 : 0.78,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected
                  ? '0 8px 24px -2px rgba(22, 160, 133, 0.35)'
                  : '0 2px 6px rgba(23, 43, 77, 0.04)',
                transform: isSelected ? 'scale(1.02)' : 'none',
              }}
            >
              {/* Time Range */}
              <div
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  letterSpacing: '-0.3px',
                }}
              >
                {slot.start}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  opacity: 0.82,
                  marginBottom: 6,
                }}
              >
                until {slot.end}
              </div>

              {/* Status Badge / Indicator */}
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: isSelected
                    ? 'rgba(255, 255, 255, 0.25)'
                    : isAvail
                    ? '#a7f3d0'
                    : 'rgba(0, 0, 0, 0.06)',
                  color: isSelected ? '#ffffff' : config.style.color,
                  marginBottom: 6,
                }}
              >
                {isSelected ? 'Selected' : config.label}
              </div>

              {/* Price & Peak */}
              <div style={{ marginTop: 'auto', width: '100%' }}>
                {isAvail ? (
                  <div
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: isSelected ? '#ffffff' : '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>₹{slotPrice}</span>
                    {slot.peak && (
                      <span
                        title="Peak pricing applies"
                        style={{
                          fontSize: '0.65rem',
                          background: isSelected ? 'rgba(255, 255, 255, 0.3)' : '#fef3c7',
                          color: isSelected ? '#ffffff' : '#b45309',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        peak
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                    {config.actionLabel}
                  </div>
                )}

                {/* Interactive Action Button for Available Slots */}
                {isAvail && (
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      marginTop: 8,
                      padding: '5px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: isSelected ? '#ffffff' : '#16a085',
                      color: isSelected ? '#065f46' : '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ Chosen' : 'Book Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
