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
              <>
                <Button variant="outline" size="sm" icon="LayoutDashboard" onClick={() => navigate(roleHome[role] || '/app/dashboard')}>
                  {role === 'customer' ? 'My Dashboard' : role === 'manager' ? 'Manager' : 'Admin'}
                </Button>
                <Button variant="ghost" size="sm" icon="LogOut" onClick={() => { logout(); navigate('/'); }}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" as={Link} to="/login">Login</Button>
                <Button size="sm" icon="Sparkles" as={Link} to="/register">Join Now</Button>
              </>
            )}
            <button className="btn btn-ghost btn-icon cb-burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
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
