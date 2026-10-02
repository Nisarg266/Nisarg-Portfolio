/**
 * Editorial "cover" placeholder — designed to look like a luxury magazine
 * frame awaiting the real screenshot (which it clearly labels). Line art
 * uses theme tokens so it reads correctly in dark and light.
 */
function ProjectArt({ variant }) {
  if (variant === 'furniture') {
    return (
      <svg className="pv-art" viewBox="0 0 220 130" fill="none" aria-hidden="true">
        <path
          className="art-line"
          d="M42 66V48a13 13 0 0 1 13-13h110a13 13 0 0 1 13 13v18"
          strokeWidth="2.25"
        />
        <rect className="art-line" x="34" y="66" width="152" height="27" rx="13.5" strokeWidth="2.25" />
        <path className="art-soft" d="M110 66v27" strokeWidth="1.5" />
        <path className="art-acc" d="M62 50h46" strokeWidth="1.5" strokeLinecap="round" />
        <path
          className="art-line"
          d="M34 72h-10a9.5 9.5 0 0 0-9.5 9.5V88a9.5 9.5 0 0 0 9.5 9.5H34M186 72h10a9.5 9.5 0 0 1 9.5 9.5V88a9.5 9.5 0 0 1-9.5 9.5h-10"
          strokeWidth="2.25"
        />
        <path className="art-acc" d="M50 99v11M170 99v11" strokeWidth="2.25" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg className="pv-art" viewBox="0 0 220 130" fill="none" aria-hidden="true">
      <rect className="art-line" x="36" y="14" width="148" height="94" rx="9" strokeWidth="2.25" />
      <path className="art-line" d="M36 36h148" strokeWidth="2.25" />
      <circle className="art-acc" cx="49" cy="25" r="2.8" strokeWidth="1.5" />
      <circle className="art-soft" cx="60" cy="25" r="2.8" strokeWidth="1.5" />
      <circle className="art-soft" cx="71" cy="25" r="2.8" strokeWidth="1.5" />
      <rect className="art-acc" x="50" y="50" width="62" height="36" rx="5" strokeWidth="1.75" />
      <path
        className="art-soft"
        d="M126 56h44M126 66h36M126 76h44"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path className="art-line" d="M50 92h46" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export default function ProjectVisual({ project }) {
  return (
    <div
      className="pv"
      role="img"
      aria-label={`Placeholder frame for ${project.title} — replace with a real screenshot of the project`}
    >
      <div className="pv-inner">
        <span className="pv-label mono">PREVIEW — {project.index}</span>
        <span className="pv-watermark" aria-hidden="true">
          {project.title}
        </span>
        <ProjectArt variant={project.variant} />
      </div>
      <span className="pv-tag mono">Screenshot placeholder</span>
    </div>
  )
}
