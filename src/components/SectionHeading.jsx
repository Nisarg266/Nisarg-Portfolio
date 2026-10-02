import Reveal from './Reveal'

/** "01 — ABOUT" kicker row with a fading hairline. */
export default function SectionHeading({ index, title, id }) {
  return (
    <Reveal className="section-head">
      <p className="kicker" id={id}>
        {index ? `${index} — ${title}` : title}
      </p>
    </Reveal>
  )
}
