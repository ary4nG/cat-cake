import { motion } from 'framer-motion'
import CatStage from './CatStage.jsx'
import SpeechBubble from './SpeechBubble.jsx'
import { Paw } from './Doodles.jsx'
import { icon, meta, steps, welcome } from '../data/recipe.js'

function WavyWord({ text, className, offset = 0 }) {
  return (
    <span className={`wavy ${className}`} aria-hidden="true">
      {[...text].map((c, i) => (
        <motion.span
          key={i}
          className="l"
          style={{ '--i': i + offset }}
          initial={{ opacity: 0, y: 40, rotate: -12 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.2 + (i + offset) * 0.04 }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  )
}

export default function Welcome({ onStart }) {
  return (
    <motion.main
      className="welcome"
      exit={{ opacity: 0, y: -30, filter: 'blur(6px)' }}
      transition={{ duration: 0.4 }}
    >
      <div className="welcome-copy">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Paw size={14} /> Chef Mochi’s Little Cake School
        </motion.p>
        <h1 className="title" aria-label={meta.title}>
          <WavyWord text="Strawberry" className="w-berry" />
          <WavyWord text="Chocolate" className="w-choc" offset={10} />
          <WavyWord text="Cake" className="w-cake" offset={19} />
        </h1>
        <motion.p
          className="lede"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          A tiny tabby chef walks you through one real, honest-to-goodness cake in five purr-fect steps.
        </motion.p>
        <motion.ul
          className="meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15 }}
        >
          <li>{meta.serves}</li>
          <li>{meta.time}</li>
          <li>{meta.level}</li>
        </motion.ul>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: 'spring', stiffness: 260, damping: 14 }}
        >
          <button className="btn btn-primary btn-big" onClick={onStart}>
            Let’s bake! <Paw size={20} />
          </button>
        </motion.div>
        <ol className="welcome-steps" aria-label="The five steps">
          {steps.map((s, i) => (
            <motion.li
              key={s.id}
              style={{ '--i': i }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <img src={icon(s.id)} alt="" />
              <span>{s.title}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="welcome-stage">
        <SpeechBubble lines={welcome.lines} />
        <CatStage cat={welcome.cat} alt="Chef Mochi in a chef hat and apron" />
      </div>
    </motion.main>
  )
}
