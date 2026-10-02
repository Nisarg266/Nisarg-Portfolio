import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../hooks/useMediaQuery'

/**
 * Short cinematic intro (≤ 2s): name reveal + counter + bottom progress line,
 * then the whole panel wipes upward into the hero.
 */
export default function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const lettersRef = useRef([])
  const countRef = useRef(null)
  const barRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const doneRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // runs once on mount — never replays on re-render
  useEffect(() => {
    if (prefersReducedMotion() || doneRef.current) return undefined

    const root = rootRef.current
    const letters = lettersRef.current.filter(Boolean)
    const count = { value: 0 }

    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: () => {
        if (doneRef.current) return
        doneRef.current = true
        onCompleteRef.current?.()
      }
    })

    tl.to(letters, { y: 0, duration: 0.9, stagger: 0.028 }, 0.1)
      .to(
        count,
        {
          value: 100,
          duration: 1.25,
          ease: 'power2.inOut',
          onUpdate: () => {
            const el = countRef.current
            if (el) el.textContent = String(Math.round(count.value)).padStart(3, '0')
            const bar = barRef.current
            if (bar) bar.style.transform = `scaleX(${count.value / 100})`
          }
        },
        0.15
      )
      .to(letters, { y: '-120%', duration: 0.55, stagger: 0.02, ease: 'power3.in' }, 1.15)
      .to([countRef.current, '.pre-tag'], { autoAlpha: 0, duration: 0.3 }, 1.3)
      .to(
        root,
        { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power4.inOut' },
        1.55
      )
      .set(root, { display: 'none' })

    // wall-clock safety: if the animation ticker is throttled (hidden tab,
    // low-power mode), never trap the site behind the intro
    const safety = setTimeout(() => tl.progress(1), 3200)

    return () => {
      clearTimeout(safety)
      tl.kill()
    }
  }, [])

  if (prefersReducedMotion()) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <p className="pre-tag">FRONTEND DEVELOPER — PORTFOLIO</p>
      <div className="pre-name" aria-hidden="true">
        {'NISARG PANCHAL'.split('').map((char, i) =>
          char === ' ' ? (
            <span className="pre-space" key={`space-${i}`} />
          ) : (
            <span className="pre-mask" key={`${char}-${i}`}>
              <span
                className="pre-letter"
                ref={(el) => {
                  lettersRef.current[i] = el
                }}
              >
                {char}
              </span>
            </span>
          )
        )}
      </div>
      <div className="pre-count" ref={countRef}>
        000
      </div>
      <div className="pre-bar" ref={barRef} />
    </div>
  )
}
