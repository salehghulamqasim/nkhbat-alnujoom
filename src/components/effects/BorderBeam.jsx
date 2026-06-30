/**
 * Animated border beam — lightweight CSS offset-path animation.
 * Inspired by magicui; no external deps.
 */
export default function BorderBeam({
  className = '',
  size = 200,
  duration = 8,
  anchor = 90,
  borderWidth = 2,
  colorFrom = 'transparent',
  colorVia = 'var(--theme-accent)',
  colorTo = 'transparent',
  delay = 0,
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border-beam-mask ${className}`}
      style={{
        '--beam-size': size,
        '--beam-duration': duration,
        '--beam-anchor': anchor,
        '--beam-width': borderWidth,
        '--beam-delay': delay,
        borderWidth: borderWidth,
      }}
      aria-hidden="true"
    >
      <div
        className="border-beam-spot absolute aspect-square bg-gradient-to-l to-transparent"
        style={{
          width: size,
          backgroundImage: `linear-gradient(to left, ${colorFrom}, ${colorVia}, ${colorTo})`,
        }}
      />
    </div>
  )
}
