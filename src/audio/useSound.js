import { useSyncExternalStore } from 'react'
import { getPrefs, subscribe } from './sound.js'

export default function useSoundPrefs() {
  return useSyncExternalStore(subscribe, getPrefs)
}
