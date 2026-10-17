import { useLocation } from 'react-router-dom'

/**
 * Quiet ambient backdrop for interior pages — a masked technical grid and
 * two slowly drifting accent glows, fixed behind all content and fully
 * CSS-driven. The home page keeps its own hero environment, so it is
 * skipped there.
 */
export default function PageAmbience() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return (
    <div className="ambience" aria-hidden="true">
      <div className="ambience-grid" />
      <div className="ambience-top" />
      <div className="ambience-orb ambience-orb-1" />
      <div className="ambience-orb ambience-orb-2" />
    </div>
  )
}
