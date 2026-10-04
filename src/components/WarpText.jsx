import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl'
import './WarpText.css'

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  // Pure circular liquid ripple without any vertical or directional translation bias:
  float rippleWave = sin(dist * 34.0 - time * 4.5);
  vec2 pointerWarp = dir * rippleWave * lens * uPointerStrength * 0.016;

  vec2 displaced = uv + pointerWarp;
  vec2 splitDir = dist > 0.0001 ? dir : vec2(0.0);
  vec2 split = splitDir * uRefraction * 0.032 * lens;

  vec4 base = sampleText(displaced);
  vec4 rSample = sampleText(displaced + split);
  vec4 bSample = sampleText(displaced - split);

  // Preserve core glyph alpha and color so thin strokes never disappear!
  float a = max(base.a, max(rSample.a, bSample.a));
  vec3 rgbSplit = vec3(rSample.r, base.g, bSample.b);
  vec3 color = mix(base.rgb, rgbSplit, clamp(lens * 1.35, 0.0, 0.9));
  color += lens * a * 0.05;

  fragColor = vec4(color, a);
}
`

const getFontValue = (value) => (typeof value === 'number' ? `${value}px` : value)

const measureLine = (ctx, line, letterSpacing) => {
  const chars = Array.from(line)
  const textWidth = chars.reduce((width, char) => width + ctx.measureText(char).width, 0)
  return textWidth + Math.max(0, chars.length - 1) * letterSpacing
}

const drawLine = (ctx, line, x, y, letterSpacing, align = 'center', isOutline = false) => {
  if (typeof ctx.letterSpacing === 'string' && letterSpacing !== 0) {
    ctx.letterSpacing = `${letterSpacing}px`
  }

  if (ctx.letterSpacing !== undefined) {
    if (isOutline) {
      ctx.strokeText(line, x, y)
    } else {
      ctx.fillText(line, x, y)
    }
  } else {
    const chars = Array.from(line)
    const lineWidth = measureLine(ctx, line, letterSpacing)
    let cursor = align === 'left' ? x : align === 'right' ? x - lineWidth : x - lineWidth / 2

    chars.forEach((char, index) => {
      if (isOutline) {
        ctx.strokeText(char, cursor, y)
      } else {
        ctx.fillText(char, cursor, y)
      }
      cursor += ctx.measureText(char).width + (index === chars.length - 1 ? 0 : letterSpacing)
    })
  }
}

const buildTextCanvas = ({ container, width, height, dpr, props }) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Read live computed styles from the heading parent in the DOM
  const parent =
    container.closest('.warp-heading') ||
    container.closest('.hero-name') ||
    container.parentElement ||
    container
  const computed = window.getComputedStyle(parent)

  let fontSizePx = parseFloat(computed.fontSize) || 80
  if (typeof props.fontSize === 'number') {
    fontSizePx = props.fontSize
  }

  const fontFamily = computed.fontFamily || 'var(--font-display)'
  const fontWeight = computed.fontWeight || String(props.fontWeight || '700')
  let letterSpacing = computed.letterSpacing === 'normal' ? 0 : parseFloat(computed.letterSpacing) || 0
  let lineHeight = parseFloat(computed.lineHeight)
  if (!Number.isFinite(lineHeight)) {
    lineHeight = fontSizePx * (typeof props.lineHeight === 'number' ? props.lineHeight : 0.94)
  }

  const isLight = document.documentElement.getAttribute('data-theme') === 'light'
  const computedColor = computed.color || (isLight ? '#111317' : '#f4f2ec')
  const outlineColor = isLight ? 'rgba(17, 19, 23, 0.85)' : 'rgba(244, 242, 236, 0.85)'

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = computedColor
  ctx.strokeStyle = outlineColor
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const lines = String(props.text || '').split('\n')
  const align = props.align || 'center'
  const outlineLines = props.outlineLines || []
  const outlineScale = props.outlineScale ?? 1

  const applyFont = (scale = 1) => {
    ctx.font = `${fontWeight} ${fontSizePx * scale}px ${fontFamily}`
  }

  // Look for live DOM line elements in parent to match coordinates exactly
  const domLines = Array.from(parent.querySelectorAll('.wh-dom > span, .wh-dom > .sw, .hero-name > .mask-line'))
  const containerRect = container.getBoundingClientRect()

  if (domLines.length === lines.length && containerRect.width > 0) {
    lines.forEach((line, index) => {
      const isOutline = outlineLines.includes(index)
      const scale = isOutline ? outlineScale : 1
      applyFont(scale)
      ctx.lineWidth = Math.max(1.8, fontSizePx * scale * 0.016)

      const lineEl = domLines[index]
      const textSpan =
        lineEl.querySelector('.outline-text') ||
        lineEl.querySelector('.sw > span') ||
        lineEl.querySelector('.sw') ||
        lineEl.querySelector('span') ||
        lineEl

      // Read any active GSAP / CSS transform so reveal animations don't shift measurement
      const spanStyle = window.getComputedStyle(textSpan)
      let transformX = 0
      let transformY = 0
      if (spanStyle.transform && spanStyle.transform !== 'none') {
        try {
          const matrix = new DOMMatrixReadOnly(spanStyle.transform)
          transformX = matrix.m41 || 0
          transformY = matrix.m42 || 0
        } catch {
          /* ignore matrix read errors */
        }
      }

      const spanRect = textSpan.getBoundingClientRect()
      const x = Math.max(0, (spanRect.left - transformX) - containerRect.left)

      // Precise typographic baseline probe: an empty inline-block with vertical-align: baseline
      // rests precisely on the alphabetic baseline of that line box.
      let y = null
      try {
        const probe = document.createElement('span')
        probe.textContent = '\u200B'
        probe.style.cssText =
          'display:inline-block!important;width:0!important;height:0!important;overflow:hidden!important;vertical-align:baseline!important;line-height:normal!important;margin:0!important;padding:0!important;border:0!important;visibility:hidden!important;font-size:inherit!important;font-family:inherit!important;'
        textSpan.appendChild(probe)
        const probeRect = probe.getBoundingClientRect()
        textSpan.removeChild(probe)
        if (probeRect.top > 0) {
          y = (probeRect.top - transformY) - containerRect.top
        }
      } catch {
        /* probe fallback below */
      }

      if (y === null || !Number.isFinite(y)) {
        const metrics = ctx.measureText(line)
        const fontAscent = metrics.fontBoundingBoxAscent || fontSizePx * scale * 0.82
        const fontDescent = metrics.fontBoundingBoxDescent || fontSizePx * scale * 0.22
        const fontHeight = fontAscent + fontDescent
        const halfLeading = Math.max(0, (spanRect.height - fontHeight) / 2)
        y = (spanRect.top - transformY) - containerRect.top + halfLeading + fontAscent
      }

      drawLine(ctx, line, x, y, letterSpacing * scale, 'left', isOutline)
    })
  } else {
    let totalHeight = 0
    const lineHeights = lines.map((_, idx) => {
      const scale = outlineLines.includes(idx) ? outlineScale : 1
      const lh = lineHeight * scale
      totalHeight += lh
      return lh
    })

    let currentY = (align === 'left' ? 0 : Math.max(0, (height - totalHeight) / 2))
    const startX = align === 'left' ? 0 : align === 'right' ? width : width / 2

    lines.forEach((line, index) => {
      const isOutline = outlineLines.includes(index)
      const scale = isOutline ? outlineScale : 1
      applyFont(scale)
      ctx.lineWidth = Math.max(1.8, fontSizePx * scale * 0.016)
      const metrics = ctx.measureText(line)
      const fontAscent = metrics.fontBoundingBoxAscent || fontSizePx * scale * 0.82
      const fontDescent = metrics.fontBoundingBoxDescent || fontSizePx * scale * 0.22
      const fontHeight = fontAscent + fontDescent
      const halfLeading = Math.max(0, (lineHeights[index] - fontHeight) / 2)
      drawLine(ctx, line, startX, currentY + halfLeading + fontAscent, letterSpacing * scale, align, isOutline)
      currentY += lineHeights[index]
    })
  }

  return canvas
}

const syncUniforms = (program, props) => {
  const uniforms = program.uniforms
  uniforms.uWarpStrength.value = props.warpStrength
  uniforms.uWarpScale.value = props.warpScale
  uniforms.uSpeed.value = props.speed
  uniforms.uPointerInfluence.value = props.pointerInfluence
  uniforms.uPointerStrength.value = props.pointerStrength
  uniforms.uRefraction.value = props.refraction
  uniforms.uRipple.value = props.ripple ? 1 : 0
}

const WarpText = ({
  text = 'Bend the moment',
  color = '#f8f5ff',
  warpStrength = 0.025,
  warpScale = 1.2,
  speed = 0.35,
  pointerInfluence = 0.35,
  pointerStrength = 0.18,
  refraction = 0.007,
  ripple = true,
  fontSize = 'clamp(3rem, 10vw, 9rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  letterSpacing = '-0.06em',
  lineHeight = 0.9,
  align = 'center',
  outlineLines = [],
  outlineScale = 1,
  fitText = true,
  className = '',
  style,
  onReady,
  onError
}) => {
  const containerRef = useRef(null)
  const propsRef = useRef({
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    align,
    outlineLines,
    outlineScale,
    fitText,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    onReady,
    onError
  })
  const contextRef = useRef(null)

  useEffect(() => {
    propsRef.current = {
      text,
      color,
      fontSize,
      fontWeight,
      fontFamily,
      letterSpacing,
      lineHeight,
      align,
      outlineLines,
      outlineScale,
      fitText,
      warpStrength,
      warpScale,
      speed,
      pointerInfluence,
      pointerStrength,
      refraction,
      ripple,
      onReady,
      onError
    }

    if (contextRef.current) {
      syncUniforms(contextRef.current.program, propsRef.current)
      contextRef.current.rasterize()
    }
  }, [
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    align,
    outlineLines,
    outlineScale,
    fitText,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    onReady,
    onError
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window === 'undefined') return undefined

    let renderer
    let gl
    let program
    let geometry
    let mesh
    let texture
    let resizeObserver
    let intersectionObserver
    let themeObserver
    let raf = 0
    let disposed = false
    let contextLost = false
    let visible = true
    let pageVisible = !document.hidden
    let reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let rasterVersion = 0

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 }
    const startTime = performance.now()

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
      })
      gl = renderer.gl
    } catch (error) {
      console.warn('WarpText: WebGL could not be initialized.', error)
      propsRef.current.onError?.()
      return undefined
    }

    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)

    texture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE
    })

    geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTextTexture: { value: texture },
        uResolution: { value: new Float32Array([1, 1]) },
        uPointer: { value: new Float32Array([0.5, 0.5]) },
        uPointerActive: { value: 0 },
        uTime: { value: 0 },
        uWarpStrength: { value: propsRef.current.warpStrength },
        uWarpScale: { value: propsRef.current.warpScale },
        uSpeed: { value: propsRef.current.speed },
        uPointerInfluence: { value: propsRef.current.pointerInfluence },
        uPointerStrength: { value: propsRef.current.pointerStrength },
        uRefraction: { value: propsRef.current.refraction },
        uRipple: { value: propsRef.current.ripple ? 1 : 0 },
        uMotion: { value: reduceMotion ? 0 : 1 }
      }
    })
    mesh = new Mesh(gl, { geometry, program })

    const renderOnce = () => {
      if (disposed || contextLost) return
      renderer.render({ scene: mesh })
    }

    const rasterize = async () => {
      const version = ++rasterVersion
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready
        } catch (error) {
          void error
        }
      }
      if (disposed || contextLost || version !== rasterVersion) return

      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const textCanvas = buildTextCanvas({
        container,
        width: rect.width,
        height: rect.height,
        dpr,
        props: propsRef.current
      })
      texture.image = textCanvas
      texture.needsUpdate = true
      renderOnce()
      propsRef.current.onReady?.()
    }

    const resize = () => {
      if (disposed || contextLost) return
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setSize(rect.width, rect.height)
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight
      rasterize()
    }

    const onPointerMove = (event) => {
      if (event.pointerType === 'touch') return
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      pointer.tx = (event.clientX - rect.left) / rect.width
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height
      pointer.activeTarget = 1
    }

    const onPointerLeave = () => {
      pointer.activeTarget = 0
    }

    const onContextLost = (event) => {
      event.preventDefault()
      contextLost = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      propsRef.current.onError?.()
    }

    const onVisibility = () => {
      pageVisible = !document.hidden
      if (pageVisible && visible && !raf) raf = requestAnimationFrame(loop)
      if (!pageVisible && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const onReducedMotion = (event) => {
      reduceMotion = event.matches
      program.uniforms.uMotion.value = reduceMotion ? 0 : 1
      renderOnce()
    }

    const loop = (now) => {
      if (disposed || contextLost) return

      const elapsed = (now - startTime) * 0.001
      const targetX = pointer.activeTarget > 0 ? pointer.tx : 0.5
      const targetY = pointer.activeTarget > 0 ? pointer.ty : 0.5
      const damping = pointer.activeTarget > 0 ? 0.12 : 0.05

      pointer.x += (targetX - pointer.x) * damping
      pointer.y += (targetY - pointer.y) * damping
      pointer.active += ((pointer.activeTarget > 0 ? 1 : 0) - pointer.active) * 0.08

      program.uniforms.uPointer.value[0] = pointer.x
      program.uniforms.uPointer.value[1] = pointer.y
      program.uniforms.uPointerActive.value = reduceMotion ? 0 : pointer.active
      program.uniforms.uTime.value = reduceMotion ? 0 : elapsed

      renderOnce()
      raf = requestAnimationFrame(loop)
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && pageVisible && !raf) raf = requestAnimationFrame(loop)
        if (!visible && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 }
    )
    intersectionObserver.observe(container)

    // Watch for theme changes (dark/light mode) to re-rasterize colors
    themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          rasterize()
          break
        }
      }
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('webglcontextlost', onContextLost, false)
    document.addEventListener('visibilitychange', onVisibility)
    mediaQuery?.addEventListener('change', onReducedMotion)

    syncUniforms(program, propsRef.current)
    contextRef.current = { program, rasterize }
    resize()
    raf = requestAnimationFrame(loop)

    // Settle passes after page transition and GSAP entrance animations finish
    const s1 = setTimeout(rasterize, 400)
    const s2 = setTimeout(rasterize, 1000)
    const s3 = setTimeout(rasterize, 1800)

    return () => {
      disposed = true
      contextRef.current = null
      clearTimeout(s1)
      clearTimeout(s2)
      clearTimeout(s3)
      if (raf) cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      themeObserver?.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      document.removeEventListener('visibilitychange', onVisibility)
      mediaQuery?.removeEventListener('change', onReducedMotion)

      if (!contextLost) {
        try {
          if (texture?.texture) gl.deleteTexture(texture.texture)
          geometry?.remove?.()
          program?.remove?.()
          gl.getExtension('WEBGL_lose_context')?.loseContext()
        } catch (error) {
          void error
        }
      }

      if (canvas.parentNode === container) container.removeChild(canvas)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`warp-text ${className}`.trim()}
      style={style}
      role="img"
      aria-label={text}
    />
  )
}

export default WarpText
