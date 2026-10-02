import { useRef } from 'react'
import { useTheme } from '../theme/ThemeProvider'

/**
 * Premium theme control — a single morphing sun/moon glyph inside a small
 * circular button. The crescent cut and the rays animate between themes;
 * the reveal itself originates from this button's position.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const ref = useRef(null)
  const next = theme === 'dark' ? 'light' : 'dark'

  const onClick = () => {
    const rect = ref.current?.getBoundingClientRect()
    toggleTheme({
      x: rect ? rect.left + rect.width / 2 : window.innerWidth - 60,
      y: rect ? rect.top + rect.height / 2 : 60
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <mask id="tt-mask">
          <rect width="24" height="24" fill="#fff" />
          <circle className="tt-cut" cx="12" cy="12" r="6.5" fill="#000" />
        </mask>
        <circle className="tt-core" cx="12" cy="12" r="5.6" fill="currentColor" mask="url(#tt-mask)" />
        <g
          className="tt-rays"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="2.6" x2="12" y2="5.2" />
          <line x1="12" y1="18.8" x2="12" y2="21.4" />
          <line x1="2.6" y1="12" x2="5.2" y2="12" />
          <line x1="18.8" y1="12" x2="21.4" y2="12" />
          <line x1="5.4" y1="5.4" x2="7.2" y2="7.2" />
          <line x1="16.8" y1="16.8" x2="18.6" y2="18.6" />
          <line x1="18.6" y1="5.4" x2="16.8" y2="7.2" />
          <line x1="7.2" y1="16.8" x2="5.4" y2="18.6" />
        </g>
      </svg>
    </button>
  )
}
