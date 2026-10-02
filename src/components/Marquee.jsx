import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { MARQUEE_ITEMS } from '../lib/data'

function Half() {
  return (
    <div className="marquee-half" aria-hidden="true">
      {MARQUEE_ITEMS.map((item, i) => (
        <span key={item} style={{ display: 'flex', alignItems: 'center' }}>
          <span className={`marquee-item${i % 2 === 1 ? ' is-outline' : ''}`}>{item}</span>
          <span className="marquee-sep" />
        </span>
      ))}
    </div>
  )
}

/**
 * Identity strip — slow infinite drift; hovering gently slows it down
 * instead of stopping it dead.
 */
export default function Marquee() {
  const trackRef = useRef(null)
  const rootRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return undefined

    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      ease: 'none',
      duration: 34,
      repeat: -1
    })

    const root = rootRef.current
    const slow = () => gsap.to(tween, { timeScale: 0.22, duration: 0.7 })
    const normal = () => gsap.to(tween, { timeScale: 1, duration: 0.7 })

    root.addEventListener('mouseenter', slow)
    root.addEventListener('mouseleave', normal)
    return () => {
      root.removeEventListener('mouseenter', slow)
      root.removeEventListener('mouseleave', normal)
      tween.kill()
    }
  }, [reduced])

  return (
    <section className="marquee" ref={rootRef} aria-label="Disciplines">
      <div className="marquee-track" ref={trackRef}>
        <Half />
        <Half />
      </div>
    </section>
  )
}
