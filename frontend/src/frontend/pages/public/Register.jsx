import Icon from '../../components/ui/Icon';
import { Badge, Card } from '../../components/ui/primitives';
import Tree3D from '../../components/clubbloom/Tree3D';
import RegisterForm from './auth/RegisterForm';

const benefits = [
  'Instant court bookings with member pricing',
  'A 3D virtual tree that grows with your activity',
  'Shop and cafe ordering straight from your phone',
  'ClubBloom AI to answer any club question',
];

export default function Register() {
  return (
    <div className="cb-auth">
      <div className="cb-auth-panel">
        <div style={{ maxWidth: 460, width: '100%' }}>
          <Badge tone="info" icon="Sparkles">Join ClubBloom</Badge>
          <h2 style={{ margin: '16px 0 8px' }}>Create your account</h2>
          <p className="small" style={{ marginBottom: 26 }}>
            Start your journey today — your first seed is planted the moment you join.
          </p>
          <RegisterForm />
        </div>
      </div>

      <div className="cb-auth-side">
        <div className="cb-row" style={{ gap: 14 }}>
          <Tree3D health={62} growth={0.5} size={160} />
          <div>
            <h3>Plant your tree</h3>
            <p className="tiny dim">Every session you play helps it grow.</p>
          </div>
        </div>

        <div className="cb-stack" style={{ gap: 12 }}>
          {benefits.map((b) => (
            <div key={b} className="cb-row small" style={{ gap: 10, alignItems: 'flex-start' }}>
              <Icon name="CheckCircle2" size={16} style={{ color: '#4ade80', marginTop: 3, flex: 'none' }} />
              <span className="muted">{b}</span>
            </div>
          ))}
        </div>

        <Card glass style={{ marginTop: 14 }}>
          <div className="cb-row" style={{ gap: 10 }}>
            <span className="stat-icon gold" style={{ width: 36, height: 36, borderRadius: 11 }}><Icon name="Gift" size={16} /></span>
            <div>
              <div className="small semibold">Prefer a trial first?</div>
              <div className="tiny dim">Try 14 days free — no card required.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
