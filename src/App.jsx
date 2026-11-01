import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Ambient from './components/Ambient.jsx'
import Welcome from './components/Welcome.jsx'
import Stepper from './components/Stepper.jsx'
import CatStage from './components/CatStage.jsx'
import SpeechBubble from './components/SpeechBubble.jsx'
import RecipeCard, { MomentCard } from './components/RecipeCard.jsx'
import { CheerToast, Confetti, SleepyCat } from './components/Overlays.jsx'
import { Arrow, Paw } from './components/Doodles.jsx'
import { art, icon, steps, welcome } from './data/recipe.js'
import useIdle from './hooks/useIdle.js'
import SoundDock from './components/SoundDock.jsx'
import { sfx, snore } from './audio/sound.js'

const WELCOME = -1
const LAST = steps.length - 1

export default function App() {
  const [index, setIndex] = useState(WELCOME)
  const [moment, setMoment] = useState(null) // an interlude between steps, e.g. the taste test
  const [checked, setChecked] = useState({}) // stepId -> Set of finished instruction indexes
  const [gathered, setGathered] = useState(() => new Set())
  const [gamesWon, setGamesWon] = useState(() => new Set())
  const [cheer, setCheer] = useState(0)
  const [asleep, wake] = useIdle(45000)

  const step = steps[index]

  // Warm the cache so cat swaps never flash.
  useEffect(() => {
    const names = [welcome.cat, 'cheer', 'sleep', ...steps.flatMap((s) => [s.cat, s.after?.cat].filter(Boolean))]
    names.forEach((n) => (new Image().src = art(n)))
    steps.forEach((s) => (new Image().src = icon(s.id)))
  }, [])

  // The cat snores while napping and chirps when woken.
  const wasAsleep = useRef(false)
  useEffect(() => {
    snore(asleep)
    if (wasAsleep.current && !asleep) sfx.mrrp(1.1)
    wasAsleep.current = asleep
  }, [asleep])

  // Grand finale on the last step.
  useEffect(() => {
    if (index === LAST) sfx.fanfare()
  }, [index])

  const goTo = useCallback((i, sound = 'whoosh') => {
    setMoment(null)
    setIndex(i)
    if (sound) sfx[sound]()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const next = useCallback(() => {
    if (index === LAST) {
      setChecked({})
      setGathered(new Set())
      setGamesWon(new Set())
      goTo(WELCOME)
      return
    }
    if (step?.after && !moment) {
      setMoment(step.after)
      sfx.whoosh()
      setTimeout(() => sfx.purr(1.8), 300)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setCheer((c) => c + 1)
    goTo(index + 1, 'stepUp')
  }, [index, step, moment, goTo])

  const back = useCallback(() => {
    if (moment) {
      setMoment(null)
      sfx.whoosh()
    } else goTo(index - 1)
  }, [moment, index, goTo])

  const start = () => {
    sfx.pop()
    setTimeout(() => sfx.meow(1.1), 120)
    goTo(0, null)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (index === WELCOME || e.target.closest('input, textarea')) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, next, back])

  const toggleInstr = (k) => {
    const s = new Set(checked[step.id])
    if (s.has(k)) {
      s.delete(k)
      sfx.untick()
    } else {
      s.add(k)
      sfx.tick()
    }
    setChecked((c) => ({ ...c, [step.id]: s }))
  }

  const toggleGather = (id) => {
    const s = new Set(gathered)
    if (s.has(id)) {
      s.delete(id)
      sfx.plunk()
    } else {
      sfx.plink(s.size)
      s.add(id)
    }
    setGathered(s)
  }

  const stepChecked = (step && checked[step.id]) || new Set()
  const ready = step && stepChecked.size === step.instructions.length
  const nextLabel = moment
    ? moment.next
    : index === LAST
      ? 'Bake again'
      : `Next: ${steps[index + 1]?.title}`

  return (
    <>
      <Ambient />
      <div className="app">
        <AnimatePresence mode="wait">
          {index === WELCOME ? (
            <Welcome key="welcome" onStart={start} />
          ) : (
            <motion.div
              key="kitchen"
              className="kitchen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <header className="topbar">
                <button className="brand" onClick={() => goTo(WELCOME)} aria-label="Back to the start">
                  <span className="brand-mark">
                    <Paw size={20} />
                  </span>
                  <span className="brand-name">
                    Chef Mochi’s <em>Kitchen</em>
                  </span>
                </button>
                <Stepper steps={steps} index={index} onSelect={(i) => goTo(i)} />
              </header>

              <main className="scene">
                <section className="stage-col" aria-label="Chef Mochi">
                  <SpeechBubble key={moment ? `${step.id}-after` : step.id} lines={moment ? moment.lines : step.lines} />
                  <CatStage cat={moment ? moment.cat : step.cat} alt={`Chef Mochi: ${moment ? moment.title : step.title}`} />
                </section>

                <section className="card-col">
                  <AnimatePresence mode="wait">
                    {moment ? (
                      <MomentCard key="moment" moment={moment} />
                    ) : (
                      <RecipeCard
                        key={step.id}
                        step={step}
                        index={index}
                        total={steps.length}
                        checked={stepChecked}
                        onToggle={toggleInstr}
                        gathered={gathered}
                        onGather={toggleGather}
                        gameWon={gamesWon.has(step.id)}
                        onGameComplete={() => {
                          setChecked((c) => ({ ...c, [step.id]: new Set(step.instructions.keys()) }))
                          setGamesWon((g) => new Set(g).add(step.id))
                          setCheer((c) => c + 1)
                        }}
                      />
                    )}
                  </AnimatePresence>
                </section>
              </main>

              <nav className="navbar" aria-label="Step navigation">
                <button className="btn btn-ghost" onClick={back} disabled={index === 0 && !moment}>
                  <Arrow flip /> Back
                </button>
                <motion.button
                  key={nextLabel}
                  className={`btn btn-primary ${ready || moment || index === LAST ? 'ready' : ''}`}
                  onClick={next}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  {nextLabel} {index === LAST && !moment ? <Paw size={18} /> : <Arrow />}
                </motion.button>
              </nav>

              {index === LAST && <Confetti key="confetti" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CheerToast trigger={cheer} />
      <SleepyCat asleep={asleep} onWake={wake} />
      <SoundDock />
    </>
  )
}
