import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { sfx } from '../audio/sound.js'

const PAUSE = /[.,!?…—]/
const AUTO_ADVANCE_MS = 3200

// Chef Mochi talks one line at a time with a soft typewriter. Click to finish
// the line or skip ahead; finished lines auto-advance after a beat.
// Remount (via `key`) to restart with new lines.
export default function SpeechBubble({ lines, name = 'Chef Mochi' }) {
  const [i, setI] = useState(0)
  const [n, setN] = useState(0)
  const line = lines[i]
  const typing = n < line.length
  const hasMore = i < lines.length - 1

  useEffect(() => {
    if (!typing) return
    const t = setTimeout(() => {
      setN((v) => v + 1)
      if (/\w/.test(line[n])) sfx.blip()
    }, PAUSE.test(line[n - 1] ?? '') ? 150 : 24)
    return () => clearTimeout(t)
  }, [n, typing, line])

  useEffect(() => {
    if (typing || !hasMore) return
    const t = setTimeout(() => next(), AUTO_ADVANCE_MS)
    return () => clearTimeout(t)
  })

  function next() {
    setI((v) => v + 1)
    setN(0)
  }

  const onClick = () => {
    if (typing) setN(line.length)
    else if (hasMore) next()
  }

  // Words stay unbreakable; each revealed letter fades up on its own.
  let k = 0
  const words = line.split(/(\s+)/).map((tok, w) => {
    if (/^\s+$/.test(tok)) {
      k += tok.length
      return tok
    }
    const start = k
    k += tok.length
    return (
      <span className="word" key={w}>
        {[...tok].map((c, j) => (
          <span key={j} className={start + j < n ? 'ch in' : 'ch'}>
            {c}
          </span>
        ))}
      </span>
    )
  })

  return (
    <motion.button
      className="bubble"
      onClick={onClick}
      aria-label={`${name} says: ${line}`}
      initial={{ opacity: 0, scale: 0.7, y: 12, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
    >
      <span className="bubble-name">{name}</span>
      <motion.span
        key={i}
        className="bubble-text"
        aria-hidden="true"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
      >
        {words}
      </motion.span>
      <span className="bubble-foot" aria-hidden="true">
        <span className="bubble-dots">
          {lines.map((_, d) => (
            <span key={d} className={d === i ? 'dot on' : d < i ? 'dot seen' : 'dot'} />
          ))}
        </span>
        {!typing && hasMore && <span className="bubble-hint">tap ▸</span>}
      </span>
    </motion.button>
  )
}
