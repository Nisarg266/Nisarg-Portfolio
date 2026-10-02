import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

const TransitionContext = createContext({ navigate: () => {} })
export const useTransition = () => useContext(TransitionContext)

/** Router link that plays the shared page transition before navigating. */
export function TLink({ to, label, onClick, children, ...rest }) {
  const { navigate } = useTransition()
  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        navigate(to, label)
      }}
      {...rest}
    >
      {children}
    </Link>
  )
}

/**
 * Shared page-transition system.
 *
 * The panel is driven purely by CSS transitions on a `cover → reveal` phase
 * class, and the route swap is scheduled with timers — so navigation NEVER
 * depends on GSAP's rAF ticker (a throttled/background view must still
 * change pages). Sequence: panel wipes up → route swaps under cover →
 * panel wipes away. Reduced motion navigates instantly.
 */
export default function TransitionProvider({ children }) {
  const [phase, setPhase] = useState('idle') // idle | cover | reveal
  const [label, setLabel] = useState('')
  const busyRef = useRef(false)
  const timersRef = useRef([])
  const nav = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  const navigate = useCallback(
    (to, toLabel = '') => {
      if (busyRef.current) return
      if (reduced || to === location.pathname) {
        window.scrollTo({ top: 0, behavior: 'instant' })
        nav(to)
        return
      }
      busyRef.current = true
      setLabel(toLabel || (to === '/' ? 'Home' : to.replace('/', '').toUpperCase()))
      setPhase('cover')

      // cover completes → swap the route underneath the panel
      timersRef.current.push(
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' })
          nav(to)
          setPhase('reveal')
          // reveal completes → rest below the viewport with no transition
          timersRef.current.push(
            setTimeout(() => {
              setPhase('idle')
              busyRef.current = false
            }, 720)
          )
        }, 640)
      )
    },
    [nav, reduced, location.pathname]
  )

  // every route change: clean scroll position + recalculate triggers
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh())
    )
    return () => cancelAnimationFrame(id)
  }, [location.pathname])

  const phaseClass =
    phase === 'idle' ? 'is-idle' : phase === 'cover' ? 'is-covering' : 'is-revealing'

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div className={`page-transition ${phaseClass}`} aria-hidden="true">
        <span className="pt-label">{label}</span>
      </div>
    </TransitionContext.Provider>
  )
}
