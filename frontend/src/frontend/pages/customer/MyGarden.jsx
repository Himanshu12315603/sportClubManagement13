import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PLANT_STAGES } from '../../utils/membership';
import Garden from '../../components/clubbloom/Garden';
import GardenStatus from '../../components/clubbloom/GardenStatus';
import { Badge, Button, Card, CardTitle, PageHeader } from '../../components/ui/primitives';

/**
 * Signature feature page — the living 3D virtual tree.
 * All state is derived deterministically from membership + real club activity.
 */
export default function MyGarden() {
  const { gardenState, membership } = useApp();

  const nextStage = PLANT_STAGES.find((s) => s.min > gardenState.score) || null;
  const dead = !gardenState.alive;

  return (
    <>
      <PageHeader
        icon="Sprout"
        title="My Virtual Tree"
        subtitle="Your 3D tree grows from real club activity — and dies down gradually as your membership runs out."
        badge={<Badge tone={gardenState.tone.replace('badge-', '')}>{gardenState.statusLabel}</Badge>}
        actions={
          <Button variant="outline" icon="RefreshCw" as={Link} to="/app/membership">
            Manage membership
          </Button>
        }
      />

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 22 }}>
        <div className="cb-stack">
          <Card glass glow className="cb-garden-card" style={{ padding: 0, overflow: 'hidden' }}>
            <Garden state={gardenState} />
          </Card>

          <Card glass>
            <CardTitle
              icon="Sparkles"
              title="What your tree is telling you"
              hint="Every number here has a visible source"
            />
            <p className="small">
              {dead
                ? 'Your membership has lapsed. The tree is withering through a gradual transition — the leaves fade and fall first, then only the bare branches remain. Renew to restore health and replay the growth animation.'
                : gardenState.celebration
                  ? 'Your tree is thriving — celebrate. Keep the streak alive to hold the Magical Tree stage.'
                  : 'Keep booking sessions, visiting the cafeteria and shopping at the pro shop to grow your tree to the next stage. As your membership nears its end, the tree gradually dies back.'}
            </p>
            <div className="cb-row wrap" style={{ gap: 10, marginTop: 16 }}>
              <Button icon="CalendarPlus" as={Link} to="/app/bookings">Book a session</Button>
              <Button variant="outline" icon="Coffee" as={Link} to="/app/cafe">Order at the cafe</Button>
              <Button variant="outline" icon="ShoppingBag" as={Link} to="/app/shop">Visit the shop</Button>
            </div>
          </Card>
        </div>

        <GardenStatus
          state={gardenState}
          membership={membership}
          nextStage={nextStage}
          actions={
            dead ? (
              <Button variant="neon" icon="RefreshCw" as={Link} to="/app/membership" style={{ marginTop: 14 }} block>
                Renew membership
              </Button>
            ) : null
          }
        />
      </div>
    </>
  );
}
