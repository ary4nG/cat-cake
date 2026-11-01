import { motion } from 'framer-motion'
import { Clock, Paw, Sparkle, Heart } from './Doodles.jsx'
import IngredientShelf from './IngredientShelf.jsx'
import { games } from '../games/index.js'

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
}

function Shell({ children, cardKey }) {
  return (
    <motion.article
      key={cardKey}
      className="card"
      initial={{ opacity: 0, y: 30, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -20, rotate: -1, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
    >
      <span className="tape" aria-hidden="true" />
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}>
        {children}
      </motion.div>
    </motion.article>
  )
}

export function MomentCard({ moment }) {
  return (
    <Shell cardKey={`moment-${moment.cat}`}>
      <motion.header className="card-head" variants={item}>
        <span className="eyebrow">Intermission</span>
        <h2 className="card-title">{moment.title}</h2>
      </motion.header>
      {moment.body.map((p, i) => (
        <motion.p key={i} className="moment-p" variants={item}>
          {p}
        </motion.p>
      ))}
      <motion.div className="moment-hearts" variants={item} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ '--i': i }}>
            <Heart size={26} />
          </span>
        ))}
      </motion.div>
    </Shell>
  )
}

export default function RecipeCard({ step, index, total, checked, onToggle, gathered, onGather, gameWon, onGameComplete }) {
  const Game = step.game && games[step.game]
  return (
    <Shell cardKey={step.id}>
      <motion.header className="card-head" variants={item}>
        <span className="eyebrow">
          Step {index + 1} of {total}
        </span>
        <h2 className="card-title">{step.title}</h2>
        <p className="card-sub">{step.subtitle}</p>
        <span className="time-chip">
          <Clock /> {step.time}
        </span>
      </motion.header>

      {Game && (
        <motion.div variants={item} className="game-slot">
          <Game onComplete={onGameComplete} completed={gameWon} />
        </motion.div>
      )}

      <ol className="instructions">
        {step.instructions.map((text, k) => {
          const done = checked.has(k)
          return (
            <motion.li key={k} variants={item}>
              <button className={`instr ${done ? 'done' : ''}`} onClick={() => onToggle(k)} aria-pressed={done}>
                <motion.span
                  className="num"
                  animate={done ? { scale: [1, 1.3, 1], rotate: [0, 12, 0] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  {done ? <Paw size={15} /> : k + 1}
                </motion.span>
                <span className="txt">{text}</span>
              </button>
            </motion.li>
          )
        })}
      </ol>

      {step.showIngredients && (
        <motion.div variants={item}>
          <IngredientShelf gathered={gathered} onToggle={onGather} />
        </motion.div>
      )}

      {step.tip && (
        <motion.aside className="tip" variants={item}>
          <span className="tip-icon" aria-hidden="true">
            <Sparkle size={18} />
          </span>
          <span>
            <strong>Chef’s secret</strong>
            {step.tip}
          </span>
        </motion.aside>
      )}
    </Shell>
  )
}
