import { setMusic, setSfx } from '../audio/sound.js'
import useSoundPrefs from '../audio/useSound.js'

const Note = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M9 18.5A3 3 0 1 1 7 15.7V4.5L19 2v13.5a3 3 0 1 1-2-2.8V6.6L9 8.3Z" />
  </svg>
)
const Speaker = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
    <path className="wave w1" d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
    <path className="wave w2" d="M18 7a7 7 0 0 1 0 10" />
  </svg>
)

export default function SoundDock() {
  const { music, sfx } = useSoundPrefs()
  return (
    <div className="sound-dock" role="group" aria-label="Sound">
      <button
        className={`sound-btn music ${music ? 'on' : 'off'}`}
        onClick={() => setMusic(!music)}
        aria-pressed={music}
        aria-label="Music"
        title={music ? 'Music on' : 'Music off'}
      >
        <Note />
        <span className="eq" aria-hidden="true">
          <i /><i /><i />
        </span>
      </button>
      <button
        className={`sound-btn sfx ${sfx ? 'on' : 'off'}`}
        onClick={() => setSfx(!sfx)}
        aria-pressed={sfx}
        aria-label="Sound effects"
        title={sfx ? 'Sound effects on' : 'Sound effects off'}
      >
        <Speaker />
      </button>
      {/* phones get a single mute-all toggle */}
      <button
        className={`sound-btn all ${music || sfx ? 'on' : 'off'}`}
        onClick={() => {
          const on = !(music || sfx)
          setMusic(on)
          setSfx(on)
        }}
        aria-pressed={music || sfx}
        aria-label="Sound"
      >
        <Speaker />
      </button>
    </div>
  )
}
