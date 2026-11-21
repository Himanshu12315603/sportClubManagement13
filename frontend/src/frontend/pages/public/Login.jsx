import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge } from '../../components/ui/primitives';
import Tree3D from '../../components/clubbloom/Tree3D';
import LoginForm from './auth/LoginForm';

const perks = [
  { icon: 'CalendarDays', text: 'Book courts in seconds — 30-minute slot grid, 1-hour sessions.' },
  { icon: 'Sprout', text: 'Watch your 3D virtual tree grow as you play.' },
  { icon: 'Percent', text: 'Member pricing across courts, the pro shop and the cafe.' },
];

export default function Login() {
  return (
    <div className="cb-auth">
      <div className="cb-auth-panel">
        <div style={{ maxWidth: 440, width: '100%' }}>
          <Badge tone="info" icon="Sparkles">Welcome back</Badge>
          <h2 style={{ margin: '16px 0 8px' }}>Sign in to ClubBloom</h2>
          <p className="small" style={{ marginBottom: 26 }}>
            Access your dashboard, bookings, orders and your living garden.
          </p>
          <LoginForm />
        </div>
      </div>

      <div className="cb-auth-side">
        <div className="cb-row" style={{ gap: 14 }}>
          <Tree3D health={82} growth={0.9} celebrating size={150} />
          <div>
            <h3>Your tree missed you</h3>
            <p className="tiny dim">Sign in to see how much it has grown.</p>
          </div>
        </div>

        <div className="cb-stack" style={{ gap: 16, marginTop: 10 }}>
          {perks.map((p) => (
            <div key={p.text} className="cb-row" style={{ gap: 12, alignItems: 'flex-start' }}>
              <span className="stat-icon" style={{ width: 38, height: 38, borderRadius: 12, flex: 'none' }}><Icon name={p.icon} size={17} /></span>
              <span className="small muted">{p.text}</span>
            </div>
          ))}
        </div>

        <div className="cb-card glass" style={{ marginTop: 14 }}>
          <div className="tiny dim">New to the club?</div>
          <Link to="/register" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 10 }}>
            Create a member account
          </Link>
        </div>
      </div>
    </div>
  );
}
