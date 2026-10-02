import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'
import ProjectVisual from './ProjectVisual'
import { TLink } from './Transition'
import { ArrowRight, ArrowUpRight } from './Icons'

/**
 * Image-dominant project compositions on an asymmetric 12-column grid:
 * the frame takes most of the width, the head overlaps its edge, a ghost
 * number sits behind, and hover zooms the visual while it drifts toward
 * the cursor. Alternating sides create rhythm between projects.
 */
export default function ProjectShowcase({ projects, detailed = false }) {
  const listRef = useRef(null)
  const reduced = useReducedMotion()
  const fine = useFinePointer()

  // cinematic scroll entrance: masked frame reveal + staggered head
  useEffect(() => {
    if (reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.pf').forEach((row) => {
        const frame = row.querySelector('.pf-frame')
        gsap.fromTo(
          frame,
          { clipPath: 'inset(10% 7% 10% 7%)', autoAlpha: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            autoAlpha: 1,
            duration: 1.4,
            ease: 'power4.out',
            scrollTrigger: { trigger: row, start: 'top 78%', once: true }
          }
        )
        gsap.fromTo(
          frame.querySelector('.pv-inner'),
          { scale: 1.12 },
          {
            scale: 1,
            duration: 1.6,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: row, start: 'top 78%', once: true }
          }
        )
        gsap.fromTo(
          row.querySelectorAll('.pf-head > *'),
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 70%', once: true }
          }
        )
      })
    }, listRef)
    return () => ctx.revert()
  }, [reduced, detailed])

  // the frame drifts a few pixels toward the cursor while hovered
  useEffect(() => {
    if (!fine || reduced) return undefined
    const list = listRef.current
    const cleanups = []

    gsap.utils.toArray('.pf', list).forEach((row) => {
      const frame = row.querySelector('.pf-frame')
      if (!frame) return
      const xTo = gsap.quickTo(frame, 'x', { duration: 0.8, ease: 'power3.out' })
      const yTo = gsap.quickTo(frame, 'y', { duration: 0.8, ease: 'power3.out' })
      const onMove = (e) => {
        const rect = row.getBoundingClientRect()
        const nx = (e.clientX - (rect.left + rect.width / 2)) / rect.width
        const ny = (e.clientY - (rect.top + rect.height / 2)) / rect.height
        xTo(nx * 18)
        yTo(ny * 12)
      }
      const onLeave = () => {
        gsap.to(frame, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' })
      }
      row.addEventListener('mousemove', onMove)
      row.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        row.removeEventListener('mousemove', onMove)
        row.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [fine, reduced, detailed])

  return (
    <div className="pf-list" ref={listRef}>
      {projects.map((project, i) => (
        <article
          className={`pf${i % 2 === 1 ? ' alt' : ''}`}
          data-num={`0${i + 1}`}
          key={project.id}
        >
          <TLink
            className="pf-frame corners"
            to={`/work/${project.slug}`}
            label={project.title}
            data-cursor="VIEW PROJECT"
            aria-label={`${project.title} case study`}
          >
            <ProjectVisual project={project} />
            <span className="pf-view mono" aria-hidden="true">
              View project <ArrowUpRight size={12} />
            </span>
          </TLink>

          <div className="pf-head">
            <p className="pf-index mono">PROJECT — {project.index}</p>
            <h3 className="pf-title">
              <TLink to={`/work/${project.slug}`} label={project.title}>
                {project.title}
              </TLink>
            </h3>
            <ul className="pf-tech mono" aria-label="Technologies used">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {detailed && <p className="pf-desc">{project.summary}</p>}
            <TLink
              className="btn pf-cta"
              to={`/work/${project.slug}`}
              label={project.title}
              data-cursor="OPEN"
            >
              Case study <ArrowRight />
            </TLink>
          </div>
        </article>
      ))}
    </div>
  )
}
