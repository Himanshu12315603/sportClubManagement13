import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { Badge, Button, Card, CardTitle, KeyValue, ProgressBar } from '../ui/primitives';
import { PLANT_STAGES } from '../../utils/membership';
import { formatDate } from '../../utils/format';

/**
 * Text panel that explains what the garden is doing and why.
 * Keeps the gamified feature honest: every number has a visible source.
 */
export default function GardenStatus({ state, membership, nextStage, actions }) {
  const dead = !state.alive;
  const life = Math.max(0, Math.min(1, state.lifespanPct / 100));
  const health = dead ? 0 : Math.round(state.score * (0.35 + 0.65 * life));
  const healthLabel = dead ? 'Withered' : health >= 60 ? 'Thriving' : health >= 30 ? 'Fading' : 'Withering';
  const toNext = Math.max(0, 100 - state.score);

  return (
    <div className="cb-stack">
      <Card glass>
        <CardTitle
          icon="Sprout"
          title="Garden status"
          hint="Derived from membership validity + club activity"
          right={<Badge tone={state.tone.replace('badge-', '')}>{state.statusLabel}</Badge>}
        />
        <KeyValue label="Tree health" value={`${healthLabel} · ${health}%`} />
        <KeyValue label="Growth stage" value={`${state.stage.level}/5 · ${state.stage.label}`} />
        <KeyValue label="Activity score" value={`${state.score} / 100`} mono />
        <KeyValue label="Membership ends" value={formatDate(membership?.expiryDate)} />
        <KeyValue label="Days remaining" value={dead ? 'Expired' : `${state.remainingDays} days`} mono />
        <div style={{ marginTop: 14 }}>
          <ProgressBar value={state.lifespanPct} label="Membership validity" showLabel tone={dead ? 'neon' : 'green'} />
        </div>
        <p className="tiny dim" style={{ marginTop: 14 }}>{state.stage.desc}</p>
        {actions}
      </Card>

      <Card glass>
        <CardTitle icon="Target" title="How the garden grows" hint="Play more, grow more" />
        <div className="cb-stack" style={{ gap: 10 }}>
          {[
            { icon: 'CalendarDays', label: 'Court bookings', weight: 'up to +34' },
            { icon: 'ShoppingBag', label: 'Shop orders', weight: 'up to +14' },
            { icon: 'Coffee', label: 'Cafeteria visits', weight: 'up to +12' },
            { icon: 'Flame', label: 'Recent activity streak', weight: '+8' },
            { icon: 'Crown', label: 'Membership continuity', weight: 'up to +10' },
          ].map((r) => (
            <div key={r.label} className="cb-row between">
              <span className="cb-row small" style={{ gap: 9 }}>
                <span className="stat-icon" style={{ width: 28, height: 28, borderRadius: 9 }}><Icon name={r.icon} size={13} /></span>
                {r.label}
              </span>
              <span className="tiny mono dim">{r.weight}</span>
            </div>
          ))}
        </div>
        <hr className="cb-hairline" />
        <div className="small muted">
          {dead
            ? 'Your membership has lapsed, so growth is paused and the tree withers over a gradual transition.'
            : nextStage
              ? `Reach ${nextStage.min} points to unlock the ${nextStage.label.toLowerCase()} stage (${toNext} to go).`
              : 'You have reached the final stage — a fully grown magical tree.'}
        </div>
      </Card>

      <Card glass>
        <CardTitle icon="Leaf" title="Stage roadmap" />
        <div className="cb-stack" style={{ gap: 12 }}>
          {PLANT_STAGES.map((s) => {
            const reached = state.stage.level >= s.level;
            return (
              <div key={s.key} className="cb-row" style={{ gap: 12, opacity: reached ? 1 : 0.5 }}>
                <span
                  className={`stat-icon ${reached ? (dead ? 'gold' : 'green') : ''}`}
                  style={{ width: 30, height: 30, borderRadius: 9, flex: 'none' }}
                >
                  <Icon name={s.level === 1 ? 'Sprout' : s.level === 5 ? 'Sparkles' : 'Leaf'} size={14} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="small semibold">{s.label}</div>
                  <div className="tiny dim">{s.min}+ activity points</div>
                </div>
                {reached ? <Badge tone={dead ? 'gold' : 'active'}>{dead ? 'Paused' : 'Reached'}</Badge> : null}
              </div>
            );
          })}
        </div>
      </Card>

      <Card glass neon={dead}>
        <CardTitle icon="Bot" title="Why this matters" hint="Gamified retention" />
        <p className="small">
          The living tree is the club&apos;s engagement mirror. Members who watch their tree grow book more sessions and
          renew earlier — so the feature is both memorable and commercially useful.
        </p>
        <Button variant="outline" icon="Sparkles" as={Link} to="/app/ai" style={{ marginTop: 14 }} block>
          Ask ClubBloom AI about my garden
        </Button>
      </Card>
    </div>
  );
}
