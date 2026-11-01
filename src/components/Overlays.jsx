import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Berry, Heart, Paw, Sparkle } from './Doodles.jsx'
import { art, cheers } from '../data/recipe.js'
import { sfx } from '../audio/sound.js'

// Cheering cat that pops up from the corner whenever a step is completed.
export function CheerToast({ trigger }) {
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (!trigger) return
    setShown({ id: trigger, text: cheers[trigger % cheers.length] })
    const s = setTimeout(() => sfx.cheer(), 250)
    const t = setTimeout(() => setShown(null), 2200)
    return () => {
      clearTimeout(t)
      clearTimeout(s)
    }
  }, [trigger])

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown.id}
          className="cheer"
          role="status"
          initial={{ y: 160, rotate: -10, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: 160, rotate: 8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        >
          <img src={art('cheer')} alt="" className="cheer-img" />
          <motion.span
            className="cheer-bubble"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 12 }}
          >
            {shown.text}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// After a while without input, Chef Mochi naps on the rolling pin.
export function SleepyCat({ asleep, onWake }) {
  return (
    <AnimatePresence>
      {asleep && (
        <motion.button
          className="sleepy"
          onClick={onWake}
          aria-label="Chef Mochi fell asleep. Tap to wake"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          <span className="sleepy-art">
            <img src={art('sleep')} alt="" />
            {[0, 1, 2].map((i) => (
              <span key={i} className="zzz" style={{ '--i': i }} aria-hidden="true">
                z
              </span>
            ))}
          </span>
          <span className="sleepy-text">zzz… Chef dozed off. Tap to wake!</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

const PIECES = [Paw, Heart, Sparkle, Berry, Sparkle, Heart]
const COLORS = ['var(--ink-soft)', 'var(--berry)', 'var(--mustard)', null, 'var(--cream)', 'var(--terracotta)']

// One-shot celebratory rain of paws, hearts, sparkles and strawberries.
export function Confetti({ count = 70 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        x: Math.random() * 100,
        dx: (Math.random() - 0.5) * 200,
        r: (Math.random() - 0.5) * 720,
        d: 2.8 + Math.random() * 2.4,
        delay: Math.random() * 0.9,
        s: 14 + Math.random() * 16,
        kind: i % PIECES.length,
      })),
    [count],
  )
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => {
        const Piece = PIECES[p.kind]
        return (
          <span
            key={p.i}
            className="piece"
            style={{
              left: `${p.x}%`,
              color: COLORS[p.kind] ?? undefined,
              '--dx': `${p.dx}px`,
              '--r': `${p.r}deg`,
              '--d': `${p.d}s`,
              '--delay': `${p.delay}s`,
            }}
          >
            <Piece size={p.s} />
          </span>
        )
      })}
    </div>
  )
}
