import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import MobileMenu from './MobileMenu'
import ThemeToggle from './ThemeToggle'
import { TLink } from './Transition'
import { ROUTES } from '../lib/data'

/**
 * Floating premium navigation — stacked wordmark left, numbered links right
 * with a sliding accent indicator that glides to the active route.
 * Transparent at the top, condensed glass surface once scrolled,
 * hides on scroll-down and returns on scroll-up.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)
  const linkRefs = useRef({})
  const indicatorRef = useRef(null)
  const location = useLocation()

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // glide the indicator under the active link (instant on first paint,
  // animated afterwards) — resolved defensively via DOM fallback
  const firstRun = useRef(true)
  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    if (!indicator) return
    const active =
      linkRefs.current[location.pathname] ||
      document.querySelector('.nav-link.is-active')

    const place = (el, animate) => {
      const props = { x: el.offsetLeft, width: el.offsetWidth, autoAlpha: 1 }
      if (animate) {
        gsap.to(indicator, { ...props, duration: 0.5, ease: 'power3.out' })
      } else {
        gsap.set(indicator, props)
      }
    }

    if (active) {
      place(active, !firstRun.current)
    } else {
      // links not laid out yet — retry once on the next frame
      const raf = requestAnimationFrame(() => {
        const el =
          linkRefs.current[location.pathname] ||
          document.querySelector('.nav-link.is-active')
        if (el) place(el, false)
        else gsap.to(indicator, { autoAlpha: 0, duration: 0.3 })
      })
      firstRun.current = false
      return () => cancelAnimationFrame(raf)
    }
    firstRun.current = false
  }, [location.pathname, open])

  useEffect(() => {
    let raf = null
    const onScroll = () => {
      if (raf !== null) return
      raf = requestAnimationFrame(() => {
        raf = null
        const y = window.scrollY
        setScrolled(y > 32)
        if (!open) {
          if (y > 480 && y > lastY.current + 6) setHidden(true)
          else if (y < lastY.current - 6 || y < 200) setHidden(false)
        }
        lastY.current = y
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [open])

  const classes = ['nav']
  if (scrolled) classes.push('is-scrolled')
  if (hidden && !open) classes.push('is-hidden')
  if (open) classes.push('is-open')

  return (
    <>
      <header className={classes.join(' ')}>
        <div className="nav-inner">
          <TLink className="brand" to="/" label="Home" aria-label="Nisarg Panchal — home">
            <span className="brand-mark" aria-hidden="true">
              N
            </span>
            <span className="brand-text">
              <strong>NISARG PANCHAL</strong>
              <em>FRONTEND DEVELOPER</em>
            </span>
          </TLink>

          <nav className="nav-links" aria-label="Primary">
            <span className="nav-ind" ref={indicatorRef} aria-hidden="true" />
            {ROUTES.map((route, i) => (
              <TLink
                className={`nav-link${isActive(route.to) ? ' is-active' : ''}`}
                to={route.to}
                label={route.label}
                key={route.to}
                aria-current={isActive(route.to) ? 'page' : undefined}
                ref={(el) => {
                  linkRefs.current[route.to] = el
                }}
              >
                <span className="nl-num" aria-hidden="true">
                  0{i + 1}
                </span>
                {route.label}
              </TLink>
            ))}
          </nav>

          <div className="nav-actions">
            <ThemeToggle />
            <TLink className="btn nav-cta" to="/contact" label="Contact" data-cursor="OPEN">
              Let&apos;s Talk
            </TLink>
            <button
              className={`burger${open ? ' is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
