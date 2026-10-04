import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import WarpHeading from '../components/WarpHeading'
import ProjectShowcase from '../components/ProjectShowcase'
import { TLink } from '../components/Transition'
import { ArrowRight, ArrowUpRight } from '../components/Icons'
import Hero from '../sections/Hero'
import Marquee from '../components/Marquee'
import { usePageMeta } from '../hooks/usePageMeta'
import { PROJECTS, EXPERIENCE, CAPABILITIES, CERTIFICATIONS } from '../lib/data'

function IntroStatement() {
  return (
    <section className="section intro-v2" aria-labelledby="intro-title">
      <div className="intro-aurora" aria-hidden="true">
        <span className="aurora-orb aurora-orb-1" />
        <span className="aurora-orb aurora-orb-2" />
        <span className="aurora-grid" />
      </div>
      <span className="ghost-num" aria-hidden="true">
        01
      </span>
      <div className="container intro-grid">
        <div className="intro-left">
          <SectionHeading index="01" title="Introduction" id="intro-title" />
          <WarpHeading
            as="h2"
            className="intro-big"
            id="intro-title"
            text={"I BUILD DIGITAL\nEXPERIENCES\nTHAT FEEL ALIVE."}
            outlineLines={[1]}
            fontSize="clamp(2.4rem, 7vw, 6.2rem)"
            fontWeight={600}
            lineHeight={1.02}
            letterSpacing="-0.03em"
            onScroll={true}
          >
            <SplitWords text="I BUILD DIGITAL" />
            <SplitWords text="EXPERIENCES" className="outline-text" delay={0.12} />
            <SplitWords text="THAT FEEL ALIVE." delay={0.24} />
          </WarpHeading>
        </div>
        <Reveal delay={0.1} className="intro-side">
          <p className="kicker">Profile</p>
          <p className="intro-side-copy">
            Frontend developer with three months of internship experience
            across three companies — focused on responsive UI, performance,
            accessibility and interfaces that feel as good as they look.
          </p>
          <div className="intro-badges">
            <span className="intro-badge">
              <span className="ib-dot" /> 3+ Verified Internships
            </span>
            <span className="intro-badge">
              <span className="ib-dot" /> 100% Fluid Responsive
            </span>
            <span className="intro-badge">
              <span className="ib-dot" /> React · WebGL · CSS Architecture
            </span>
          </div>
          <TLink className="btn" to="/about" label="About" style={{ marginTop: '6px' }}>
            More about me <ArrowRight />
          </TLink>
        </Reveal>
      </div>
    </section>
  )
}

function WorkPreview() {
  return (
    <section className="section" aria-labelledby="work-title">
      <div className="container">
        <SectionHeading index="02" title="Selected Work" id="work-title" />
        <Reveal>
          <h2 className="section-title visually-hidden" id="work-title">
            Selected Work
          </h2>
          <p className="work-intro">
            A selection of projects where structure, motion and usability had
            to work together — built with the fundamentals done right.
          </p>
        </Reveal>
        <ProjectShowcase projects={PROJECTS} />
        <Reveal>
          <p className="work-note">
            Live links will replace the placeholder frames as each project is published.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function ExperiencePreview() {
  return (
    <section className="section" aria-labelledby="xpv-title">
      <div className="container">
        <SectionHeading index="03" title="Experience" id="xpv-title" />
        <Reveal>
          <h2 className="section-title visually-hidden" id="xpv-title">
            Experience
          </h2>
        </Reveal>
        <div className="preview-list">
          {EXPERIENCE.map((job, i) => (
            <Reveal key={job.company} delay={i * 0.06}>
              <TLink
                className="preview-row"
                to="/experience"
                label="Experience"
                data-cursor="OPEN"
              >
                <span className="preview-index mono">0{i + 1}</span>
                <span className="preview-name">{job.company}</span>
                <span className="preview-meta mono">{job.focus}</span>
                <span className="preview-meta mono">{job.duration}</span>
                <ArrowUpRight />
              </TLink>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <TLink className="btn preview-all" to="/experience" label="Experience">
            Full timeline <ArrowRight />
          </TLink>
        </Reveal>
      </div>
    </section>
  )
}

function CapabilitiesPreview() {
  const [open, setOpen] = useState('frontend')

  return (
    <section className="section" aria-labelledby="cap-title">
      <div className="container">
        <SectionHeading index="04" title="Capabilities" id="cap-title" />
        <Reveal>
          <h2 className="section-title visually-hidden" id="cap-title">
            Capabilities
          </h2>
          <p className="work-intro">
            No invented percentages — the toolkit, grouped by how I use it.
          </p>
        </Reveal>
        <div className="caps">
          {CAPABILITIES.map((group, i) => {
            const isOpen = open === group.id
            return (
              <Reveal key={group.id} delay={i * 0.05}>
                <div className={`cap${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="cap-head"
                    aria-expanded={isOpen}
                    aria-controls={`cap-items-${group.id}`}
                    onClick={() => setOpen(isOpen ? null : group.id)}
                    onMouseEnter={() => setOpen(group.id)}
                  >
                    <span className="cap-index mono">0{i + 1}</span>
                    <span className="cap-label">{group.label}</span>
                    <span className="cap-count mono">{group.items.length} —</span>
                  </button>
                  <div className="cap-items" id={`cap-items-${group.id}`}>
                    <div className="cap-items-inner">
                      <p className="cap-items-text">{group.items.join('  ·  ')}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CertificationsPreview() {
  return (
    <section className="section" aria-labelledby="certpv-title">
      <div className="container">
        <SectionHeading index="05" title="Certifications" id="certpv-title" />
        <Reveal>
          <h2 className="section-title visually-hidden" id="certpv-title">
            Certifications
          </h2>
        </Reveal>
        <div className="preview-list">
          {CERTIFICATIONS.map((cert, i) => (
            <Reveal key={cert.title} delay={i * 0.06}>
              <TLink
                className="preview-row"
                to="/certifications"
                label="Certifications"
                data-cursor="OPEN"
              >
                <span className="preview-index mono">{cert.index}</span>
                <span className="preview-name">{cert.title}</span>
                <span className="preview-meta mono">{cert.issuer}</span>
                <ArrowUpRight />
              </TLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomeCTA() {
  return (
    <section className="section contact" aria-labelledby="home-cta-title">
      <div className="container">
        <SectionHeading index="06" title="Contact" id="home-cta-title" />
        <WarpHeading
          as="h2"
          className="contact-title"
          id="home-cta-title"
          text={"LET'S BUILD\nSOMETHING\nMEANINGFUL."}
          outlineLines={[1]}
          fontSize="clamp(3rem, 11vw, 9.5rem)"
          fontWeight={600}
          lineHeight={0.96}
          letterSpacing="-0.035em"
          onScroll={true}
        >
          <SplitWords text="LET'S BUILD" />
          <SplitWords text="SOMETHING" className="outline-text" delay={0.1} />
          <SplitWords text="MEANINGFUL." delay={0.2} />
        </WarpHeading>
        <Reveal delay={0.15}>
          <div className="contact-row">
            <TLink className="btn btn--lg" to="/contact" label="Contact" data-cursor="OPEN">
              Start a conversation <ArrowRight size={15} />
            </TLink>
            <p className="contact-lede">
              Currently open for opportunities in frontend development,
              web design and creative web experiences.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home({ started }) {
  usePageMeta({
    title: 'Nisarg Panchal — Frontend Developer',
    description:
      'Nisarg Panchal is a Frontend Developer focused on building responsive, interactive and user-friendly digital experiences with HTML, CSS, JavaScript and React.'
  })

  return (
    <div className="page">
      <Hero started={started} />
      <Marquee />
      <IntroStatement />
      <WorkPreview />
      <ExperiencePreview />
      <CapabilitiesPreview />
      <CertificationsPreview />
      <HomeCTA />
    </div>
  )
}
