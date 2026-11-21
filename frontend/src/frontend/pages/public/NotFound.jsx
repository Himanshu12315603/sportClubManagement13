import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Button, Card } from '../../components/ui/primitives';

export default function NotFound() {
  return (
    <div className="cb-page cb-container">
      <div className="cb-row center" style={{ minHeight: '56vh' }}>
        <Card glass glow style={{ maxWidth: 560, textAlign: 'center', padding: 44 }}>
          <span className="stat-icon neon" style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 18px' }}>
            <Icon name="AlertTriangle" size={26} />
          </span>
          <h1 style={{ fontSize: '3rem', marginBottom: 6 }} className="gradient-text">404</h1>
          <h3 style={{ marginBottom: 10 }}>This page wandered off the court</h3>
          <p className="small" style={{ marginBottom: 24 }}>
            The page you were looking for does not exist or has been moved. Let us get you back to the club.
          </p>
          <div className="cb-row center wrap" style={{ gap: 12 }}>
            <Button icon="ArrowLeft" as={Link} to="/">Back to home</Button>
            <Button variant="ghost" icon="Map" as={Link} to="/facilities">Explore facilities</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
