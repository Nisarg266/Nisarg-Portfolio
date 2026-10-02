import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { prefersReducedMotion } from '../hooks/useMediaQuery'

const STORAGE_KEY = 'nisarg-theme'
const ThemeContext = createContext(null)

const resolve = (pref) =>
  pref === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : pref

/** theme → page background, used for the fallback reveal + meta theme-color */
const BG = { dark: '#000000', light: '#F4F2EC' }

export const useTheme = () => useContext(ThemeContext)

/**
 * Centralized theme state: dark / light / system preference, persisted in
 * localStorage, applied to <html data-theme> with an early inline script
 * (index.html) so the correct theme paints before React loads.
 *
 * toggleTheme(origin?) switches atmosphere with a cinematic circular reveal
 * from the given point — View Transitions API where supported, an expanding
 * atmosphere overlay as the fallback, instant for reduced motion.
 */
export function ThemeProvider({ children }) {
  const [pref, setPref] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark'
    } catch {
      return 'dark'
    }
  })
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || resolve('dark')
  )
  const switching = useRef(false)

  const apply = useCallback((next) => {
    document.documentElement.setAttribute('data-theme', next)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', BG[next])
    setTheme(next)
  }, [])

  // follow the OS while in system mode
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      let stored = 'system'
      try {
        stored = localStorage.getItem(STORAGE_KEY) || 'system'
      } catch {
        /* private mode */
      }
      if (stored === 'system') apply(resolve('system'))
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [apply])

  const setMode = useCallback(
    (mode) => {
      try {
        localStorage.setItem(STORAGE_KEY, mode)
      } catch {
        /* private mode */
      }
      setPref(mode)
      apply(resolve(mode))
    },
    [apply]
  )

  const releaseLock = () =>
    document.documentElement.classList.remove('theme-switching')

  const toggleTheme = useCallback(
    (origin) => {
      if (switching.current) return
      const next = theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* private mode */
      }
      setPref(next)

      const reduced = prefersReducedMotion()
      const x = origin?.x ?? window.innerWidth - 60
      const y = origin?.y ?? 60

      // 1) View Transitions API — true circular reveal of the new theme
      if (document.startViewTransition && !reduced) {
        switching.current = true
        document.documentElement.classList.add('theme-switching')
        const vt = document.startViewTransition(() => apply(next))
        vt.ready
          .then(() => {
            const radius = Math.hypot(
              Math.max(x, window.innerWidth - x),
              Math.max(y, window.innerHeight - y)
            )
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${radius}px at ${x}px ${y}px)`
                ]
              },
              {
                duration: 620,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                pseudoElement: '::view-transition-new(root)'
              }
            )
          })
          .catch(() => {})
        vt.finished
          .then(() => {
            switching.current = false
            releaseLock()
          })
          .catch(() => {
            switching.current = false
            releaseLock()
          })
        return
      }

      // 2) Fallback — an expanding atmosphere overlay in the new theme's
      //    color covers the page, the swap happens underneath, then it fades
      if (!reduced) {
        switching.current = true
        document.documentElement.classList.add('theme-switching')
        const overlay = document.createElement('div')
        overlay.className = 'theme-fallback'
        overlay.style.background = BG[next]
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`
        overlay.style.left = '0'
        overlay.style.top = '0'
        document.body.appendChild(overlay)
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )
        const anim = overlay.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
        )
        anim.onfinish = () => {
          apply(next)
          overlay
            .animate({ opacity: [1, 0] }, { duration: 340, easing: 'ease-out', fill: 'forwards' })
            .addEventListener('finish', () => {
              overlay.remove()
              switching.current = false
              releaseLock()
            })
        }
        return
      }

      // 3) Reduced motion — instant
      apply(next)
    },
    [theme, apply]
  )

  return (
    <ThemeContext.Provider value={{ theme, pref, setTheme: setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
