import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Tree3D from './Tree3D';
import Icon from '../ui/Icon';
import { Badge, Button, ProgressBar } from '../ui/primitives';
import { PLANT_STAGES } from '../../utils/membership';

const floatingProps = [
  { icon: 'Tennis', top: '12%', left: '8%', delay: 0, tone: '#D6F16B' },
  { icon: 'Activity', top: '22%', left: '84%', delay: 0.8, tone: '#7DD3FC' },
  { icon: 'Dumbbell', top: '58%', left: '4%', delay: 1.4, tone: '#A855F7' },
  { icon: 'Trophy', top: '68%', left: '88%', delay: 2, tone: '#FBBF24' },
];

/**
 * The living tree: one 3D tree on shared ground. Everything visual here is
 * derived from the membership state passed in as `state`.
 *
 * Health blends two real signals so the tree literally dies down as the
 * membership runs out:
 *   - activity score (how much the member plays / orders)
 *   - remaining validity (how much of the membership is left)
 */
export default function Garden({ state, compact = false, showRibbon = true }) {
  const dead = !state.alive;
  const life = Math.max(0, Math.min(1, state.lifespanPct / 100));
  const health = dead ? 0 : Math.round(state.score * (0.35 + 0.65 * life));
  const growth = Math.max(0, Math.min(1, state.stage.level / 5));
  const treeSize = compact ? 210 : 300;

  const tone = health >= 60 ? 'green' : health >= 30 ? 'gold' : 'neon';
  const healthLabel = dead ? 'Withered' : health >= 60 ? 'Thriving' : health >= 30 ? 'Fading' : 'Withering';

  return (
    <div className="tree-stage" style={{ paddingTop: compact ? 30 : 46, paddingBottom: compact ? 90 : 110 }}>
      <div className="glow-orb" style={{ width: 260, height: 260, top: -70, left: '50%', marginLeft: -130, background: 'rgba(37,99,235,0.32)' }} />
      <div className="glow-orb anim-float-slow" style={{ width: 180, height: 180, bottom: -40, right: -50, background: 'rgba(34,197,94,0.18)' }} />

      {showRibbon ? (
        <div className="cb-row between wrap" style={{ position: 'absolute', top: 14, left: 16, right: 16, zIndex: 2, gap: 10 }}>
          <div className="cb-row" style={{ gap: 10 }}>
            <Badge tone={state.tone.replace('badge-', '')}>{state.statusLabel}</Badge>
            <span className="tiny dim">Stage {state.stage.level}/5 · {state.stage.label}</span>
          </div>
          <div className="tiny" style={{ color: tone === 'green' ? '#4ade80' : tone === 'gold' ? '#fbbf24' : '#ff8095', fontWeight: 700 }}>
            <Icon name="Leaf" size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            {healthLabel} · {health}%
          </div>
        </div>
      ) : null}

      {floatingProps.map((p) => (
        <motion.span
          key={p.icon}
          className="stat-icon"
          style={{ position: 'absolute', top: p.top, left: p.left, color: p.tone, borderColor: 'rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.08)', zIndex: 1 }}
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6 + p.delay, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        >
          <Icon name={p.icon} size={16} />
        </motion.span>
      ))}

      <div className={`garden-ground ${dead ? 'dry' : ''}`} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: compact ? 70 : 96, zIndex: 1 }} />

      <div className="cb-row center" style={{ zIndex: 2, position: 'relative' }}>
        <Tree3D health={health} growth={0.5 + 0.5 * growth} celebrating={state.celebrating} size={treeSize} />
      </div>

      <div className="tree-shadow" style={{ bottom: compact ? 26 : 38 }} />

      {dead ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
            zIndex: 3, display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(15,21,33,0.92)', border: '1px solid rgba(255,23,68,0.5)',
            borderRadius: 999, padding: '8px 10px 8px 16px',
          }}
        >
          <span className="small semibold">Your tree has withered — renew to bring it back</span>
          <Button size="sm" variant="neon" icon="RefreshCw" as={Link} to="/app/membership" className="anim-glow">Renew membership</Button>
        </motion.div>
      ) : null}

      {!compact ? (
        <div style={{ position: 'absolute', left: 18, bottom: 16, right: 18, zIndex: 3 }}>
          <ProgressBar value={state.score} label="Tree activity score" showLabel tone={dead ? 'neon' : ''} />
        </div>
      ) : null}

      <div className="cb-row" style={{ position: 'absolute', top: showRibbon ? 52 : 14, right: 16, gap: 8, zIndex: 2 }}>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <span
            key={lvl}
            title={PLANT_STAGES[lvl - 1].label}
            style={{
              width: 9, height: 9, borderRadius: 999,
              background: lvl <= state.stage.level ? (dead ? '#A1783A' : '#22C55E') : 'rgba(148,163,184,0.25)',
              boxShadow: lvl <= state.stage.level && !dead ? '0 0 10px rgba(34,197,94,0.6)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
