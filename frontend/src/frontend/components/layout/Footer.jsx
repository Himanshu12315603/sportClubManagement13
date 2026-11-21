import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { Button } from '../ui/primitives';

const columns = [
  {
    title: 'Explore Facilities',
    links: [
      { label: 'Tennis Courts (Clay & Synthetic)', to: '/facilities' },
      { label: 'Badminton Indoor Arena', to: '/facilities' },
      { label: 'Cricket Turf & Practice Nets', to: '/facilities' },
      { label: 'Padel Glass Championship Court', to: '/facilities' },
      { label: 'Olympic Swimming Pool', to: '/facilities' },
      { label: 'CrossFit Studio & Gym', to: '/facilities' },
    ],
  },
  {
    title: 'Membership & Club',
    links: [
      { label: 'Membership Plans & Pricing', to: '/membership' },
      { label: 'Book a Complimentary Trial', to: '/trial' },
      { label: 'Pro Sports Shop', to: '/shop' },
      { label: 'Cafeteria & Lounge', to: '/cafeteria' },
      { label: 'About ClubBloom', to: '/about' },
    ],
  },
  {
    title: 'Portals & Access',
    links: [
      { label: 'Member Dashboard', to: '/app/dashboard' },
      { label: 'Court Booking Calendar', to: '/app/bookings' },
      { label: 'Virtual Tree Garden', to: '/app/garden' },
      { label: 'Manager Operations Console', to: '/manager/overview' },
      { label: 'Staff Front Desk', to: '/staff/bookings' },
      { label: 'Admin Governance Console', to: '/admin/overview' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        marginTop: 64,
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 -4px 20px -2px rgba(23, 43, 77, 0.03)',
      }}
    >
      {/* Top emerald accent brand bar */}
      <div
        style={{
          height: 3,
          background: 'linear-gradient(90deg, #16a085 0%, #10b981 50%, #ddf5ec 100%)',
          width: '100%',
        }}
      />

      <div className="cb-container" style={{ padding: '60px 24px 36px' }}>
        <div
          className="cb-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 40,
            marginBottom: 44,
          }}
        >
          {/* Brand & Description */}
          <div>
            <div className="cb-logo" style={{ marginBottom: 16 }}>
              <span className="cb-logo-mark" style={{ width: 40, height: 40, borderRadius: 12 }}>
                <Icon name="Flower2" size={22} />
              </span>
              <span style={{ fontSize: '1.3rem', color: '#172b4d' }}>
                Club<span className="gradient-text">Bloom</span>
              </span>
            </div>
            <p style={{ maxWidth: 300, lineHeight: 1.65, color: '#475569', fontSize: '0.88rem', margin: '0 0 20px' }}>
              The modern sports club management SaaS. Streamlining court reservations, athlete progress, hospitality, and member intelligence in one connected platform.
            </p>
            <div className="cb-row" style={{ gap: 10 }}>
              {[
                { name: 'Instagram', icon: 'Instagram' },
                { name: 'Twitter', icon: 'Twitter' },
                { name: 'Facebook', icon: 'Facebook' },
                { name: 'Youtube', icon: 'Youtube' },
              ].map((s) => (
                <span
                  key={s.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'all 0.18s ease',
                  }}
                  title={s.name}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#16a085';
                    e.currentTarget.style.color = '#16a085';
                    e.currentTarget.style.background = '#ddf5ec';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <Icon name={s.icon} size={16} />
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {columns.map((c) => (
            <div key={c.title}>
              <h4 style={{ marginBottom: 18, fontSize: '0.96rem', fontWeight: 700, color: '#172b4d', letterSpacing: '-0.2px' }}>
                {c.title}
              </h4>
              <ul className="cb-stack" style={{ gap: 11 }}>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      style={{
                        fontSize: '0.88rem',
                        color: '#475569',
                        textDecoration: 'none',
                        transition: 'color 0.18s ease',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#16a085')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Details */}
          <div>
            <h4 style={{ marginBottom: 18, fontSize: '0.96rem', fontWeight: 700, color: '#172b4d', letterSpacing: '-0.2px' }}>
              Visit & Contact
            </h4>
            <ul className="cb-stack" style={{ gap: 14 }}>
              <li className="cb-row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#ddf5ec',
                    color: '#16a085',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                    marginTop: 2,
                  }}
                >
                  <Icon name="MapPin" size={16} />
                </span>
                <span style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                  ClubBloom Sports Arena, Whitefield Main Road, Bengaluru 560066
                </span>
              </li>
              <li className="cb-row" style={{ gap: 12 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#ddf5ec',
                    color: '#16a085',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon name="Phone" size={16} />
                </span>
                <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                  +91 80 4000 2200
                </span>
              </li>
              <li className="cb-row" style={{ gap: 12 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#ddf5ec',
                    color: '#16a085',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon name="Mail" size={16} />
                </span>
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>
                  hello@clubbloom.in
                </span>
              </li>
              <li className="cb-row" style={{ gap: 12 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#ddf5ec',
                    color: '#16a085',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon name="Clock" size={16} />
                </span>
                <span style={{ fontSize: '0.88rem', color: '#475569' }}>
                  Open 05:00 – 23:00 Daily
                </span>
              </li>
            </ul>

            <Button
              size="sm"
              variant="outline"
              icon="Sparkles"
              as={Link}
              to="/trial"
              style={{
                marginTop: 20,
                width: '100%',
                justifyContent: 'center',
                borderColor: '#16a085',
                color: '#16a085',
              }}
            >
              Book a Free Trial Session
            </Button>
          </div>
        </div>

        <hr style={{ border: 'none', height: 1, background: '#e2e8f0', margin: '28px 0 24px' }} />

        <div
          className="cb-row between wrap"
          style={{
            fontSize: '0.84rem',
            color: '#64748b',
            gap: 14,
          }}
        >
          <span>
            © {new Date().getFullYear()} ClubBloom – Smart Sports Club Management System. All rights reserved.
          </span>
          <div className="cb-row" style={{ gap: 24 }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Member Handbook</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Court Regulations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
