import { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * ClubBloom Tree3D — a photorealistic-style virtual tree rendered in layered
 * SVG with depth shading, bark texture and organic branches.
 *
 * It slowly rotates (rotateY/rotateX) and sways so it reads as a 3D object.
 *
 * The tree is the membership mirror:
 *   health 0-100 → leaf density + colour (100 = lush green, 0 = bare branches)
 *   growth 0-1   → overall size (young sapling → fully grown tree)
 *
 * Every change is driven by props derived from the membership engine, and every
 * change animates through a gradual transition — nothing snaps.
 */

/** Leaf clusters. `from` = health threshold at which the cluster survives. */
const CLUSTERS = [
  // back layer (darker, receding)
  { x: 150, y: 120, r: 62, layer: 0, from: 5 },
  { x: 104, y: 150, r: 50, layer: 0, from: 12 },
  { x: 196, y: 150, r: 50, layer: 0, from: 12 },
  { x: 150, y: 162, r: 50, layer: 0, from: 18 },
  // mid layer
  { x: 150, y: 100, r: 56, layer: 1, from: 24 },
  { x: 118, y: 132, r: 46, layer: 1, from: 32 },
  { x: 182, y: 132, r: 46, layer: 1, from: 32 },
  { x: 150, y: 150, r: 46, layer: 1, from: 40 },
  // front layer (brightest, closest)
  { x: 132, y: 118, r: 40, layer: 2, from: 50 },
  { x: 168, y: 118, r: 40, layer: 2, from: 50 },
  { x: 150, y: 134, r: 44, layer: 2, from: 58 },
  { x: 120, y: 150, r: 32, layer: 2, from: 66 },
  { x: 180, y: 150, r: 32, layer: 2, from: 66 },
  { x: 150, y: 166, r: 34, layer: 2, from: 74 },
  { x: 140, y: 130, r: 24, layer: 2, from: 84 },
  { x: 160, y: 130, r: 24, layer: 2, from: 84 },
];

const BRANCHES = [
  // lower main branches (thicker)
  { d: 'M150 212 C 122 196 98 178 82 162', w: 9 },
  { d: 'M150 212 C 178 196 202 178 218 162', w: 9 },
  // upper branches
  { d: 'M150 202 C 134 182 118 166 106 150', w: 6.5 },
  { d: 'M150 202 C 166 182 182 166 194 150', w: 6.5 },
  { d: 'M150 192 C 150 170 150 150 150 132', w: 7 },
  // thin twigs
  { d: 'M106 150 C 96 140 88 128 84 114', w: 2.6 },
  { d: 'M194 150 C 204 140 212 128 216 114', w: 2.6 },
  { d: 'M150 132 C 142 120 134 110 130 98', w: 2.4 },
  { d: 'M150 132 C 158 120 166 110 170 98', w: 2.4 },
];

const LEAF = 'M0 0 C 6 -5 13 -5 19 0 C 13 5 6 5 0 0 Z';

/** Five health bands — lush green → lime → amber → pale gold → dead brown. */
function paletteFor(health) {
  if (health >= 60) return {
    leaf: ['#1F8A45', '#2EBD5F', '#6EE092', '#A8F0C2'],
    leafShadow: 'rgba(10, 60, 30, 0.45)',
    bark: '#5A3A1E',
    barkHi: '#8A5E34',
    barkLow: '#3A2412',
    glow: 'rgba(34,197,94,0.22)',
  };
  if (health >= 38) return {
    leaf: ['#6B8E1F', '#A4C43D', '#CBE56A', '#E6F4A0'],
    leafShadow: 'rgba(40, 60, 10, 0.4)',
    bark: '#5A3A1E',
    barkHi: '#8A5E34',
    barkLow: '#3A2412',
    glow: 'rgba(132,204,22,0.22)',
  };
  if (health >= 20) return {
    leaf: ['#9A6B12', '#D69418', '#F2B73C', '#FBD98A'],
    leafShadow: 'rgba(60, 40, 8, 0.4)',
    bark: '#5C4020',
    barkHi: '#8C6638',
    barkLow: '#3C2814',
    glow: 'rgba(245,158,11,0.22)',
  };
  if (health >= 7) return {
    leaf: ['#7A5218', '#A97228', '#CFA04A', '#E6C57A'],
    leafShadow: 'rgba(50, 32, 10, 0.4)',
    bark: '#543C22',
    barkHi: '#7C5A36',
    barkLow: '#362416',
    glow: 'rgba(160,120,60,0.20)',
  };
  return {
    leaf: ['#5A4326', '#7A5E34', '#9A7D4E', '#B89A68'],
    leafShadow: 'rgba(40, 28, 12, 0.5)',
    bark: '#4A3820',
    barkHi: '#6E5638',
    barkLow: '#2E2010',
    glow: 'rgba(120,90,50,0.16)',
  };
}

export default function Tree3D({ health = 100, growth = 1, size = 320, celebrating = false, className = '' }) {
  const uid = useId().replace(/[:]/g, '');
  const pal = paletteFor(health);
  const bare = health < 7;
  const falling = health > 0 && health < 55;
  const scale = 0.66 + 0.34 * Math.max(0, Math.min(1, growth));
  const dur = { duration: 1.6, ease: 'easeInOut' };

  return (
    <div className={className} style={{ perspective: 1200, width: size, maxWidth: '100%' }}>
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: [-9, 9, -9], rotateX: [1.6, -1.6, 1.6] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          style={{ transformOrigin: '50% 94%' }}
          animate={{ rotateZ: [-1.4, 1.4, -1.4], y: [0, -3, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 300 330" width="100%" role="img" aria-label="ClubBloom virtual tree">
            <defs>
              <radialGradient id={`glow-${uid}`} cx="50%" cy="42%" r="62%">
                <stop offset="0%" stopColor={pal.glow} />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <linearGradient id={`bark-${uid}`} x1="0.2" y1="1" x2="0.55" y2="0">
                <stop offset="0%" stopColor={pal.barkLow} />
                <stop offset="45%" stopColor={pal.bark} />
                <stop offset="100%" stopColor={pal.barkHi} />
              </linearGradient>
              <radialGradient id={`leafDeep-${uid}`} cx="50%" cy="55%" r="70%">
                <stop offset="0%" stopColor={pal.leaf[2]} />
                <stop offset="65%" stopColor={pal.leaf[1]} />
                <stop offset="100%" stopColor={pal.leaf[0]} />
              </radialGradient>
              <radialGradient id={`leafFront-${uid}`} cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor={pal.leaf[3]} />
                <stop offset="55%" stopColor={pal.leaf[1]} />
                <stop offset="100%" stopColor={pal.leaf[0]} />
              </radialGradient>
              <filter id={`soft-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.2" />
              </filter>
            </defs>

            {/* ambience */}
            <circle cx="150" cy="150" r="145" fill={`url(#glow-${uid})`} />

            {/* ground shadow */}
            <motion.ellipse
              cx="150" cy="308" rx="96" ry="15"
              fill="rgba(0,0,0,0.46)"
              animate={{ opacity: bare ? 0.55 : 0.38, rx: 96 * scale }}
              transition={dur}
            />

            <g transform={`translate(150 300) scale(${scale}) translate(-150 -300)`}>
              {/* back canopy shadow (casts depth on trunk) */}
              {CLUSTERS.filter((c) => c.layer === 0).map((c, i) => (
                <CanopyBlob key={`bs${i}`} blob={c} health={health} color={pal.leafShadow} op={0.8} dur={dur} />
              ))}

              {/* back canopy */}
              {CLUSTERS.filter((c) => c.layer === 0).map((c, i) => (
                <CanopyBlob key={`b${i}`} blob={c} health={health} color={`url(#leafDeep-${uid})`} op={0.92} dur={dur} />
              ))}

              {/* trunk */}
              <motion.path
                d="M140 300 C 144 262 142 232 146 206 L154 206 C 158 232 156 262 160 300 Z"
                fill={`url(#bark-${uid})`}
                animate={{ opacity: 1 }}
              />
              {/* trunk base / roots flare */}
              <path
                d="M132 300 C 138 286 150 282 168 284 C 182 286 186 298 184 300 Z"
                fill={pal.barkLow}
                opacity="0.9"
              />
              {/* bark highlight stripe */}
              <path d="M147 296 C 150 262 149 232 151 208 L153 208 C 152 232 152 262 154 296 Z" fill={pal.barkHi} opacity="0.3" />
              {/* bark shadow stripe */}
              <path d="M156 296 C 157 262 157 232 156 208 L158 208 C 159 232 160 262 161 296 Z" fill={pal.barkLow} opacity="0.45" />
              {/* bark texture lines */}
              <g opacity="0.5" stroke={pal.barkLow} strokeWidth="0.9" fill="none">
                <path d="M146 294 C 147 270 146 244 148 214" />
                <path d="M150 296 C 150 272 151 246 150 214" />
                <path d="M154 294 C 153 270 154 244 153 214" />
              </g>

              {/* branches (always present — the skeleton) */}
              {BRANCHES.map((b, i) => (
                <motion.path
                  key={`br${i}`}
                  d={b.d}
                  stroke={`url(#bark-${uid})`}
                  strokeWidth={b.w}
                  strokeLinecap="round"
                  fill="none"
                  animate={{ opacity: 1 }}
                />
              ))}
              {/* twig shading */}
              {BRANCHES.slice(-4).map((b, i) => (
                <motion.path
                  key={`tw${i}`}
                  d={b.d}
                  stroke={pal.barkLow}
                  strokeWidth={b.w * 0.5}
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                  animate={{ opacity: 1 }}
                />
              ))}

              {/* mid + front canopy */}
              {CLUSTERS.filter((c) => c.layer > 0).map((c, i) => (
                <CanopyBlob
                  key={`f${i}`}
                  blob={c}
                  health={health}
                  color={c.layer === 1 ? `url(#leafDeep-${uid})` : `url(#leafFront-${uid})`}
                  op={1}
                  highlight={c.layer === 2 ? pal.leaf[3] : undefined}
                  dur={dur}
                />
              ))}

              {/* falling leaves while health is slipping */}
              {falling
                ? [0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={`fl${i}`} transform={`translate(${72 + i * 26} ${88 + (i % 3) * 26})`}>
                      <motion.path
                        d={LEAF}
                        fill={pal.leaf[i % 4]}
                        initial={{ opacity: 0 }}
                        animate={{ y: [0, 150], x: [0, i % 2 ? 26 : -22], rotate: [0, 240], opacity: [0.85, 0] }}
                        transition={{ duration: 4.2 + i * 0.35, repeat: Infinity, delay: i * 0.55, ease: 'easeIn' }}
                      />
                    </g>
                  ))
                : null}

              {/* magical ambience on a thriving tree */}
              {health >= 85
                ? [0, 1, 2, 3, 4].map((i) => (
                    <motion.circle
                      key={`mg${i}`}
                      cx={58 + i * 46}
                      cy={150 - (i % 3) * 34}
                      r="2.8"
                      fill={celebrating ? '#FCD34D' : '#9BEAFF'}
                      animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 3 + i * 0.35, repeat: Infinity, delay: i * 0.35 }}
                    />
                  ))
                : null}

              {/* renewal / celebration burst */}
              {celebrating
                ? [0, 1, 2, 3, 4].map((i) => (
                    <motion.circle
                      key={`cb${i}`}
                      cx={150}
                      cy={150}
                      r="4"
                      fill="#FCD34D"
                      animate={{ cx: [150, 150 + (i % 2 ? 110 : -110)], cy: [150, 60 + i * 24], opacity: [1, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.28 }}
                    />
                  ))
                : null}
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CanopyBlob({ blob, health, color, op = 1, highlight, dur }) {
  const alive = health >= blob.from;
  return (
    <g>
      <motion.ellipse
        cx={blob.x}
        cy={blob.y + blob.r * 0.18}
        rx={blob.r}
        ry={blob.r * 0.62}
        fill="rgba(0,0,0,0.28)"
        initial={false}
        animate={{ opacity: alive ? op * 0.5 : 0, scale: alive ? 1 : 0.4 }}
        transition={dur}
        style={{ transformBox: 'fill-box', transformOrigin: 'center', filter: 'blur(3px)' }}
      />
      <motion.ellipse
        cx={blob.x}
        cy={blob.y}
        rx={blob.r}
        ry={blob.r * 0.86}
        fill={color}
        initial={false}
        animate={{ opacity: alive ? op : 0, scale: alive ? 1 : 0.42 }}
        transition={dur}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      {highlight ? (
        <motion.ellipse
          cx={blob.x - blob.r * 0.28}
          cy={blob.y - blob.r * 0.32}
          rx={blob.r * 0.52}
          ry={blob.r * 0.32}
          fill={highlight}
          initial={false}
          animate={{ opacity: alive ? 0.22 : 0 }}
          transition={dur}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ) : null}
    </g>
  );
}
