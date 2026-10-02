import { useEffect } from 'react'
import { TLink } from './Transition'
import { useScrollLock } from '../hooks/useScrollLock'
import { ROUTES, PROFILE } from '../lib/data'

/**
 * Full-screen overlay menu. Visibility and the clip wipe are driven by the
 * `is-open` class + CSS transitions so the menu never depends on the
 * animation ticker to appear; links stagger in after the wipe.
 */
export default function MobileMenu({ open, onClose }) {
  useScrollLock(open)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={`mobile-menu${open ? ' is-open' : ''}`}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={open ? undefined : true}
    >
      <nav className="mm-links" aria-label="Menu navigation">
        {ROUTES.map((route, i) => (
          <div className="mm-item" key={route.to}>
            <TLink
              className="mm-link"
              to={route.to}
              label={route.label}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
            >
              <span className="mm-index">0{i + 1}</span>
              {route.label}
            </TLink>
          </div>
        ))}
      </nav>
      <div className="mm-meta">
        <a href={`mailto:${PROFILE.email}`} tabIndex={open ? 0 : -1}>
          {PROFILE.email}
        </a>
        <a href={PROFILE.github} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>
          GITHUB — {PROFILE.githubUser}
        </a>
        <a href={`tel:${PROFILE.phone}`} tabIndex={open ? 0 : -1}>
          {PROFILE.phoneDisplay}
        </a>
      </div>
    </div>
  )
}
