import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'

/**
 * Custom cursor: precise dot + trailing ring.
 * Ring expands over links/buttons and becomes a labelled disc over
 * [data-cursor] targets. Only active on fine pointers without reduced motion.
 */
export default function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [mode, setMode] = useState('default')
  const [label, setLabel] = useState('')

  const active = fine && !reduced

  useEffect(() => {
    if (!active) return undefined
    const dot = dotRef.current
    const ring = ringRef.current

    document.documentElement.classList.add('has-cursor')
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 1 })

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.14, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.14, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' })

    const onMove = (e) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e) => {
      const target = e.target
      if (!(target instanceof Element)) return
      const labelled = target.closest('[data-cursor]')
      const interactive = target.closest('a, button, input, textarea, select, [role="button"]')
      if (labelled) {
        setMode('label')
        setLabel(labelled.dataset.cursor)
      } else if (interactive) {
        setMode('hover')
        setLabel('')
      } else {
        setMode('default')
        setLabel('')
      }
    }

    const onLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 })
    const onEnter = () => gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 })

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [active])

  if (!active) return null

  return (
    <div className={`cursor cursor--${mode}`} aria-hidden="true">
      <div ref={ringRef} className="cursor-ring">
        {label && <span>{label}</span>}
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
