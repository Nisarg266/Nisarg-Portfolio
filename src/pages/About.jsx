import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import { TLink } from '../components/Transition'
import { ArrowRight } from '../components/Icons'
import { usePageMeta } from '../hooks/usePageMeta'
import { APPROACH, EDUCATION, LANGUAGES } from '../lib/data'

/**
 * Dedicated personal page — distinct from the homepage: the refined CV
 * profile, an approach list built only from CV strengths, education
 * timeline and languages.
 */
export default function About() {
  usePageMeta({
    title: 'Nisarg Panchal — About',
    description:
      'About Nisarg Panchal — a creative and motivated Frontend Developer with three months of internship experience building responsive, user-friendly web applications.'
  })

  return (
    <div className="page">
      <section className="section page-hero about-hero" aria-labelledby="about-page-title">
        <div className="orb-static about-orb" aria-hidden="true" />
        <div className="container">
          <SectionHeading title="About" id="about-page-title" />
          <h1 className="page-title">
            <SplitWords text="ABOUT" onScroll={false} />
            <SplitWords text="NISARG" className="outline-text" onScroll={false} delay={0.1} />
          </h1>
          <Reveal delay={0.2}>
            <p className="page-lede">
              Creative and motivated Frontend Developer with three months of
              internship experience in developing responsive and user-friendly
              web applications.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="profile-title">
        <div className="container about-grid">
          <div>
            <SectionHeading index="01" title="Profile" id="profile-title" />
            <Reveal>
              <div className="about-copy">
                <p>
                  I&apos;m a <strong>Frontend Developer</strong> working with{' '}
                  <strong>HTML, CSS, JavaScript and React</strong> — three
                  internships in, and focused on the craft: responsive layouts,
                  accessible markup, performance and debugging.
                </p>
                <p>
                  I&apos;ve worked with <strong>APIs</strong> and{' '}
                  <strong>Git / GitHub</strong>, learned best practices inside
                  real teams, and I&apos;m happiest collaborating to ship
                  something people actually enjoy using.
                </p>
                <p>
                  Right now I&apos;m deepening my <strong>React.js</strong>{' '}
                  practice — this site is part of that.
                </p>
              </div>
            </Reveal>
          </div>

          <div>
            <SectionHeading index="02" title="My Approach" id="approach-title" />
            <div className="approach-list">
              {APPROACH.map((item, i) => (
                <Reveal key={item} delay={i * 0.03}>
                  <div className="approach-row">
                    <span className="preview-index mono">0{i + 1}</span>
                    <span className="approach-name">{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="edu-page-title">
        <div className="container">
          <SectionHeading index="03" title="Education" id="edu-page-title" />
          <div className="edu-rows">
            {EDUCATION.map((entry) => (
              <Reveal key={entry.school}>
                <div className="edu-row">
                  <p className="edu-period">{entry.period}</p>
                  <div>
                    <h3 className="edu-school">{entry.school}</h3>
                    <p className="edu-detail">{entry.detail}</p>
                  </div>
                  <span className="edu-badge">Completed</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <ul className="langs">
              <li className="langs-label">Languages</li>
              {LANGUAGES.map((lang) => (
                <li key={lang.name}>
                  {lang.native === lang.name ? lang.name : lang.native}
                  <small>{lang.name}</small>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <TLink className="btn preview-all" to="/experience" label="Experience">
              See my experience <ArrowRight />
            </TLink>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
