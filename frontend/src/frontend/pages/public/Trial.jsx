import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card } from '../../components/ui/primitives';
import Tree3D from '../../components/clubbloom/Tree3D';
import TrialForm from './auth/TrialForm';

const highlights = [
  { icon: 'Users', title: 'Two sports of your choice', text: 'Pick any two facilities and play two sessions in each.' },
  { icon: 'Map', title: 'Guided facility tour', text: 'A coach walks you through courts, studio, shop and cafe.' },
  { icon: 'Sparkles', title: 'Full app preview', text: 'Try booking, ordering and the virtual garden before you join.' },
];

export default function Trial() {
  return (
    <div className="cb-page cb-container">
      <div className="cb-row between wrap" style={{ gap: 16, marginBottom: 24 }}>
        <div>
          <Badge tone="info" icon="Gift">14-day free trial</Badge>
          <h2 style={{ margin: '14px 0 6px' }}>Book your free ClubBloom trial</h2>
          <p className="small">Tell us what you would like to play and pick a time that suits you.</p>
        </div>
        <Button variant="ghost" icon="ArrowLeft" as={Link} to="/">Back to home</Button>
      </div>

      <div className="cb-grid cols-2" style={{ alignItems: 'start', gap: 26 }}>
        <Card glass>
          <TrialForm />
        </Card>

        <div className="cb-stack">
          <Card glass>
            <h4 style={{ marginBottom: 14 }}>What&apos;s included</h4>
            <div className="cb-stack" style={{ gap: 14 }}>
              {highlights.map((h) => (
                <div key={h.title} className="cb-row" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <span className="stat-icon" style={{ width: 38, height: 38, borderRadius: 12, flex: 'none' }}><Icon name={h.icon} size={17} /></span>
                  <div>
                    <div className="small semibold">{h.title}</div>
                    <div className="tiny dim">{h.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card glass style={{ textAlign: 'center' }}>
            <div className="cb-row center" style={{ marginBottom: 12 }}>
              <Tree3D health={46} growth={0.35} size={190} />
            </div>
            <h4 style={{ marginBottom: 6 }}>Meet your new tree</h4>
            <p className="tiny">
              Every trial member starts with a young sapling in the garden. Upgrade after your trial and watch it grow
              into a fully grown 3D tree.
            </p>
            <Button variant="outline" block icon="Crown" as={Link} to="/membership" style={{ marginTop: 16 }}>
              Compare membership plans
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
