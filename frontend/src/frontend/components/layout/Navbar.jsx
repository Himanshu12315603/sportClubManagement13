import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import { Avatar, Button } from '../ui/primitives';
import { roleHome } from '../../data/navigation';
import { useApp } from '../../context/AppContext';

const publicNavWithIcons = [
  { to: '/', label: 'Home', icon: 'Home' },
  { to: '/facilities', label: 'Facilities', icon: 'Building2' },
  { to: '/membership', label: 'Membership', icon: 'Crown' },
  { to: '/shop', label: 'Shop', icon: 'ShoppingBag' },
  { to: '/cafeteria', label: 'Cafeteria', icon: 'Coffee' },
  { to: '/about', label: 'About', icon: 'Info' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, role, notifications } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);

  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0;

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    if (userDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdown]);

  // Close menus on navigation
  useEffect(() => {
    setOpen(false);
    setUserDropdown(false);
  }, [pathname]);

  const dashboardPath = roleHome[role] || '/app/dashboard';

  return (
    <>
      <header
        className="cb-nav"
        style={{
          boxShadow: scrolled ? '0 4px 20px -2px rgba(23, 43, 77, 0.08)' : 'none',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        <div className="cb-container cb-nav-inner">
          <Link to="/" className="cb-logo" onClick={() => setOpen(false)}>
            <span className="cb-logo-mark">
              <Icon name="Flower2" size={20} />
            </span>
            <span>
              Club<span className="gradient-text">Bloom</span>
            </span>
          </Link>

          <nav className="cb-nav-links">
            {publicNavWithIcons.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `cb-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon name={l.icon} size={15} style={{ opacity: 0.85 }} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="spacer" />

          <div className="cb-row" style={{ gap: 10 }}>
            {user ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div className="cb-row" style={{ gap: 8 }}>
                  <button
                    className="cb-row"
                    onClick={() => setUserDropdown((v) => !v)}
                    style={{
                      background: 'rgba(221, 245, 236, 0.5)',
                      border: '1px solid rgba(22, 160, 133, 0.3)',
                      borderRadius: 24,
                      padding: '4px 12px 4px 5px',
                      cursor: 'pointer',
                      gap: 8,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Avatar name={user?.name} seed={user?.avatarSeed} size={30} />
                    <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="hide-sm">
                      <div className="semibold small" style={{ color: '#172b4d' }}>
                        {user?.name?.split(' ')[0] || 'User'}
                      </div>
                      <div className="tiny" style={{ color: '#16a085', fontWeight: 600 }}>
                        {role === 'customer' ? 'Member' : role === 'manager' ? 'Manager' : role === 'staff' ? 'Staff' : 'Admin'}
                      </div>
                    </div>
                    <Icon name="ChevronDown" size={14} style={{ color: '#64748b' }} />
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon="LayoutDashboard"
                    onClick={() => navigate(dashboardPath)}
                  >
                    Dashboard
                  </Button>
                </div>

                <AnimatePresence>
                  {userDropdown ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="cb-card"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 48,
                        width: 240,
                        zIndex: 1300,
                        padding: 12,
                        boxShadow: '0 12px 30px -4px rgba(23, 43, 77, 0.14)',
                      }}
                    >
                      <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                        <div className="semibold small">{user?.name}</div>
                        <div className="tiny dim">{user?.email || user?.title}</div>
                      </div>

                      <button
                        className="cb-side-link"
                        style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => {
                          setUserDropdown(false);
                          navigate(dashboardPath);
                        }}
                      >
                        <Icon name="LayoutDashboard" size={16} />
                        <span>Open Dashboard</span>
                      </button>

                      {role === 'customer' && (
                        <button
                          className="cb-side-link"
                          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                          onClick={() => {
                            setUserDropdown(false);
                            navigate('/app/bookings');
                          }}
                        >
                          <Icon name="CalendarDays" size={16} />
                          <span>My Court Bookings</span>
                        </button>
                      )}

                      <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

                      <button
                        className="cb-side-link"
                        style={{
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}
                        onClick={() => {
                          setUserDropdown(false);
                          logout();
                          navigate('/');
                        }}
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" as={Link} to="/login">
                  Login
                </Button>
                <Button size="sm" icon="Sparkles" as={Link} to="/register">
                  Join Now
                </Button>
              </>
            )}

            <button
              className="btn btn-ghost btn-icon cb-burger"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <Icon name={open ? 'X' : 'Menu'} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {open ? (
            <motion.div
              className="cb-mobile-links"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {publicNavWithIcons.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) => `cb-side-link ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon name={l.icon} size={16} />
                  <span>{l.label}</span>
                </NavLink>
              ))}

              <div className="cb-row wrap" style={{ marginTop: 12, gap: 10 }}>
                <Button
                  variant="outline"
                  size="sm"
                  as={Link}
                  to="/trial"
                  onClick={() => setOpen(false)}
                  style={{ flex: 1 }}
                >
                  Book a Trial
                </Button>
                {!user ? (
                  <Button
                    size="sm"
                    as={Link}
                    to="/login"
                    onClick={() => setOpen(false)}
                    style={{ flex: 1 }}
                  >
                    Login
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      navigate(dashboardPath);
                    }}
                    style={{ flex: 1 }}
                  >
                    My Dashboard
                  </Button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      {/* Mobile Backdrop to click-close */}
      {open ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 43, 77, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1150,
          }}
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
