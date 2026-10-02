import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

/**
 * Masked word-by-word text reveal. `onScroll` waits for the element to enter
 * the viewport; otherwise it plays on mount (page entrances).
 */
export default function SplitWords({
  text,
  className = '',
  as: Tag = 'span',
  onScroll = true,
  delay = 0,
  stagger = 0.04
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return undefined
    const words = el.querySelectorAll('.sw > span')
    gsap.set(words, { yPercent: 115 })

    if (!onScroll) {
      const tween = gsap.to(words, {
        yPercent: 0,
        duration: 1.05,
        stagger,
        delay: delay + 0.15,
        ease: 'power4.out'
      })
      const safety = setTimeout(() => tween.progress(1), 3200)
      return () => clearTimeout(safety)
    }

    const ctx = gsap.context(() => {
      gsap.to(words, {
        yPercent: 0,
        duration: 1.05,
        stagger,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 84%', once: true }
      })
    })
    return () => ctx.revert()
  }, [reduced, onScroll, delay, stagger, text])

  return (
    <Tag ref={ref} className={className}>
      {text.split(' ').map((word, i, arr) => (
        <span className="sw" key={`${word}-${i}`}>
          <span>{word}</span>
          {i < arr.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  )
}
