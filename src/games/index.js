// Mini-game registry, keyed by a step's `game` field.
//
// A game is a component that receives `{ onComplete, completed }`. It renders
// inside the step's recipe card above the instructions, and calls
// `onComplete()` once the player finishes, which ticks off the step's
// instructions and cheers. `completed` is true when revisiting a step whose
// game was already won, so the game can open in its finished state.

import WhiskGame from './WhiskGame.jsx'

export const games = {
  mix: WhiskGame,
}
