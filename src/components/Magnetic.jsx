import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'

/**
 * Magnetic hover wrapper — element drifts toward the cursor and settles back.
 * Disabled for touch devices and reduced motion.
 */
export default function Magnetic({ children, strength = 0.32, as: Tag = 'div', style, ...rest }) {
  const ref = useRef(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return undefined

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength)
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength)
    }
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, strength])

  return (
    <Tag ref={ref} style={{ display: 'inline-block', ...style }} {...rest}>
      {children}
    </Tag>
  )
}
