import { motion } from 'framer-motion'
import { Paw } from './Doodles.jsx'
import { icon } from '../data/recipe.js'

export default function Stepper({ steps, index, onSelect }) {
  const progress = Math.max(0, index) / (steps.length - 1)
  return (
    <nav className="stepper" aria-label="Recipe steps">
      <div className="stepper-track" aria-hidden="true">
        <motion.div
          className="stepper-fill"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ type: 'spring', stiffness: 60, damping: 16 }}
        />
      </div>
      <ol>
        {steps.map((s, i) => {
          const state = i === index ? 'is-active' : i < index ? 'is-done' : 'is-todo'
          return (
            <li key={s.id}>
              <button
                className={`node ${state}`}
                onClick={() => onSelect(i)}
                aria-current={i === index ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${s.title}`}
              >
                <span className="node-badge">
                  {i === index && (
                    <motion.span
                      layoutId="node-halo"
                      className="node-halo"
                      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                    >
                      <span className="node-halo-ring" />
                    </motion.span>
                  )}
                  <img src={icon(s.id)} alt="" draggable={false} />
                  {i < index && (
                    <motion.span
                      className="node-check"
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    >
                      <Paw size={12} />
                    </motion.span>
                  )}
                </span>
                <span className="node-label">{s.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
