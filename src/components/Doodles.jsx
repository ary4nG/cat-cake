// Small hand-drawn-style SVG doodles matching the illustrations.

export const Sparkle = ({ size = 24, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z"
      fill="currentColor"
    />
  </svg>
)

export const Burst = ({ size = 40, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" {...p}>
    <path
      d="M20 0L22.5 14L33 5L25.5 17.5L40 20L25.5 22.5L33 35L22.5 26L20 40L17.5 26L7 35L14.5 22.5L0 20L14.5 17.5L7 5L17.5 14Z"
      fill="currentColor"
    />
  </svg>
)

export const Paw = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <g fill="currentColor">
      <ellipse cx="12" cy="16.2" rx="5.6" ry="4.8" />
      <ellipse cx="4.6" cy="10.4" rx="2.3" ry="2.9" />
      <ellipse cx="9.2" cy="5.6" rx="2.4" ry="3" />
      <ellipse cx="14.8" cy="5.6" rx="2.4" ry="3" />
      <ellipse cx="19.4" cy="10.4" rx="2.3" ry="2.9" />
    </g>
  </svg>
)

export const Heart = ({ size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      d="M12 21C12 21 2 14.5 2 8.2C2 5 4.4 2.8 7.2 2.8C9.3 2.8 11 4 12 5.8C13 4 14.7 2.8 16.8 2.8C19.6 2.8 22 5 22 8.2C22 14.5 12 21 12 21Z"
      fill="currentColor"
    />
  </svg>
)

export const Berry = ({ size = 22, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M12 7C17 7 20 9.5 19 13.5C18 18 14.5 22 12 22C9.5 22 6 18 5 13.5C4 9.5 7 7 12 7Z" fill="#d4554a" stroke="#5a3a2a" strokeWidth="1.4" />
    <path d="M7.5 7.6L9.5 4.5L12 6.5L14.5 4.5L16.5 7.6C14 9 10 9 7.5 7.6Z" fill="#6f9a4e" stroke="#5a3a2a" strokeWidth="1.2" strokeLinejoin="round" />
    <g fill="#ffe7b8">
      <circle cx="9.5" cy="12" r=".8" /><circle cx="14.5" cy="12" r=".8" />
      <circle cx="12" cy="15" r=".8" /><circle cx="9.8" cy="17.5" r=".7" /><circle cx="14.2" cy="17.5" r=".7" />
    </g>
  </svg>
)

export const Clock = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7v5l3.2 2" />
  </svg>
)

export const Arrow = ({ size = 18, flip, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={flip ? { transform: 'scaleX(-1)' } : undefined} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)
