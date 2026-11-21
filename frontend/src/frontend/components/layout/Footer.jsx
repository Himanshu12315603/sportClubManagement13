import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { Button } from '../ui/primitives';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Facilities', to: '/facilities' },
      { label: 'Membership Plans', to: '/membership' },
      { label: 'Sports Shop', to: '/shop' },
      { label: 'About Club', to: '/about' },
    ],
  },
  {
    title: 'Members',
    links: [
      { label: 'Book a Trial', to: '/trial' },
      { label: 'Login', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'Customer Dashboard', to: '/app/dashboard' },
      { label: 'Manager Dashboard', to: '/manager/overview' },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'rgba(8,11,18,0.7)', marginTop: 40 }}>
      <div className="cb-container" style={{ padding: '56px 22px 28px' }}>
        <div className="cb-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 34 }}>
          <div>
            <div className="cb-logo" style={{ marginBottom: 14 }}>
              <span className="cb-logo-mark"><Icon name="Flower2" size={20} /></span>
              <span>Club<span className="gradient-text">Bloom</span></span>
            </div>
            <p className="small" style={{ maxWidth: 300 }}>
              Play. Grow. Connect. A smarter sports club where every match, every membership and every moment grows into
              something extraordinary.
            </p>
            <div className="cb-row" style={{ gap: 8, marginTop: 18 }}>
              {['Instagram', 'Twitter', 'Facebook', 'Youtube'].map((s) => (
                <span key={s} className="stat-icon" style={{ width: 36, height: 36, borderRadius: 11, cursor: 'pointer' }}>
                  <Icon name={s} size={16} />
                </span>
              ))}
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <h4 style={{ marginBottom: 14 }}>{c.title}</h4>
              <ul className="cb-stack" style={{ gap: 9 }}>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="small muted" style={{ transition: 'color .2s' }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 style={{ marginBottom: 14 }}>Visit us</h4>
            <ul className="cb-stack" style={{ gap: 11 }}>
              <li className="cb-row small muted" style={{ gap: 9, alignItems: 'flex-start' }}>
                <Icon name="MapPin" size={15} /> ClubBloom Sports Club, Whitefield, Bengaluru 560066
              </li>
              <li className="cb-row small muted" style={{ gap: 9 }}><Icon name="Phone" size={15} /> +91 80 4000 2200</li>
              <li className="cb-row small muted" style={{ gap: 9 }}><Icon name="Mail" size={15} /> hello@clubbloom.in</li>
              <li className="cb-row small muted" style={{ gap: 9 }}><Icon name="Clock" size={15} /> Open 05:00 – 23:00 daily</li>
            </ul>
            <Button size="sm" icon="Sparkles" as={Link} to="/trial" style={{ marginTop: 16 }}>Book a free trial</Button>
          </div>
        </div>

        <hr className="cb-hairline" />
        <div className="cb-row between wrap tiny dim">
          <span>© {new Date().getFullYear()} ClubBloom. Demo front-end for a national-level hackathon build.</span>
          <span className="cb-row" style={{ gap: 16 }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Member Handbook</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
