import { useEffect, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { usePageMeta } from '../hooks/usePageMeta'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import ProjectVisual from '../components/ProjectVisual'
import { TLink } from '../components/Transition'
import { ArrowRight } from '../components/Icons'
import { PROJECTS } from '../lib/data'

/**
 * Premium case study: full-bleed hero, parallax visual, then a sticky
 * visual story where the frame grows while the CV-supported sections
 * scroll beside it, and a hand-off to the next project.
 */
export default function ProjectDetail() {
  const { slug } = useParams()
  const project = PROJECTS.find((p) => p.slug === slug)
  const storyRef = useRef(null)
  const reduced = useReducedMotion()

  usePageMeta({
    title: project
      ? `Nisarg Panchal — ${project.title}`
      : 'Nisarg Panchal — Selected Work',
    description: project ? project.summary : 'Selected work by Nisarg Panchal.'
  })

  useEffect(() => {
    if (!project || reduced) return undefined
    const ctx = gsap.context(() => {
      const frame = storyRef.current?.querySelector('.pd-frame')
      if (frame) {
        gsap.fromTo(
          frame,
          { scale: 0.9 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: storyRef.current,
              start: 'top 70%',
              end: 'bottom 70%',
              scrub: 0.4
            }
          }
        )
      }
    })
    return () => ctx.revert()
  }, [project, reduced])

  if (!project) return <Navigate to="/work" replace />

  const next =
    PROJECTS.find((p) => p.index !== project.index) ?? null

  return (
    <div className="page">
      <section className="section page-hero pd-hero" aria-labelledby="pd-title">
        <div className="container">
          <TLink className="back-link" to="/work" label="Work">
            ← Selected Work
          </TLink>
          <p className="project-index" style={{ marginTop: '28px' }}>
            PROJECT — {project.index}
          </p>
          <h1 className="page-title" id="pd-title">
            <SplitWords text={project.title} onScroll={false} stagger={0.05} />
          </h1>
          <Reveal delay={0.2}>
            <ul className="project-tech" aria-label="Technologies used">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="page-lede">{project.summary}</p>
          </Reveal>
        </div>
      </section>

      <section className="section pd-visual-section">
        <div className="container">
          <Reveal y={60}>
            <div className="pd-visual" data-cursor="VIEW">
              <ProjectVisual project={project} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section pd-story" ref={storyRef} aria-label="Project story">
        <div className="container pd-story-grid">
          <div className="pd-sticky">
            <div className="pd-frame">
              <ProjectVisual project={project} />
            </div>
          </div>
          <div className="pd-sections">
            <SectionHeading title="Case Study" />
            {project.caseSections.map((section, i) => (
              <Reveal key={section.label} delay={i * 0.05}>
                <div className="pd-block">
                  <p className="kicker">
                    0{i + 1} — {section.label}
                  </p>
                  <p className="pd-body">{section.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {next && (
        <section className="section pd-next" aria-label="Next project">
          <div className="container">
            <Reveal>
              <TLink
                className="pd-next-link"
                to={`/work/${next.slug}`}
                label={next.title}
                data-cursor="OPEN"
              >
                <span>
                  <span className="pd-next-label mono">Next project — {next.index}</span>
                  <span className="pd-next-title">{next.title}</span>
                </span>
                <ArrowRight size={22} />
              </TLink>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  )
}
