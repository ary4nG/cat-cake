import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Paw } from '../components/Doodles.jsx'
import { sfx } from '../audio/sound.js'

// Whisk the batter by drawing circles in the bowl (mouse hover-or-drag,
// touch drag), or by tapping the Whisk button. Three phases follow the
// recipe: dry mix → wet ingredients → hot water.

const TURN = Math.PI * 2
const TURNS_PER_PHASE = 3
const DROP_MS = 1400

const PHASES = [
  {
    id: 'dry',
    label: 'Dry mix',
    hint: 'Whisk the flour, sugar, cocoa and friends. Chase out every lump!',
  },
  {
    id: 'wet',
    label: 'Wet stuff',
    plop: 'Plop! In go the egg, milk, melted butter and vanilla.',
    hint: 'Keep whisking until it’s smooth and silky.',
  },
  {
    id: 'water',
    label: 'Hot water',
    plop: 'Glug glug… here comes the hot water.',
    hint: 'Gentle circles now. It goes thin and glossy, and that’s just right!',
  },
]

// batter colour at the start/end of each phase
const COLORS = ['#dcb98f', '#a8754d', '#76472b', '#4e2918']

// geometry (viewBox 0 0 320 270)
const CX = 160
const RIM = { cy: 135, rx: 120, ry: 36 }
const BODY =
  'M40 135 A120 36 0 0 0 280 135 C276 214 224 262 160 262 C96 262 44 214 40 135 Z'

const SPIRAL = (() => {
  let d = ''
  for (let i = 0; i <= 140; i++) {
    const t = i / 140
    const a = t * TURN * 3.2
    const r = 4 + t * 98
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`
  }
  return d
})()

const LUMPS = Array.from({ length: 16 }, (_, i) => {
  const a = i * 2.39996
  const r = 18 + ((i * 37) % 70)
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 3 + (i % 4) * 1.6 }
})

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}

let dropletId = 0

export default function WhiskGame({ onComplete, completed = false }) {
  const [phase, setPhase] = useState(completed ? PHASES.length - 1 : 0)
  const [progress, setProgress] = useState(completed ? 1 : 0)
  const [status, setStatus] = useState(completed ? 'done' : 'playing') // playing | dropping | done
  const [spin, setSpin] = useState(0)
  const [started, setStarted] = useState(completed)
  const [tip, setTip] = useState(null)
  const [droplets, setDroplets] = useState([])
  const [turbo, setTurbo] = useState(false)

  const svgRef = useRef(null)
  const statusRef = useRef(status)
  const progressRef = useRef(progress)
  const lastAngle = useRef(null)
  const lastT = useRef(0)
  const speed = useRef(0)
  const lastDrop = useRef(0)
  const dragging = useRef(false)
  const timer = useRef()
  statusRef.current = status

  useEffect(() => () => clearTimeout(timer.current), [])

  // batter rises and darkens as things are added
  const level = (phase + progress) / PHASES.length
  const bat = { cy: 146 - level * 7, rx: 102 + level * 8, ry: 27 + level * 3 }
  const color = mix(COLORS[phase], COLORS[phase + 1], progress)
  const squish = bat.ry / bat.rx
  const lumpAlpha = phase === 0 ? 1 - progress : 0
  const gloss = phase === 2 ? progress * 0.45 : status === 'done' ? 0.45 : 0

  const restTip = { x: CX + 38, y: bat.cy - 2 }
  const t = tip ?? restTip

  const finishPhase = () => {
    progressRef.current = 0
    setProgress(1)
    if (phase === PHASES.length - 1) {
      statusRef.current = 'done'
      setStatus('done')
      setTip(null)
      sfx.gameWon()
      onComplete?.()
      return
    }
    statusRef.current = 'dropping'
    setStatus('dropping')
    setTip(null)
    sfx.phaseDone()
    // sounds line up with the falling ingredients in <Drops>
    if (PHASES[phase + 1].id === 'water') sfx.glug()
    else [0, 1, 2, 3].forEach((i) => sfx.plop(0.62 + i * 0.16))
    timer.current = setTimeout(() => {
      setPhase((p) => p + 1)
      setProgress(0)
      statusRef.current = 'playing'
      setStatus('playing')
    }, DROP_MS)
  }

  const advance = (d, at) => {
    const now = performance.now()
    const dt = Math.max(16, now - lastT.current)
    lastT.current = now
    speed.current = speed.current * 0.8 + (Math.abs(d) / (dt / 1000)) * 0.2
    setTurbo(speed.current > 14)
    setStarted(true)
    setSpin((s) => s + d)
    sfx.swish(at ? speed.current / 16 : 0.5)

    if (speed.current > 7 && now - lastDrop.current > 70 && at) {
      lastDrop.current = now
      const id = ++dropletId
      const out = Math.atan2((at.y - bat.cy) / squish, at.x - CX)
      const drop = {
        id,
        x: at.x,
        y: at.y,
        dx: Math.cos(out) * (30 + Math.random() * 50),
        dy: -40 - Math.random() * 50,
        r: 3 + Math.random() * 4,
      }
      setDroplets((ds) => [...ds.slice(-14), drop])
      sfx.splash()
      setTimeout(() => setDroplets((ds) => ds.filter((x) => x.id !== id)), 800)
    }

    const next = progressRef.current + Math.abs(d) / (TURNS_PER_PHASE * TURN)
    if (next >= 1) finishPhase()
    else {
      progressRef.current = next
      setProgress(next)
    }
  }

  const toSvg = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 320, y: ((e.clientY - r.top) / r.height) * 270 }
  }

  const onMove = (e) => {
    if (statusRef.current !== 'playing') return
    if (e.pointerType !== 'mouse' && !dragging.current) return
    const p = toSvg(e)
    const nx = (p.x - CX) / bat.rx
    const ny = (p.y - bat.cy) / bat.ry
    const len = Math.hypot(nx, ny)
    if (len > 2.2) {
      // way outside the bowl: let go
      lastAngle.current = null
      setTip(null)
      return
    }
    const k = len > 0.82 ? 0.82 / len : 1
    // whisk knocking the side of the bowl
    if (len > 0.95 && len < 1.4) sfx.clink()
    const at = { x: CX + nx * k * bat.rx, y: bat.cy + ny * k * bat.ry }
    setTip(at)
    if (len < 0.12) {
      lastAngle.current = null
      return
    }
    const a = Math.atan2(ny, nx)
    if (lastAngle.current != null) {
      let d = a - lastAngle.current
      if (d > Math.PI) d -= TURN
      if (d < -Math.PI) d += TURN
      advance(Math.max(-0.7, Math.min(0.7, d)), at)
    }
    lastAngle.current = a
  }

  const onDown = (e) => {
    dragging.current = true
    lastAngle.current = null
    e.currentTarget.setPointerCapture?.(e.pointerId)
    onMove(e)
  }
  const onUp = () => {
    dragging.current = false
    lastAngle.current = null
    speed.current = 0
    setTurbo(false)
  }
  const onLeave = () => {
    lastAngle.current = null
    if (!dragging.current) setTip(null)
  }

  // accessible / no-drag alternative: each tap is a quarter turn
  const tap = () => {
    if (statusRef.current !== 'playing') return
    const a = spin + TURN / 4
    const at = { x: CX + Math.cos(a) * bat.rx * 0.55, y: bat.cy + Math.sin(a) * bat.ry * 0.55 }
    setTip(at)
    advance(TURN / 4, null)
  }

  const reset = () => {
    clearTimeout(timer.current)
    sfx.pop()
    setPhase(0)
    setProgress(0)
    progressRef.current = 0
    setStatus('playing')
    statusRef.current = 'playing'
    setStarted(false)
    setSpin(0)
  }

  const message =
    status === 'done'
      ? 'Silky, glossy, purr-fect batter!'
      : status === 'dropping'
        ? PHASES[phase + 1].plop
        : !started
          ? 'Swirl your cursor or finger around the bowl, or tap the whisk button.'
          : turbo
            ? 'Whoa, turbo paws! Easy, easy…'
            : PHASES[phase].hint

  const wobble = Math.sin(spin * 2) * 5
  const lean = ((t.x - CX) / bat.rx) * 14
  const deg = (spin * 180) / Math.PI

  return (
    <div className="whisk">
      <div className="whisk-head">
        <span className="whisk-title">
          <span className="whisk-badge">Mini-game</span> Whisk it!
        </span>
        <ol className="whisk-phases" aria-label="Whisking progress">
          {PHASES.map((p, i) => {
            const fill = status === 'done' || i < phase ? 1 : i === phase ? progress : 0
            const state = fill >= 1 ? 'done' : i === phase ? 'on' : ''
            return (
              <li key={p.id} className={`whisk-phase ${state}`}>
                <span className="whisk-phase-fill" style={{ transform: `scaleX(${fill})` }} />
                <span className="whisk-phase-label">
                  {fill >= 1 ? <Paw size={11} /> : <b>{i + 1}</b>}
                  {p.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className={`whisk-stage ${status}`}>
        <svg
          ref={svgRef}
          viewBox="0 0 320 270"
          className="whisk-svg"
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onLeave}
          role="img"
          aria-label={`Mixing bowl. ${PHASES[phase].label}: ${Math.round(progress * 100)}% whisked`}
        >
          <defs>
            <clipPath id="batter-clip">
              <ellipse cx={CX} cy={bat.cy} rx={bat.rx} ry={bat.ry} />
            </clipPath>
          </defs>

          {/* bowl interior */}
          <ellipse cx={CX} cy={RIM.cy} rx={RIM.rx} ry={RIM.ry} fill="#f1dfc2" stroke="#5a3a2a" strokeWidth="3" />

          {/* batter */}
          <g clipPath="url(#batter-clip)">
            <ellipse cx={CX} cy={bat.cy} rx={bat.rx} ry={bat.ry} fill={color} style={{ transition: 'fill .25s' }} />
            <g transform={`translate(${CX} ${bat.cy}) scale(1 ${squish})`}>
              <g transform={`rotate(${deg})`}>
                <path d={SPIRAL} fill="none" stroke="#fff3df" strokeOpacity=".28" strokeWidth="5" strokeLinecap="round" />
                <path d={SPIRAL} fill="none" stroke="#2e170c" strokeOpacity=".18" strokeWidth="3" transform="rotate(180)" />
                {LUMPS.map((l, i) => (
                  <circle key={i} cx={l.x} cy={l.y} r={l.s} fill="#f6e9d3" opacity={lumpAlpha} />
                ))}
              </g>
              {!started && status === 'playing' && (
                <circle className="whisk-hint" r="62" fill="none" stroke="#fff6e8" strokeWidth="5" strokeDasharray="14 16" strokeLinecap="round" />
              )}
            </g>
            <ellipse cx={CX - 26} cy={bat.cy - bat.ry * 0.35} rx={bat.rx * 0.45} ry={bat.ry * 0.28} fill="#fff" opacity={gloss} style={{ transition: 'opacity .4s' }} />
            {tip && (
              <ellipse cx={t.x} cy={t.y + 2} rx="22" ry={22 * squish} fill="none" stroke="#fff3df" strokeOpacity=".45" strokeWidth="2.5" />
            )}
          </g>

          {/* ingredients dropping in between phases */}
          <AnimatePresence>
            {status === 'dropping' && <Drops key={phase} kind={PHASES[phase + 1].id} landY={bat.cy} />}
          </AnimatePresence>

          {/* whisk */}
          <g
            className={`whisk-tool ${tip ? 'active' : ''}`}
            transform={`translate(${t.x} ${t.y}) rotate(${-22 + lean + (tip ? wobble : 0)})`}
            style={{ transition: tip ? 'none' : 'transform .5s cubic-bezier(.3,1.5,.5,1)' }}
          >
            <g fill="none" stroke="#7d6a5e" strokeWidth="2.6">
              <ellipse cx="0" cy="-30" rx="15" ry="32" />
              <ellipse cx="0" cy="-30" rx="8" ry="32" />
              <line x1="0" y1="2" x2="0" y2="-62" />
            </g>
            <rect x="-5" y="-66" width="10" height="16" rx="3" fill="#a9a29b" stroke="#5a3a2a" strokeWidth="2.4" />
            <rect x="-7" y="-128" width="14" height="64" rx="7" fill="#b98352" stroke="#5a3a2a" strokeWidth="2.6" />
            <line x1="-2" y1="-120" x2="-2" y2="-74" stroke="#d9a877" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* bowl front */}
          <path d={BODY} fill="#fbf3e4" stroke="#5a3a2a" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M58 170 C70 210 110 240 160 244" fill="none" stroke="#ead9bd" strokeWidth="6" strokeLinecap="round" />
          <Paw size={30} x={145} y={196} style={{ color: '#c98a55' }} />

          {/* splashes */}
          {droplets.map((d) => (
            <motion.circle
              key={d.id}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={color}
              stroke="#5a3a2a"
              strokeWidth="1.2"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{ x: d.dx, y: [0, d.dy, d.dy + 70], opacity: [1, 1, 0], scale: 1 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            />
          ))}
        </svg>

        <AnimatePresence>
          {status === 'done' && (
            <motion.div
              className="whisk-done"
              initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            >
              Silky smooth!
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="whisk-heart" style={{ '--i': i }} aria-hidden="true">
                  <Heart size={16} />
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="whisk-foot">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            className="whisk-msg"
            aria-live="polite"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
        {status === 'done' ? (
          <button className="btn btn-ghost btn-sm" onClick={reset}>
            Whisk again
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={tap} disabled={status !== 'playing'}>
            Whisk!
          </button>
        )}
      </div>
    </div>
  )
}

const fall = (delay) => ({
  initial: { y: -150, opacity: 0, scale: 0.8 },
  animate: { y: 0, opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.5] },
  transition: { duration: 0.75, delay, ease: [0.5, 0, 0.8, 0.6], times: [0, 0.1, 0.85, 1] },
})

function Drops({ kind, landY }) {
  if (kind === 'water') {
    return (
      <motion.g exit={{ opacity: 0 }}>
        <motion.rect
          x={CX + 24}
          y={-10}
          width="12"
          rx="6"
          fill="#e9f3f6"
          stroke="#5a3a2a"
          strokeWidth="2"
          initial={{ height: 0 }}
          animate={{ height: [0, landY + 10, landY + 10, 0], y: [-10, -10, -10, landY] }}
          transition={{ duration: 1.2, times: [0, 0.3, 0.75, 1] }}
        />
        <Ripple x={CX + 30} y={landY} delay={0.35} />
      </motion.g>
    )
  }
  const items = [
    { x: CX - 50, el: <><ellipse rx="13" ry="10" fill="#fff8ec" stroke="#5a3a2a" strokeWidth="2" /><circle r="5.5" cx="1" fill="#f2b33d" stroke="#5a3a2a" strokeWidth="1.5" /></> },
    { x: CX - 12, el: <path d="M0 -14 C6 -4 10 2 10 6 A10 10 0 0 1 -10 6 C-10 2 -6 -4 0 -14Z" fill="#ffffff" stroke="#5a3a2a" strokeWidth="2" /> },
    { x: CX + 26, el: <rect x="-12" y="-9" width="24" height="18" rx="4" fill="#f7dc7e" stroke="#5a3a2a" strokeWidth="2" /> },
    { x: CX + 58, el: <path d="M0 -10 C4 -3 7 1 7 4 A7 7 0 0 1 -7 4 C-7 1 -4 -3 0 -10Z" fill="#5b331d" stroke="#5a3a2a" strokeWidth="1.5" /> },
  ]
  return (
    <motion.g exit={{ opacity: 0 }}>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${it.x} ${landY - 6})`}>
          <motion.g {...fall(i * 0.16)}>{it.el}</motion.g>
          <Ripple x={0} y={6} delay={i * 0.16 + 0.62} />
        </g>
      ))}
    </motion.g>
  )
}

function Ripple({ x, y, delay }) {
  return (
    <motion.ellipse
      cx={x}
      cy={y}
      rx="14"
      ry="4"
      fill="none"
      stroke="#fff3df"
      strokeWidth="2.5"
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 2.4], opacity: [0.9, 0] }}
      transition={{ duration: 0.7, delay }}
    />
  )
}
