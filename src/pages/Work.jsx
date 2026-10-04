import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import WarpHeading from '../components/WarpHeading'
import ProjectShowcase from '../components/ProjectShowcase'
import { usePageMeta } from '../hooks/usePageMeta'
import { PROJECTS } from '../lib/data'

export default function Work() {
  usePageMeta({
    title: 'Nisarg Panchal — Selected Work',
    description:
      'Selected projects by Nisarg Panchal — responsive websites built with HTML, CSS and JavaScript, designed around intuitive interfaces and smooth user experience.'
  })

  return (
    <div className="page">
      <section className="section page-hero" aria-labelledby="work-page-title">
        <div className="container">
          <SectionHeading title="Selected Work" id="work-page-title" />
          <WarpHeading
            as="h1"
            className="page-title"
            id="work-page-title"
            text={"SELECTED\nWORK"}
            outlineLines={[1]}
            fontSize="clamp(2.7rem, 10vw, 8.8rem)"
            fontWeight={600}
            lineHeight={0.96}
            letterSpacing="-0.035em"
            onScroll={false}
          >
            <SplitWords text="SELECTED" onScroll={false} />
            <SplitWords text="WORK" className="outline-text" onScroll={false} delay={0.1} />
          </WarpHeading>
          <Reveal delay={0.2}>
            <p className="page-lede">
              Every project below is real work from my CV — described exactly
              as it was built, placeholders marking where live screenshots
              will go.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <ProjectShowcase projects={PROJECTS} detailed />
        </div>
      </section>
    </div>
  )
}
