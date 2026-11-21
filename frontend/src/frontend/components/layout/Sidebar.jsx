import { NavLink, Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { customerNav, managerNav, adminNav, staffNav } from '../../data/navigation';
import { useApp } from '../../context/AppContext';

const navByVariant = { customer: customerNav, manager: managerNav, admin: adminNav, staff: staffNav };
const labelByVariant = { customer: 'Member Area', manager: 'Manager Console', admin: 'Administration', staff: 'Staff Operations' };

/**
 * Authenticated sidebar. Renders the customer, manager or admin navigation.
 */
export default function Sidebar({ variant = 'customer', open, onClose }) {
  const { cartTotals, notifications, user, gardenState } = useApp();
  const groups = navByVariant[variant] || customerNav;
  const unread = notifications.filter((n) => !n.read && (n.audience || 'customer') === variant).length;

  return (
    <aside className={`cb-side ${open ? 'open' : ''}`}>
      <div className="cb-side-brand">
        <span className="cb-logo-mark"><Icon name="Flower2" size={18} /></span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700 }}>
            Club<span className="gradient-text">Bloom</span>
          </div>
          <div className="tiny dim">{labelByVariant[variant] || 'Member Area'}</div>
        </div>
      </div>

      {variant === 'customer' ? (
        <div className="cb-card glass" style={{ padding: 14, marginBottom: 12, borderColor: 'rgba(0,163,255,0.3)' }}>
          <div className="cb-row between">
            <div>
              <div className="tiny dim">Tree health</div>
              <div className="semibold small">{gardenState.stage.label}</div>
            </div>
            <span className="badge badge-info">Lv {gardenState.stage.level}</span>
          </div>
          <div className="progress" style={{ marginTop: 10 }}>
            <span style={{ width: `${gardenState.score}%` }} />
          </div>
          <div className="tiny dim" style={{ marginTop: 6 }}>
            {gardenState.statusLabel} · {gardenState.remainingDays}d left
          </div>
        </div>
      ) : null}

      <nav className="cb-stack" style={{ gap: 2, flex: 1 }}>
        {groups.map((g) => (
          <div key={g.group}>
            <div className="cb-side-group">{g.group}</div>
            {g.items.map((item) => {
              const badge =
                item.badgeKey === 'cart' && cartTotals.count ? cartTotals.count : item.badgeKey === 'notifications' && unread ? unread : null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `cb-side-link ${isActive ? 'active' : ''}`}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                  {badge ? <span className="tag">{badge}</span> : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {variant !== 'admin' ? (
        <div className="cb-card glass" style={{ padding: 14, marginTop: 14 }}>
          <div className="cb-row" style={{ gap: 10 }}>
            <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10 }}><Icon name="Bot" size={16} /></span>
            <div>
              <div className="small semibold">Need a hand?</div>
              <div className="tiny dim">Ask ClubBloom AI</div>
            </div>
          </div>
          <Link to={variant === 'manager' ? '/manager/ai' : '/app/ai'} className="btn btn-outline btn-sm btn-block" style={{ marginTop: 12 }} onClick={onClose}>
            Open assistant
          </Link>
        </div>
      ) : null}

      {user ? (
        <div className="tiny dim" style={{ padding: '12px 8px 0' }}>
          Signed in as <span className="semibold" style={{ color: '#cbd5e1' }}>{user.name}</span>
        </div>
      ) : null}
    </aside>
  );
}
