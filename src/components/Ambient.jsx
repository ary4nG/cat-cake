import { useEffect, useMemo, useRef } from 'react'
import { Sparkle, Burst } from './Doodles.jsx'

// Deterministic pseudo-random so the sky doesn't reshuffle on re-render.
const rand = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

const SPARKLE_COLORS = ['var(--mustard)', 'var(--mustard)', 'var(--ink-soft)', 'var(--cream)']
const SPARKLE_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="currentColor"/></svg>'

export default function Ambient() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: rand(i + 1) * 100,
        top: rand(i + 101) * 100,
        size: 8 + rand(i + 201) * 16,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        dur: 3 + rand(i + 301) * 4,
        delay: -rand(i + 401) * 6,
        burst: i % 7 === 0,
      })),
    [],
  )

  const motes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: rand(i + 501) * 100,
        size: 3 + rand(i + 601) * 6,
        dur: 18 + rand(i + 701) * 18,
        delay: -rand(i + 801) * 30,
        dx: (rand(i + 901) - 0.5) * 160,
      })),
    [],
  )

  // Cursor sparkle trail (skipped for touch and reduced motion).
  const trailRef = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last = 0
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const now = performance.now()
      if (now - last < 55) return
      last = now
      const el = document.createElement('span')
      el.className = 'trail'
      el.innerHTML = SPARKLE_SVG
      const s = 8 + Math.random() * 9
      el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;--rot:${Math.random() * 180 - 90}deg;color:${Math.random() > 0.35 ? 'var(--mustard)' : 'var(--cream)'}`
      el.addEventListener('animationend', () => el.remove())
      trailRef.current?.appendChild(el)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <div className="ambient" aria-hidden="true">
        {motes.map((m, i) => (
          <span
            key={`m${i}`}
            className="mote"
            style={{
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              '--d': `${m.dur}s`,
              '--delay': `${m.delay}s`,
              '--dx': `${m.dx}px`,
            }}
          />
        ))}
        {sparkles.map((s, i) => (
          <span
            key={`s${i}`}
            className="sparkle"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              color: s.color,
              '--d': `${s.dur}s`,
              '--delay': `${s.delay}s`,
            }}
          >
            {s.burst ? <Burst size={s.size * 1.8} /> : <Sparkle size={s.size} />}
          </span>
        ))}
      </div>
      {/* light that drifts over everything, cats included */}
      <div className="ambient ambient-light" aria-hidden="true">
        <span className="glow g1" />
        <span className="glow g2" />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="trail-layer" ref={trailRef} aria-hidden="true" />
    </>
  )
}
