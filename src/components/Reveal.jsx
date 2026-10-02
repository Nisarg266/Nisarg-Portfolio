import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

/**
 * Scroll-triggered reveal. Children render hidden until scrolled into view;
 * with reduced motion everything is shown immediately.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 44,
  once = true
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (reduced) {
      el.classList.add('is-visible')
      return undefined
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
          onStart: () => el.classList.add('is-visible'),
          scrollTrigger: { trigger: el, start: 'top 86%', once }
        }
      )
    })

    // wall-clock safety: above-fold content must never stay hidden
    const safety = setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight && !el.classList.contains('is-visible')) {
        el.classList.add('is-visible')
        el.style.opacity = '1'
        el.style.transform = 'none'
      }
    }, 2400)

    return () => {
      clearTimeout(safety)
      ctx.revert()
    }
  }, [reduced, delay, y, once])

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}
