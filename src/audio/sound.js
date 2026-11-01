// Chef Mochi's sound engine.
//
// Music: the ragtime track, routed through Web Audio so it can fade and duck.
// SFX: synthesized on the fly (no files) so they're instant and tiny.
// Nothing makes a sound until the first user gesture unlocks audio.

const MUSIC_URL = '/audio/ragtime.mp3'
const MUSIC_VOL = 0.3
const PREFS_KEY = 'mochi-sound'

let ctx = null
let sfxBus = null
let musicGain = null
let musicEl = null
let noiseBuf = null
let unlocked = false
let duckTimer = null

// ── preferences (shared with React via subscribe/getPrefs) ──────────────
const listeners = new Set()
let prefs = { music: true, sfx: true }
try {
  prefs = { ...prefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
} catch {}

const emit = () => listeners.forEach((l) => l())
export const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))
export const getPrefs = () => prefs

function savePrefs(next) {
  prefs = { ...prefs, ...next }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {}
  emit()
}

export function setMusic(on) {
  savePrefs({ music: on })
  if (!unlocked) return
  if (on) startMusic()
  else fadeMusic(0, 0.6, () => musicEl?.pause())
}

export function setSfx(on) {
  savePrefs({ sfx: on })
  if (on) sfx.pop()
}

// ── setup ───────────────────────────────────────────────────────────────
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.7
    const comp = ctx.createDynamicsCompressor()
    sfxBus.connect(comp).connect(ctx.destination)

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

    musicEl = new Audio(MUSIC_URL)
    musicEl.loop = true
    musicEl.preload = 'auto'
    musicGain = ctx.createGain()
    musicGain.gain.value = 0
    ctx.createMediaElementSource(musicEl).connect(musicGain).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  if (!unlocked) {
    unlocked = true
    if (prefs.music) startMusic()
  }
}

if (typeof window !== 'undefined') {
  const first = () => unlock()
  window.addEventListener('pointerdown', first, { once: true })
  window.addEventListener('keydown', first, { once: true })
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend()
    else ctx.resume()
  })
}

function startMusic() {
  if (!musicEl) return
  musicEl.play().catch(() => {})
  fadeMusic(MUSIC_VOL, 1.5)
}

function fadeMusic(to, secs, done) {
  if (!musicGain) return
  const g = musicGain.gain
  const t = ctx.currentTime
  g.cancelScheduledValues(t)
  g.setValueAtTime(g.value, t)
  g.linearRampToValueAtTime(to, t + secs)
  if (done) setTimeout(done, secs * 1000)
}

// Briefly lower the music so a big moment can shine.
export function duck(level = 0.35, holdMs = 1800) {
  if (!musicGain || !prefs.music) return
  clearTimeout(duckTimer)
  fadeMusic(MUSIC_VOL * level, 0.25)
  duckTimer = setTimeout(() => fadeMusic(MUSIC_VOL, 1.2), holdMs)
}

// Hold the music low (e.g. while the cat naps) until released.
export function hush(on) {
  if (!musicGain || !prefs.music) return
  clearTimeout(duckTimer)
  fadeMusic(on ? MUSIC_VOL * 0.25 : MUSIC_VOL, on ? 2 : 1)
}

// ── synth helpers ───────────────────────────────────────────────────────
const ready = () => ctx && prefs.sfx && ctx.state === 'running'

function env(g, t, vol, attack, dur) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
}

function tone({ freq, to, type = 'sine', dur = 0.2, vol = 0.15, attack = 0.005, when = 0, out = sfxBus }) {
  const t = ctx.currentTime + when
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.9)
  env(g, t, vol, attack, dur)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function noise({ dur = 0.2, vol = 0.1, freq = 1000, to, q = 1, type = 'bandpass', attack = 0.01, when = 0 }) {
  const t = ctx.currentTime + when
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  s.loop = true
  const f = ctx.createBiquadFilter()
  f.type = type
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = ctx.createGain()
  env(g, t, vol, attack, dur)
  s.connect(f).connect(g).connect(sfxBus)
  s.start(t, Math.random() * 0.5)
  s.stop(t + dur + 0.05)
}

// a soft marimba-ish note: fundamental + quiet octave
function mallet(freq, when = 0, vol = 0.14, dur = 0.45) {
  tone({ freq, dur, vol, when })
  tone({ freq: freq * 2, dur: dur * 0.5, vol: vol * 0.35, when })
  tone({ freq: freq * 4, dur: 0.06, vol: vol * 0.15, when, type: 'triangle' })
}

// C major pentatonic, a few octaves
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093]

let lastBlip = 0
let lastSwish = 0
let lastClink = 0

// ── the sound effects ───────────────────────────────────────────────────
export const sfx = {
  // speech: a tiny "animal-crossing" voice blip per letter
  blip() {
    if (!ready()) return
    const now = performance.now()
    if (now - lastBlip < 55) return
    lastBlip = now
    const f = SCALE[Math.floor(Math.random() * 5)] * 0.9
    tone({ freq: f, to: f * 1.12, type: 'triangle', dur: 0.06, vol: 0.045, attack: 0.004 })
  },

  pop() {
    if (!ready()) return
    tone({ freq: 380, to: 1100, dur: 0.09, vol: 0.16 })
    noise({ dur: 0.03, vol: 0.04, freq: 3000, q: 2 })
  },

  // ingredient onto the counter: rising notes as the counter fills
  plink(n = 0) {
    if (!ready()) return
    mallet(SCALE[n % SCALE.length], 0, 0.13, 0.5)
  },
  plunk() {
    if (!ready()) return
    mallet(392, 0, 0.1, 0.25)
  },

  tick() {
    if (!ready()) return
    mallet(1046.5, 0, 0.1, 0.25)
    mallet(1567.98, 0.07, 0.09, 0.35)
  },
  untick() {
    if (!ready()) return
    mallet(587.33, 0, 0.08, 0.2)
  },

  whoosh() {
    if (!ready()) return
    noise({ dur: 0.35, vol: 0.07, freq: 400, to: 2400, q: 1.2, attack: 0.12 })
  },

  // step forward: bright little arpeggio
  stepUp() {
    if (!ready()) return
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => mallet(f, i * 0.08, 0.11, 0.5))
  },

  sparkle(count = 6, when = 0) {
    if (!ready()) return
    for (let i = 0; i < count; i++) {
      const f = SCALE[5 + Math.floor(Math.random() * 6)] * 1.5
      tone({ freq: f, dur: 0.25, vol: 0.05, when: when + i * 0.06 + Math.random() * 0.03 })
    }
  },

  // a synthesized "mew": sawtooth through vowel-ish formants with a pitch arc
  meow(pitch = 1) {
    if (!ready()) return
    const t = ctx.currentTime
    const dur = 0.55
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(430 * pitch, t)
    o.frequency.linearRampToValueAtTime(760 * pitch, t + 0.13)
    o.frequency.linearRampToValueAtTime(640 * pitch, t + 0.3)
    o.frequency.exponentialRampToValueAtTime(390 * pitch, t + dur)
    const vib = ctx.createOscillator()
    const vibAmt = ctx.createGain()
    vib.frequency.value = 7
    vibAmt.gain.value = 10 * pitch
    vib.connect(vibAmt).connect(o.frequency)

    const f1 = ctx.createBiquadFilter()
    f1.type = 'bandpass'
    f1.Q.value = 5
    f1.frequency.setValueAtTime(800, t)
    f1.frequency.linearRampToValueAtTime(1500, t + 0.15)
    f1.frequency.linearRampToValueAtTime(950, t + dur)
    const f2 = ctx.createBiquadFilter()
    f2.type = 'bandpass'
    f2.Q.value = 8
    f2.frequency.value = 2700
    const f2g = ctx.createGain()
    f2g.gain.value = 0.35

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.5, t + 0.06)
    g.gain.setValueAtTime(0.45, t + 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)

    o.connect(f1).connect(g)
    o.connect(f2).connect(f2g).connect(g)
    g.connect(sfxBus)
    o.start(t)
    vib.start(t)
    o.stop(t + dur + 0.05)
    vib.stop(t + dur + 0.05)
  },

  // a quick rolling "mrrp?" chirp
  mrrp(pitch = 1) {
    if (!ready()) return
    const t = ctx.currentTime
    const dur = 0.3
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.setValueAtTime(320 * pitch, t)
    o.frequency.exponentialRampToValueAtTime(560 * pitch, t + dur)
    const am = ctx.createGain()
    am.gain.value = 0.5
    const trill = ctx.createOscillator()
    trill.type = 'square'
    trill.frequency.value = 30
    const trillAmt = ctx.createGain()
    trillAmt.gain.setValueAtTime(0.5, t)
    trillAmt.gain.linearRampToValueAtTime(0, t + 0.16)
    trill.connect(trillAmt).connect(am.gain)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1800
    const g = ctx.createGain()
    env(g, t, 0.5, 0.02, dur)
    o.connect(am).connect(lp).connect(g).connect(sfxBus)
    o.start(t)
    trill.start(t)
    o.stop(t + dur + 0.05)
    trill.stop(t + dur + 0.05)
  },

  purr(secs = 1.3) {
    if (!ready()) return
    const t = ctx.currentTime
    const s = ctx.createBufferSource()
    s.buffer = noiseBuf
    s.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 320
    const am = ctx.createGain()
    am.gain.value = 0.5
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 24
    const lfoAmt = ctx.createGain()
    lfoAmt.gain.value = 0.5
    lfo.connect(lfoAmt).connect(am.gain)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(0.5, t + 0.2)
    g.gain.setValueAtTime(0.5, t + secs - 0.4)
    g.gain.linearRampToValueAtTime(0.0001, t + secs)
    s.connect(lp).connect(am).connect(g).connect(sfxBus)
    s.start(t)
    lfo.start(t)
    s.stop(t + secs + 0.05)
    lfo.stop(t + secs + 0.05)
  },

  // petting the cat: a random chirp, sometimes with a purr
  pet() {
    const r = Math.random()
    if (r < 0.45) sfx.mrrp(0.9 + Math.random() * 0.3)
    else sfx.meow(1 + Math.random() * 0.25)
    if (Math.random() < 0.4) setTimeout(() => sfx.purr(), 350)
  },

  // whisking: short filtered-noise swishes, louder and brighter when fast
  swish(intensity = 0.5) {
    if (!ready()) return
    const now = performance.now()
    if (now - lastSwish < 70) return
    lastSwish = now
    const i = Math.min(1, intensity)
    noise({ dur: 0.12, vol: 0.05 + i * 0.09, freq: 900 + i * 1800, q: 1.4, attack: 0.03 })
  },
  // whisk tapping the side of the bowl
  clink() {
    if (!ready()) return
    const now = performance.now()
    if (now - lastClink < 180) return
    lastClink = now
    tone({ freq: 2350, dur: 0.18, vol: 0.05 })
    tone({ freq: 3720, dur: 0.12, vol: 0.03 })
  },
  splash() {
    if (!ready()) return
    tone({ freq: 700 + Math.random() * 400, to: 1800, dur: 0.06, vol: 0.05 })
  },
  plop(when = 0) {
    if (!ready()) return
    tone({ freq: 160, to: 620, dur: 0.14, vol: 0.22, when })
    noise({ dur: 0.08, vol: 0.04, freq: 700, q: 1, when })
  },
  glug() {
    if (!ready()) return
    for (let i = 0; i < 6; i++) tone({ freq: 190 + (i % 2) * 40, to: 380, dur: 0.11, vol: 0.16, when: 0.3 + i * 0.13 })
    noise({ dur: 0.9, vol: 0.035, freq: 1400, q: 0.7, attack: 0.2, when: 0.25 })
  },
  phaseDone() {
    if (!ready()) return
    mallet(783.99, 0, 0.12)
    mallet(1174.66, 0.1, 0.12, 0.6)
  },
  gameWon() {
    if (!ready()) return
    duck(0.4, 1600)
    ;[523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => mallet(f, i * 0.07, 0.12, 0.6))
    sfx.sparkle(8, 0.35)
    setTimeout(() => sfx.meow(1.2), 450)
  },

  // little "yay!" when the cheering cat pops up
  cheer() {
    if (!ready()) return
    sfx.sparkle(5)
    setTimeout(() => sfx.mrrp(1.25), 120)
  },

  // the grand finale: a ragtime-flavoured flourish
  fanfare() {
    if (!ready()) return
    duck(0.3, 2800)
    const notes = [392, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5]
    const times = [0, 0.1, 0.2, 0.3, 0.45, 0.55, 0.7]
    notes.forEach((f, i) => {
      tone({ freq: f, type: 'triangle', dur: i === notes.length - 1 ? 0.9 : 0.2, vol: 0.13, when: times[i] })
      mallet(f, times[i], 0.06, 0.3)
    })
    sfx.sparkle(12, 0.7)
    setTimeout(() => sfx.meow(1.15), 1100)
  },
}

// ── snoring (loops while the cat naps) ─────────────────────────────────
let snoreTimer = null
function snoreOnce() {
  if (!ready()) return
  const t = ctx.currentTime
  const s = ctx.createBufferSource()
  s.buffer = noiseBuf
  s.loop = true
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 2
  f.frequency.setValueAtTime(300, t)
  f.frequency.linearRampToValueAtTime(650, t + 1.3)
  f.frequency.linearRampToValueAtTime(260, t + 3)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.09, t + 1.3) // inhale
  g.gain.linearRampToValueAtTime(0.02, t + 1.5)
  g.gain.linearRampToValueAtTime(0.06, t + 1.8) // exhale
  g.gain.linearRampToValueAtTime(0.0001, t + 3)
  s.connect(f).connect(g).connect(sfxBus)
  s.start(t)
  s.stop(t + 3.1)
}
export function snore(on) {
  clearInterval(snoreTimer)
  hush(on)
  if (on) {
    snoreOnce()
    snoreTimer = setInterval(snoreOnce, 3400)
  }
}
