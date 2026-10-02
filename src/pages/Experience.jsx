import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { usePageMeta } from '../hooks/usePageMeta'
import SectionHeading from '../components/SectionHeading'
import SplitWords from '../components/SplitWords'
import Reveal from '../components/Reveal'
import { EXPERIENCE } from '../lib/data'

/**
 * Full interactive timeline — the line draws itself across the whole page,
 * each company gets a large block and its responsibilities reveal
 * line by line as it becomes current.
 */
export default function Experience() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  const listRef = useRef(null)
  const reduced = useReducedMotion()

  usePageMeta({
    title: 'Nisarg Panchal — Experience',
    description:
      'Internship experience by Nisarg Panchal — TechGlobe Solutions (HTML), 5D WEB Infotech (CSS/JavaScript) and Sahajanand Digital (React.js).'
  })

  useEffect(() => {
    if (reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.4
          }
        }
      )

      gsap.utils.toArray('.xp-item').forEach((item) => {
        gsap.fromTo(
          item.querySelectorAll('.xp-head, .xp-focus'),
          { autoAlpha: 0, y: 46 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 78%', once: true }
          }
        )

        gsap.fromTo(
          item.querySelectorAll('.xp-points li'),
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 62%', once: true }
          }
        )

        ScrollTrigger.create({
          trigger: item,
          start: 'top 55%',
          onEnter: () => item.classList.add('is-active'),
          onLeaveBack: () => item.classList.remove('is-active')
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div className="page">
      <section className="section page-hero" aria-labelledby="xp-page-title">
        <div className="container">
          <SectionHeading title="Experience" id="xp-page-title" />
          <h1 className="page-title">
            <SplitWords text="WHERE I'VE" onScroll={false} />
            <SplitWords text="TRAINED" className="outline-text" onScroll={false} delay={0.1} />
          </h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} ref={sectionRef}>
        <div className="container">
          <div className="xp-wrap xp-wrap-page">
            <div className="xp-line" aria-hidden="true">
              <span ref={lineRef} />
            </div>
            <div className="xp-list" ref={listRef}>
              {EXPERIENCE.map((job, i) => (
                <article className="xp-item" key={job.company}>
                  <span className="xp-dot" aria-hidden="true" />
                  <p className="xp-index mono">0{i + 1}</p>
                  <div className="xp-head">
                    <h2 className="xp-company">{job.company}</h2>
                    <p className="xp-duration">{job.duration}</p>
                  </div>
                  <p className="xp-focus">Focus — {job.focus}</p>
                  <ul className="xp-points">
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <Reveal>
            <p className="work-note" style={{ marginTop: 'clamp(48px, 7vh, 80px)' }}>
              Every role above is drawn straight from my CV — nothing inflated.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
