import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import WarpHeading from '../components/WarpHeading'
import Magnetic from '../components/Magnetic'
import { ArrowUpRight } from '../components/Icons'
import { usePageMeta } from '../hooks/usePageMeta'
import { PROFILE, AVAILABILITY } from '../lib/data'

const LINES = [
  { text: "LET'S BUILD", cls: '' },
  { text: 'SOMETHING', cls: 'outline-text' },
  { text: 'MEANINGFUL.', cls: '' }
]

/** The visual climax of the site — huge statement, huge magnetic CTA. */
export default function Contact() {
  const [copied, setCopied] = useState(false)

  usePageMeta({
    title: 'Nisarg Panchal — Contact',
    description:
      'Get in touch with Nisarg Panchal — frontend developer open for opportunities in frontend development, web design and creative web experiences.'
  })

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page">
      <section className="section page-hero contact" aria-labelledby="contact-page-title">
        <div className="container">
          <SectionHeading title="Contact" id="contact-page-title" />
          <WarpHeading
            as="h1"
            className="contact-title contact-title-page"
            id="contact-page-title"
            text={"LET'S BUILD\nSOMETHING\nMEANINGFUL."}
            outlineLines={[1]}
            fontSize="clamp(2.5rem, 9.5vw, 8.6rem)"
            fontWeight={600}
            lineHeight={0.96}
            letterSpacing="-0.035em"
            onScroll={false}
          >
            {LINES.map((line, i) => (
              <SplitWords
                key={line.text}
                text={line.text}
                className={line.cls}
                onScroll={false}
                delay={i * 0.1}
              />
            ))}
          </WarpHeading>

          <Reveal delay={0.35}>
            <div className="contact-cta-wrap">
              <Magnetic strength={0.38}>
                <a
                  className="btn btn--xl"
                  href={`mailto:${PROFILE.email}`}
                  data-cursor="OPEN"
                >
                  <span className="btn-xl-label">
                    Start a conversation
                    <ArrowUpRight size={16} />
                  </span>
                  <span className="btn-xl-label btn-xl-alt" aria-hidden="true">
                    Say hello
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              </Magnetic>

              <ul className="contact-list">
                <li className="contact-item">
                  <span className="label">Email</span>
                  <a href={`mailto:${PROFILE.email}`} className="link-line">
                    {PROFILE.email}
                  </a>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={copyEmail}
                    aria-live="polite"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </li>
                <li className="contact-item">
                  <span className="label">Phone</span>
                  <a href={`tel:${PROFILE.phone}`} className="link-line">
                    {PROFILE.phoneDisplay}
                  </a>
                </li>
                <li className="contact-item">
                  <span className="label">GitHub</span>
                  <a
                    href={PROFILE.github}
                    target="_blank"
                    rel="noreferrer"
                    className="link-line"
                  >
                    {PROFILE.githubUser} <ArrowUpRight />
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="contact-avail contact-avail-page">
              <span className="label">Available for</span>
              {AVAILABILITY.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
