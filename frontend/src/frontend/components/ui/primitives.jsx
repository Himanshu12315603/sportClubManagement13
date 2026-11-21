import { motion } from 'framer-motion';
import Icon from './Icon';

/* ------------------------------- Button ------------------------------- */

export function Button({
  children,
  variant = 'primary',
  size,
  icon,
  iconRight,
  block,
  as: As = 'button',
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={16} /> : null}
    </>
  );

  // `as` can be a react-router <Link> (or any component). `motion[x]` only works
  // with intrinsic elements, so render custom components directly.
  if (typeof As !== 'string') {
    return (
      <As className={classes} {...rest}>
        {inner}
      </As>
    );
  }

  const Cmp = motion[As] || motion.button;
  return (
    <Cmp whileTap={{ scale: 0.97 }} className={classes} {...rest}>
      {inner}
    </Cmp>
  );
}

export function IconButton({ icon, label, variant = 'ghost', size = 18, className = '', ...rest }) {
  return (
    <button className={`btn ${`btn-${variant}`} btn-icon ${className}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({ children, className = '', glow, neon, glass, as = 'div', ...rest }) {
  const Cmp = motion[as] || motion.div;
  return (
    <Cmp
      className={['cb-card', glass && 'glass', glow && 'glow', neon && 'neon', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Cmp>
  );
}

export function CardTitle({ icon, title, hint, right, iconTone }) {
  return (
    <div className="cb-row between" style={{ marginBottom: 14 }}>
      <div className="cb-row" style={{ gap: 10 }}>
        {icon ? <span className={`stat-icon ${iconTone || ''}`} style={{ width: 34, height: 34, borderRadius: 10 }}><Icon name={icon} size={16} /></span> : null}
        <div>
          <h4>{title}</h4>
          {hint ? <div className="tiny dim">{hint}</div> : null}
        </div>
      </div>
      {right}
    </div>
  );
}

/* -------------------------------- Badge ------------------------------- */

export function Badge({ children, tone = 'neutral', icon, className = '' }) {
  return (
    <span className={`badge badge-${tone} ${className}`}>
      {icon ? <Icon name={icon} size={12} /> : null}
      {children}
    </span>
  );
}

/* ------------------------------ Progress ------------------------------ */

export function ProgressBar({ value, tone = '', showLabel, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div>
      {showLabel ? (
        <div className="cb-row between tiny" style={{ marginBottom: 6 }}>
          <span className="muted">{label || 'Progress'}</span>
          <span className="mono">{pct}%</span>
        </div>
      ) : null}
      <div className={`progress ${tone}`}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------ StatCard ------------------------------ */

export function StatCard({ icon, tone = '', label, value, detail, trend, delay = 0 }) {
  return (
    <Card
      glass
      glow
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="cb-row between">
        <span className={`stat-icon ${tone}`}><Icon name={icon} size={19} /></span>
        {trend ? (
          <span className={`tiny ${trend > 0 ? 'text-success' : 'text-neon'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            <Icon name={trend > 0 ? 'TrendingUp' : 'TrendingDown'} size={14} />
            {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {detail ? <div className="tiny dim">{detail}</div> : null}
    </Card>
  );
}

/* --------------------------- SectionHeading --------------------------- */

export function SectionHeading({ eyebrow, title, subtitle, center, children }) {
  return (
    <div className={`cb-section-head ${center ? 'center' : ''}`}>
      {eyebrow ? <span className="cb-eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </div>
  );
}

/* ------------------------------ PageHeader ---------------------------- */

export function PageHeader({ title, subtitle, actions, badge, icon }) {
  return (
    <div className="cb-row between wrap" style={{ marginBottom: 22, gap: 16 }}>
      <div className="cb-row" style={{ gap: 14 }}>
        {icon ? <span className="stat-icon" style={{ width: 46, height: 46, borderRadius: 14 }}><Icon name={icon} size={22} /></span> : null}
        <div>
          <div className="cb-row" style={{ gap: 10 }}>
            <h2 style={{ fontSize: '1.6rem' }}>{title}</h2>
            {badge}
          </div>
          {subtitle ? <p className="small">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="cb-row wrap">{actions}</div> : null}
    </div>
  );
}

/* -------------------------------- Tabs -------------------------------- */

export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`cb-tabs ${className}`}>
      {tabs.map((t) => (
        <button key={t.id} className={`cb-tab ${value === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)} type="button">
          {t.icon ? <Icon name={t.icon} size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} /> : null}
          {t.label}
          {typeof t.count === 'number' ? <span className="mono" style={{ marginLeft: 6, opacity: 0.7 }}>{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function ChipGroup({ options, value, onChange, multiple, values = [] }) {
  return (
    <div className="pill-row">
      {options.map((o) => {
        const active = multiple ? values.includes(o.id) : value === o.id;
        return (
          <button key={o.id} type="button" className={`chip ${active ? 'active' : ''}`} onClick={() => onChange(o)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Avatar ------------------------------ */

export function Avatar({ name = '', seed, size = 38, className = '' }) {
  const text = seed || name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <span className={`cb-avatar ${className}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {text || 'CB'}
    </span>
  );
}

/* ------------------------- Loader / Skeleton / Empty ------------------- */

export function Loader({ label }) {
  return (
    <div className="cb-stack center-text" style={{ alignItems: 'center', padding: 40, gap: 12 }}>
      <div className="loader" />
      {label ? <span className="small muted">{label}</span> : null}
    </div>
  );
}

export function SkeletonBlock({ height = 16, width = '100%', radius = 10, className = '' }) {
  return <div className={`skeleton ${className}`} style={{ height, width, borderRadius: radius }} />;
}

export function EmptyState({ icon = 'Search', title, message, action }) {
  return (
    <div className="empty-state">
      <span className="ico"><Icon name={icon} size={24} /></span>
      <h4>{title}</h4>
      {message ? <p className="small" style={{ maxWidth: 380 }}>{message}</p> : null}
      {action}
    </div>
  );
}

/* -------------------------------- Toast ------------------------------- */

export function InfoNote({ icon = 'Info', tone = 'badge-info', children }) {
  return (
    <div className="cb-card glass" style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', borderColor: 'rgba(0,163,255,0.28)' }}>
      <span className={`badge ${tone}`} style={{ padding: '3px 7px' }}><Icon name={icon} size={13} /></span>
      <p className="tiny" style={{ color: '#cbd5e1' }}>{children}</p>
    </div>
  );
}

export function KeyValue({ label, value, mono }) {
  return (
    <div className="cb-row between" style={{ padding: '9px 0', borderBottom: '1px solid rgba(38,50,71,0.5)' }}>
      <span className="small muted">{label}</span>
      <span className={`small semibold ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}
