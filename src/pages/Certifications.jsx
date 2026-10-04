import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import WarpHeading from '../components/WarpHeading'
import { usePageMeta } from '../hooks/usePageMeta'
import { CERTIFICATIONS } from '../lib/data'

/**
 * Premium numbered certification gallery — hover tilts the card,
 * lights its border and surfaces the issuer metadata.
 */
export default function Certifications() {
  usePageMeta({
    title: 'Nisarg Panchal — Certifications',
    description:
      "Certifications earned by Nisarg Panchal — AWS APAC's Solutions Architecture on Forage and Introduction to Artificial Intelligence from Monark University."
  })

  return (
    <div className="page">
      <section className="section page-hero" aria-labelledby="cert-page-title">
        <div className="container">
          <SectionHeading title="Certifications" id="cert-page-title" />
          <WarpHeading
            as="h1"
            className="page-title"
            id="cert-page-title"
            text={"CERTIFIED\nLEARNING"}
            outlineLines={[1]}
            fontSize="clamp(2.7rem, 10vw, 8.8rem)"
            fontWeight={600}
            lineHeight={0.96}
            letterSpacing="-0.035em"
            onScroll={false}
          >
            <SplitWords text="CERTIFIED" onScroll={false} />
            <SplitWords text="LEARNING" className="outline-text" onScroll={false} delay={0.1} />
          </WarpHeading>
          <Reveal delay={0.2}>
            <p className="page-lede">
              Two programs, completed and verified — no invented dates or IDs.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cert-gallery">
            {CERTIFICATIONS.map((cert, i) => (
              <Reveal key={cert.title} delay={i * 0.08}>
                <article className="cert-card">
                  <span className="cert-card-num" aria-hidden="true">
                    {cert.index}
                  </span>
                  <div className="cert-card-body">
                    <h2 className="cert-card-title">{cert.title}</h2>
                    <p className="cert-card-issuer mono">{cert.issuer}</p>
                  </div>
                  <span className="cert-card-meta mono">Certificate — Completed</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
