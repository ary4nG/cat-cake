import { motion } from 'framer-motion'
import { Paw } from './Doodles.jsx'
import { ingredientGroups } from '../data/recipe.js'

const total = ingredientGroups.reduce((n, g) => n + g.items.length, 0)

export default function IngredientShelf({ gathered, onToggle }) {
  const count = gathered.size
  return (
    <section className="shelf" aria-label="Ingredients">
      <div className="shelf-head">
        <h3>On the counter</h3>
        <span className="shelf-count">
          {count} / {total}
        </span>
      </div>
      <div className="shelf-bar" aria-hidden="true">
        <motion.span
          className="shelf-bar-fill"
          animate={{ scaleX: count / total }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>

      {ingredientGroups.map((g) => (
        <div className="shelf-group" key={g.id}>
          <h4>{g.title}</h4>
          <ul className="chips">
            {g.items.map((it, i) => {
              const on = gathered.has(it.id)
              return (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.035, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <motion.button
                    className={`ing ${on ? 'on' : ''}`}
                    onClick={() => onToggle(it.id)}
                    aria-pressed={on}
                    whileTap={{ scale: 0.9 }}
                    animate={on ? { rotate: [0, -4, 3, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="ing-check" aria-hidden="true">
                      {on && <Paw size={11} />}
                    </span>
                    <span className="ing-text">
                      <span className="ing-name">{it.name}</span>
                      <span className="ing-amt">{it.amount}</span>
                    </span>
                  </motion.button>
                </motion.li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

IngredientShelf.total = total
