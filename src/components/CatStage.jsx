import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, Sparkle } from './Doodles.jsx'
import { art, quips } from '../data/recipe.js'
import { sfx } from '../audio/sound.js'

let burstId = 0

export default function CatStage({ cat, alt, size = 'lg' }) {
  const ref = useRef(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 70, damping: 14 }
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), spring)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), spring)
  const shiftX = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), spring)

  const [bursts, setBursts] = useState([])
  const [quip, setQuip] = useState(null)
  const [squish, setSquish] = useState(0)

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  const pet = (e) => {
    const r = ref.current.getBoundingClientRect()
    const id = ++burstId
    const x = e.clientX ? e.clientX - r.left : r.width / 2
    const y = e.clientY ? e.clientY - r.top : r.height / 3
    const pieces = Array.from({ length: 7 }, (_, i) => ({
      key: `${id}-${i}`,
      x,
      y,
      dx: (Math.random() - 0.5) * 160,
      dy: -60 - Math.random() * 110,
      heart: i % 3 !== 2,
      s: 14 + Math.random() * 12,
    }))
    setBursts((b) => [...b, ...pieces])
    setTimeout(() => setBursts((b) => b.filter((p) => !p.key.startsWith(`${id}-`))), 1300)
    setQuip({ id, text: quips[Math.floor(Math.random() * quips.length)] })
    setTimeout(() => setQuip((q) => (q?.id === id ? null : q)), 2000)
    setSquish((n) => n + 1)
    sfx.pet()
  }

  return (
    <div
      ref={ref}
      className={`stage stage-${size}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div className="stage-tilt" style={{ rotateX, rotateY, x: shiftX }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cat}
            className="stage-frame"
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.22 } }}
            transition={{ type: 'spring', stiffness: 110, damping: 16, mass: 0.9 }}
          >
            <motion.button
              key={squish}
              className="cat-btn"
              onClick={pet}
              aria-label={`${alt}. Pet Chef Mochi`}
              initial={squish ? { scaleX: 1.08, scaleY: 0.9 } : false}
              animate={{ scaleX: 1, scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 9 }}
            >
              <img className="cat-img" src={art(cat)} alt="" draggable={false} />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="stage-fx" aria-hidden="true">
        {bursts.map((b) => (
          <motion.span
            key={b.key}
            className={b.heart ? 'fx-heart' : 'fx-spark'}
            style={{ left: b.x, top: b.y }}
            initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
            animate={{ x: b.dx, y: b.dy, scale: 1, opacity: 0, rotate: b.dx / 4 }}
            transition={{ duration: 1.1, ease: [0.2, 0.7, 0.4, 1] }}
          >
            {b.heart ? <Heart size={b.s} /> : <Sparkle size={b.s} />}
          </motion.span>
        ))}
      </div>

      <AnimatePresence>
        {quip && (
          <motion.div
            key={quip.id}
            className="quip"
            role="status"
            initial={{ opacity: 0, scale: 0.5, y: 10, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 3 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            {quip.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
