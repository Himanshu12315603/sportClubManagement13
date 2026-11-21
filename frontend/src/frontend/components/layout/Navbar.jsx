import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../ui/Icon';
import { Button } from '../ui/primitives';
import { publicNav, roleHome } from '../../data/navigation';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, role } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = publicNav;

  return (
    <header className="cb-nav">
      <div className="cb-container cb-nav-inner">
        <Link to="/" className="cb-logo" onClick={() => setOpen(false)}>
          <span className="cb-logo-mark"><Icon name="Flower2" size={20} /></span>
          <span>
            Club<span className="gradient-text">Bloom</span>
          </span>
        </Link>

        <nav className="cb-nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `cb-nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
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

      {open ? (
        <motion.div className="cb-mobile-links" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={`cb-side-link ${pathname === l.to ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="cb-row wrap" style={{ marginTop: 8 }}>
            <Button variant="outline" size="sm" as={Link} to="/trial" onClick={() => setOpen(false)}>Book a Trial</Button>
            {!user ? <Button size="sm" as={Link} to="/login" onClick={() => setOpen(false)}>Login</Button> : null}
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
