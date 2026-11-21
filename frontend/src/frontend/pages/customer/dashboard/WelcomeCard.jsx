import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import { Avatar, Badge, Button, Card } from '../../../components/ui/primitives';
import { useApp } from '../../../context/AppContext';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Personal welcome banner with the member's streak and quick actions. */
export default function WelcomeCard() {
  const { user, stats, gardenState } = useApp();

  return (
    <Card glass glow style={{ overflow: 'hidden' }}>
      <div className="glow-orb" style={{ width: 220, height: 220, top: -90, right: -60, background: 'rgba(37,99,235,0.35)' }} />
      <div className="cb-row between wrap" style={{ gap: 18, position: 'relative', zIndex: 2 }}>
        <div className="cb-row" style={{ gap: 16 }}>
          <Avatar name={user?.name} seed={user?.avatarSeed} size={58} />
          <div>
            <div className="tiny dim">{greeting()},</div>
            <h3 style={{ fontSize: '1.5rem' }}>{user?.name?.split(' ')[0] || 'Member'} 👋</h3>
            <div className="cb-row wrap" style={{ gap: 8, marginTop: 8 }}>
              <Badge tone={gardenState.tone.replace('badge-', '')}>{gardenState.statusLabel} membership</Badge>
              <Badge tone="info" icon="Flame">{stats.streakWeeks}-week streak</Badge>
              <Badge tone="neutral" icon="Award">{stats.loyaltyPoints} points</Badge>
            </div>
          </div>
        </div>

        <div className="cb-row wrap" style={{ gap: 10 }}>
          <Button icon="CalendarDays" as={Link} to="/app/bookings">Book a court</Button>
          <Button variant="outline" icon="Coffee" as={Link} to="/app/cafe">Order food</Button>
          <Button variant="ghost" icon="Sparkles" as={Link} to="/app/ai">Ask AI</Button>
        </div>
      </div>

      <motion.div
        className="cb-row wrap"
        style={{ gap: 26, marginTop: 22, position: 'relative', zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div>
          <div className="tiny dim">Next session</div>
          <div className="small semibold">
            {gardenState.remainingDays > 0 ? `${stats.sessionsThisMonth} sessions this month` : 'Renew to keep playing'}
          </div>
        </div>
        <div>
          <div className="tiny dim">Favourite sport</div>
          <div className="small semibold">{stats.favouriteSport}</div>
        </div>
        <div>
          <div className="tiny dim">Guest passes left</div>
          <div className="small semibold">{stats.guestPassesLeft}</div>
        </div>
        <div>
          <div className="tiny dim">Garden stage</div>
          <div className="small semibold">{gardenState.stage.level}/5 · {gardenState.stage.label}</div>
        </div>
      </motion.div>
    </Card>
  );
}
