import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import { Avatar, IconButton } from '../ui/primitives';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import { customerNav, managerNav, adminNav, roleHome } from '../../data/navigation';
import { useApp } from '../../context/AppContext';
import { notificationKinds } from '../../data/notifications';

const navByVariant = { customer: customerNav, manager: managerNav, admin: adminNav };
const toneToIcon = { success: 'CheckCircle2', warning: 'AlertTriangle', danger: 'AlertTriangle', info: 'Info' };

function useTitle(variant, pathname) {
  return useMemo(() => {
    const groups = navByVariant[variant] || [];
    for (const g of groups) {
      const hit = g.items.find((i) => i.to === pathname);
      if (hit) return { label: hit.label, group: g.group, icon: hit.icon };
    }
    return { label: 'Dashboard', group: '', icon: 'LayoutDashboard' };
  }, [variant, pathname]);
}

export default function DashboardLayout({ variant = 'customer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, notifications, markNotificationRead, markAllNotificationsRead, quickLogin } = useApp();
  const title = useTitle(variant, pathname);

  const inbox = notifications.filter((n) => (n.audience || 'customer') === variant);
  const unread = inbox.filter((n) => !n.read).length;

  const sessions = [
    { role: 'customer', label: 'Member area', icon: 'Sprout' },
    { role: 'manager', label: 'Manager console', icon: 'Briefcase' },
    { role: 'admin', label: 'Administration', icon: 'ShieldCheck' },
  ];

  return (
    <div className="cb-shell">
      {variant === 'admin' ? (
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : (
        <Sidebar variant={variant} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      {sidebarOpen ? <div className="cb-mobile-scrim" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="cb-main">
        <header className="cb-topbar">
          <button className="btn btn-ghost btn-icon cb-burger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar" style={{ display: 'inline-flex' }}>
            <Icon name="Menu" size={18} />
          </button>

          <div className="cb-row" style={{ gap: 10 }}>
            <span className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10 }}><Icon name={title.icon} size={16} /></span>
            <div>
              <div className="semibold" style={{ lineHeight: 1.15 }}>{title.label}</div>
              <div className="tiny dim">{title.group || 'ClubBloom'}</div>
            </div>
          </div>

          <div className="spacer" />

          <div className="cb-row" style={{ gap: 8, position: 'relative' }}>
            <IconButton icon="Bell" label="Notifications" variant="ghost" onClick={() => { setNotifOpen((o) => !o); setMenuOpen(false); }} />
            {unread ? <span className="notif-dot">{unread}</span> : null}

            <div style={{ position: 'relative' }}>
              <button className="cb-row" onClick={() => { setMenuOpen((o) => !o); setNotifOpen(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', gap: 10 }}>
                <Avatar name={user?.name} seed={user?.avatarSeed} />
                <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="hide-sm">
                  <div className="semibold small">{user?.name || 'Guest'}</div>
                  <div className="tiny dim">{user?.title || 'Signed out'}</div>
                </div>
                <Icon name="ChevronDown" size={15} />
              </button>

              <AnimatePresence>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="cb-card"
                    style={{ position: 'absolute', right: 0, top: 50, width: 250, zIndex: 1300, padding: 12 }}
                  >
                    <div className="tiny dim" style={{ padding: '4px 8px 8px' }}>Switch demo role</div>
                    {sessions.map((s) => (
                      <button
                        key={s.role}
                        className="cb-side-link"
                        style={{ width: '100%', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                        onClick={() => { quickLogin(s.role); setMenuOpen(false); navigate(roleHome[s.role]); }}
                      >
                        <Icon name={s.icon} size={16} /> {s.label}
                        {user?.role === s.role ? <span className="tag" style={{ background: 'rgba(0,163,255,0.2)', color: '#7dd3fc' }}>current</span> : null}
                      </button>
                    ))}
                    <hr className="cb-hairline" style={{ margin: '10px 0' }} />
                    {variant !== 'admin' ? (
                      <Link className="cb-side-link" to={variant === 'manager' ? '/manager/ai' : '/app/ai'} onClick={() => setMenuOpen(false)}>
                        <Icon name="Sparkles" size={16} /> ClubBloom AI
                      </Link>
                    ) : (
                      <Link className="cb-side-link" to="/admin/settings" onClick={() => setMenuOpen(false)}>
                        <Icon name="Settings" size={16} /> System settings
                      </Link>
                    )}
                    <Link className="cb-side-link" to={variant === 'manager' ? '/manager/finance' : variant === 'admin' ? '/admin/reports' : '/app/profile'} onClick={() => setMenuOpen(false)}>
                      <Icon name={variant === 'customer' ? 'User' : 'Wallet'} size={16} /> {variant === 'customer' ? 'My profile' : 'Reports'}
                    </Link>
                    <button className="cb-side-link" style={{ width: '100%', background: 'transparent', cursor: 'pointer', textAlign: 'left' }} onClick={() => { logout(); navigate('/'); }}>
                      <Icon name="LogOut" size={16} /> Sign out
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {notifOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="cb-card"
                  style={{ position: 'absolute', right: 0, top: 50, width: 350, zIndex: 1300, padding: 14 }}
                >
                  <div className="cb-row between" style={{ marginBottom: 10 }}>
                    <h4>Notifications</h4>
                    {unread ? (
                      <button className="btn btn-ghost btn-sm" onClick={markAllNotificationsRead}>Mark all read</button>
                    ) : null}
                  </div>
                  <div className="cb-stack" style={{ gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                    {inbox.length === 0 ? (
                      <p className="small dim">You are all caught up.</p>
                    ) : (
                      inbox.slice(0, 6).map((n) => {
                        const meta = notificationKinds[n.kind] || {};
                        return (
                          <div
                            key={n.id}
                            className="cb-row"
                            style={{ gap: 10, alignItems: 'flex-start', padding: '10px 10px', borderRadius: 12, background: n.read ? 'transparent' : 'rgba(0,163,255,0.07)', border: `1px solid ${n.read ? 'transparent' : 'rgba(0,163,255,0.22)'}`, cursor: 'pointer' }}
                            onClick={() => markNotificationRead(n.id)}
                          >
                            <span className={`stat-icon ${n.tone === 'danger' ? 'neon' : n.tone === 'warning' ? 'gold' : n.tone === 'success' ? 'green' : ''}`} style={{ width: 30, height: 30, borderRadius: 9 }}>
                              <Icon name={n.icon || toneToIcon[meta.tone] || 'Bell'} size={14} />
                            </span>
                            <div style={{ flex: 1 }}>
                              <div className="tiny semibold">{n.title || meta.title}</div>
                              <div className="tiny dim">{n.message}</div>
                            </div>
                            {!n.read ? <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--neon)', marginTop: 6 }} /> : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <Link
                    to={variant === 'manager' ? '/manager/overview' : variant === 'admin' ? '/admin/notifications' : '/app/notifications'}
                    className="btn btn-ghost btn-sm btn-block"
                    style={{ marginTop: 12 }}
                    onClick={() => setNotifOpen(false)}
                  >
                    View notification centre
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </header>

        <main className="cb-content">
          <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
