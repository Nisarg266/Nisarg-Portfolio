import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'
import WarpText from './WarpText'

/**
 * Editorial heading with WebGL mouse refraction/warp overlay.
 * Preserves the original DOM structure, layout, typography, and GSAP reveals,
 * transitioning smoothly to the interactive mouse warp canvas once settled.
 */
export default function WarpHeading({
  as: Tag = 'h2',
  className = '',
  id,
  text,
  outlineLines = [1],
  outlineScale = 1,
  fontSize,
  fontWeight = 600,
  letterSpacing = '-0.035em',
  lineHeight = 0.98,
  fontFamily = 'var(--font-display)',
  align = 'left',
  children
}) {
  const headingRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const reduced = useReducedMotion()

  return (
    <Tag
      ref={headingRef}
      className={`warp-heading ${className}${hovered ? ' is-hovered' : ''}${canvasReady ? ' has-canvas' : ''}`.trim()}
      id={id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="wh-dom">
        {children}
      </span>
      {!reduced && (
        <WarpText
          text={text}
          outlineLines={outlineLines}
          outlineScale={outlineScale}
          align={align}
          fitText={false}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          fontFamily={fontFamily}
          warpStrength={0.025}
          warpScale={1.2}
          speed={0.35}
          pointerInfluence={0.35}
          pointerStrength={0.18}
          refraction={0.007}
          ripple
          className="wh-canvas"
          onReady={() => setCanvasReady(true)}
          onError={() => setCanvasReady(false)}
        />
      )}
    </Tag>
  )
}
