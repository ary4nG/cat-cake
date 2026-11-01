import { useCallback, useEffect, useRef, useState } from 'react'

// Goes idle after `ms` without input. Once asleep, only a deliberate
// click/tap/key wakes it, so a drifting mouse doesn't startle the cat.
export default function useIdle(ms) {
  const [idle, setIdle] = useState(false)
  const idleRef = useRef(false)
  const timer = useRef()

  const arm = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      idleRef.current = true
      setIdle(true)
    }, ms)
  }, [ms])

  const wake = useCallback(() => {
    idleRef.current = false
    setIdle(false)
    arm()
  }, [arm])

  useEffect(() => {
    const soft = () => !idleRef.current && arm()
    const hard = () => (idleRef.current ? wake() : arm())
    window.addEventListener('pointermove', soft, { passive: true })
    window.addEventListener('scroll', soft, { passive: true })
    window.addEventListener('pointerdown', hard)
    window.addEventListener('keydown', hard)
    arm()
    return () => {
      window.removeEventListener('pointermove', soft)
      window.removeEventListener('scroll', soft)
      window.removeEventListener('pointerdown', hard)
      window.removeEventListener('keydown', hard)
      clearTimeout(timer.current)
    }
  }, [arm, wake])

  return [idle, wake]
}
