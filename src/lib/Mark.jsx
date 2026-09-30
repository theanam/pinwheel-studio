import { SAIL_PATH, PIN } from './mark-path.js';

/**
 * The Pinwheel brand mark, sized in CSS px. Geometry lives in mark-path.js; colours
 * come from the UI tokens so the mark follows the theme (ink flips to cream in dark).
 */
const SAILS = ['var(--pw-accent)', 'var(--pw-ink)', 'var(--pw-accent)', 'var(--pw-ink)'];

export default function Mark({ size = 24, title }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} style={{ display: 'block', flex: 'none' }}>
      {title ? <title>{title}</title> : null}
      {SAILS.map((fill, i) => (
        <path key={i} d={SAIL_PATH} style={{ fill }} transform={i ? `rotate(${i * 90} 50 50)` : undefined} />
      ))}
      <circle cx="50" cy="50" r={PIN.r} style={{ fill: 'var(--pw-ink)' }} />
      <circle cx="50" cy="50" r={PIN.hole} style={{ fill: 'var(--pw-app)' }} />
    </svg>
  );
}
