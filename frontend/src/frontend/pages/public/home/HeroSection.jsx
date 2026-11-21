import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/primitives';
import Tree3D from '../../../components/clubbloom/Tree3D';

const floaters = [
  { icon: 'Tennis', top: '8%', left: '6%', tone: '#D6F16B', delay: 0 },
  { icon: 'Activity', top: '18%', left: '86%', tone: '#7DD3FC', delay: 0.9 },
  { icon: 'Dumbbell', top: '62%', left: '2%', tone: '#A855F7', delay: 1.5 },
  { icon: 'Trophy', top: '72%', left: '88%', tone: '#FBBF24', delay: 2.1 },
];

const stats = [
  { label: 'Active members', value: '1,570' },
  { label: 'Facilities', value: '7' },
  { label: 'Bookable courts', value: '22' },
  { label: 'Member rating', value: '4.7★' },
];

export default function HeroSection() {
  return (
    <section className="cb-hero">
      <div className="glow-orb anim-float-slow" style={{ width: 460, height: 460, top: -140, left: -120, background: 'rgba(37,99,235,0.4)' }} />
      <div className="glow-orb anim-float" style={{ width: 380, height: 380, bottom: -160, right: -100, background: 'rgba(255,23,68,0.22)' }} />

      <div className="cb-container cb-hero-inner">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="cb-eyebrow">
            <Icon name="Sparkles" size={13} /> Play. Grow. Connect.
          </span>

          <h1 style={{ margin: '20px 0 18px' }}>
            Your Game. Your Growth. <span className="gradient-text">Your Club.</span>
          </h1>

          <p className="cb-hero-sub">
            Experience a smarter sports club where every match, every membership and every moment grows into something
            extraordinary.
          </p>

          <div className="cb-row wrap" style={{ gap: 12, marginTop: 28 }}>
            <Button size="lg" icon="Crown" as={Link} to="/membership">Join Membership</Button>
            <Button size="lg" variant="outline" icon="CalendarCheck" as={Link} to="/trial">Book a Trial</Button>
            <Button size="lg" variant="ghost" icon="Map" as={Link} to="/facilities">Explore Facilities</Button>
          </div>

          <div className="cb-grid cols-4" style={{ marginTop: 40, gap: 14 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div className="h3 mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                <div className="tiny dim">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="tree-stage"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ paddingTop: 30, paddingBottom: 110, minHeight: 420 }}
        >
          <div className="cb-row between" style={{ position: 'absolute', top: 14, left: 16, right: 16, zIndex: 3 }}>
            <span className="badge badge-active">Live tree preview</span>
            <span className="tiny dim">Stage 4 / 5 · Flowering</span>
          </div>

          {floaters.map((f) => (
            <motion.span
              key={f.icon}
              className="stat-icon"
              style={{ position: 'absolute', top: f.top, left: f.left, color: f.tone, background: 'rgba(148,163,184,0.08)', borderColor: 'rgba(148,163,184,0.28)', zIndex: 2 }}
              animate={{ y: [0, -16, 0], rotate: [0, 9, 0] }}
              transition={{ duration: 6 + f.delay, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
            >
              <Icon name={f.icon} size={16} />
            </motion.span>
          ))}

          <div className="garden-ground" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, zIndex: 1 }} />

          <div className="cb-row center" style={{ zIndex: 2, position: 'relative' }}>
            <Tree3D health={84} growth={1} celebrating size={300} />
          </div>

          <div className="tree-shadow" style={{ bottom: 40 }} />

          <div className="cb-card glass" style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 3, padding: '10px 14px' }}>
            <div className="cb-row between">
              <span className="cb-row small" style={{ gap: 9 }}>
                <Icon name="Sprout" size={15} />
                Your tree grows with every session you play
              </span>
              <Link to="/about" className="tiny text-electric">How it works →</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
