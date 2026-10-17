import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'

/**
 * The hero's designed ENVIRONMENT — the quiet architecture built around
 * the Spline character, split into two stacks that sandwich the canvas:
 *
 *   HeroEnvironmentBase     below the canvas (z0) — tonal base wash and
 *                           the large softbox light with its slow breath
 *   HeroEnvironmentOverlay  above the canvas (z2, under the content) —
 *                           technical grid, editorial guides, grounding
 *                           pool, metadata annotations, vignette
 *
 * Rules this system obeys:
 *   • CSS gradients + pseudo-elements only — no canvas, no particles, no
 *     per-frame animation beyond one tiny parallax lerp writing two CSS
 *     variables (--env-px / --env-py) on the hero section; each layer
 *     reads them at its own amplitude (grid ≈ 2px, softbox ≈ 4px,
 *     metadata ≈ 1.5px)
 *   • the Spline canvas itself is never touched — no filters, opacity or
 *     overlays that could wash the robot out
 *   • detail lives at the edges; the zone around the robot stays clean
 *     so the robot remains the primary interactive object
 *   • annotations state only true facts (no invented places or clients)
 */
export function HeroEnvironmentBase() {
  const rootRef = useRef(null)
  const reduced = useReducedMotion()
  const fine = useFinePointer()

  // tertiary interaction — a few pixels of damped parallax for the
  // environment. The robot (inside the scene) stays the primary response.
  useEffect(() => {
    const root = rootRef.current
    const hero = root && root.closest('.hero')
    if (!hero || reduced || !fine) return undefined

    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf

    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
    }
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.06
      cur.y += (target.y - cur.y) * 0.06
      hero.style.setProperty('--env-px', cur.x.toFixed(4))
      hero.style.setProperty('--env-py', cur.y.toFixed(4))
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
      hero.style.removeProperty('--env-px')
      hero.style.removeProperty('--env-py')
    }
  }, [reduced, fine])

  return (
    <div className="env-base" ref={rootRef}>
      <div className="env-tone" />
      <div className="env-softbox" />
    </div>
  )
}

export function HeroEnvironmentOverlay() {
  return (
    <>
      {/* technical grid — visible only toward the outer edges, the
          robot's zone stays clean (radial mask) */}
      <div className="env-grid" />

      {/* architectural guides — a ruler hairline on the right, a short
          horizontal rule upper-right, two corner marks */}
      <div className="env-guides">
        <i className="env-tick env-tick-tl" />
        <i className="env-tick env-tick-br" />
      </div>

      {/* grounding pool — a soft contact shadow + faint accent light
          that visually seats the robot into the environment */}
      <div className="env-ground" />

      {/* editorial annotations — tiny, monospaced, low opacity; true
          facts only */}
      <div className="env-meta">
        <span className="env-meta-item env-meta-side">Interactive experience</span>
        <span className="env-meta-item env-meta-top">Digital craft — Build / Design / Code</span>
        <span className="env-meta-item env-meta-index">
          <em>01</em> / Frontend
        </span>
      </div>

      {/* vignette — quiet focus toward the name and the robot */}
      <div className="env-vignette" />
    </>
  )
}
