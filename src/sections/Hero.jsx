import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'
import { isWebGLAvailable } from '../lib/webgl'
import ErrorBoundary from '../components/ErrorBoundary'
import WarpText from '../components/WarpText'

const SplineScene = lazy(() => import('./SplineBackground'))

// the character's travel zone as FRACTIONS of hero width — nearly the
// full screen (user: "pure screen me nahi aa raha"); home is the aura box
const BOT_HOME_FRACTION = 0.78
const BOT_ZONE_L = 0.12
const BOT_ZONE_R = 0.92
// world X for a screen fraction, from the live camera (viewport-safe)
const worldXFor = (app, z, fraction) => {
  const cam = app._camera
  const aspect = (cam && cam.aspect) || 1.6
  const dist = Math.abs(((cam && cam.position && cam.position.z) || 860) - z)
  const halfW = Math.tan((((cam && cam.fov) || 45) * Math.PI) / 360) * dist * aspect
  return (fraction * 2 - 1) * halfW
}

/** quiet loading / degraded state — atmosphere, never geometry */
function SceneFallback() {
  return <div className="spline-fallback" aria-hidden="true" />
}

function HeroVisual({ onSceneLoad }) {
  const webgl = useMemo(() => isWebGLAvailable(), [])
  if (!webgl) return <SceneFallback />
  return (
    <ErrorBoundary fallback={<SceneFallback />}>
      <Suspense fallback={<SceneFallback />}>
        <SplineScene onLoad={onSceneLoad} />
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Layered hero:
 *   0 — hero-background (base ambience)
 *   1 — scene-aura      (soft breathing light BEHIND the canvas)
 *   2 — spline-layer    (the user's Spline scene, mounted ONCE — no key,
 *                         no conditional remount, theme-independent)
 *   3 — hero-atmosphere  (contrast scrim + technical grid, static)
 *   4 — hero-inner       (typography / metadata / CTA)
 *   5 — navigation       (fixed, above)
 *
 * Character interaction: the canvas, camera and environment NEVER move.
 * The scene's NATIVE cursor-follow system is live — the Robot body
 * physically chases the cursor (fed through the runtime's own mouse
 * handler, so the blocked canvas pointer events don't matter). One rAF
 * loop alongside bounds the travel, adds vertical response, orients the
 * character toward the cursor with bounded rotation (the native LookAt
 * stays paused — its unbounded aim was the tip-over bug), and cycles the
 * speech bubbles. Refs only — no React renders per frame.
 */
export default function Hero({ started }) {
  const sectionRef = useRef(null)
  const innerRef = useRef(null)
  const sceneWrapRef = useRef(null)
  const reduced = useReducedMotion()
  const fine = useFinePointer()

  // interaction state — refs only
  const sceneApiRef = useRef(null) // { app, robot, bubbles, rest, t0 }
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const insideRef = useRef(true)

  // scene runtime ready — the interaction loop owns the character's motion
  // completely. Every cursor-chasing native behavior is paused: the native
  // Follow never reliably engaged through the fed mouse property, and the
  // native LookAt's unbounded aim was the original tip-over bug. The speech
  // bubbles' native Follow (they track the robot) stays live.
  const syncBehaviors = (app) => {
    try {
      const em = app._eventManager
      for (const inst of em.handlers?.Follow?.events || []) {
        const name = inst.object?.name
        inst.paused = name === 'Robot' || name === 'Cursor Target'
      }
      for (const inst of em.handlers?.LookAt?.events || []) inst.paused = true
    } catch {
      /* runtime layout differs — nothing to sync */
    }
  }

  const handleSceneLoad = (app) => {
    if (typeof window !== 'undefined') window.__splineApp = app
    // The "Built with Spline" badge is drawn INSIDE the canvas by the
    // runtime's logo overlay pass — not a DOM element, so CSS can't touch
    // it. Kill the pass, and shadow setWatermark in case the embedded
    // SplineWatermark texture resolves after onLoad.
    try {
      const pipeline = app._renderer?.pipeline
      if (pipeline?.logoOverlayPass) {
        pipeline.setWatermark = () => {}
        pipeline.logoOverlayPass.enabled = false
        pipeline.updateRenderToScreen?.()
        app.requestRender()
      }
    } catch {
      /* runtime layout differs — badge stays, harmless */
    }
    try {
      const em = app._eventManager
      const robot = app.findObjectByName('Robot')
      const bubbles = ['Message', 'Message 2', 'Message 3']
        .map((n) => app.findObjectByName(n))
        .filter(Boolean)

      syncBehaviors(app)

      const robotFollow = (em.handlers?.Follow?.events || []).find((i) => i.object === robot)
      const rp = (robotFollow && robotFollow.worldPosition0) || robot.position
      sceneApiRef.current = {
        app,
        robot,
        bubbles,
        rest: { x: rp.x, y: rp.y, z: rp.z },
        t0: performance.now()
      }
      // neutral posture once, synchronously: the paused LookAt may already
      // have written its slumped orientation, and rAF-frozen views would
      // keep it until the first real frame. X parks the bot on the aura
      // panel (right side) — the native follow chases the cursor from
      // there, clamped to the same zone.
      robot.rotation.x = 0
      robot.rotation.y = 0
      robot.rotation.z = 0
      robot.position.x = worldXFor(app, rp.z, BOT_HOME_FRACTION)
      robot.position.y = rp.y
      robot.position.z = rp.z
      app.requestRender()
    } catch {
      sceneApiRef.current = { app }
    }
  }

  // deterministic scene reveal on timers — independent of the animation ticker
  useEffect(() => {
    const wrap = sceneWrapRef.current
    if (!wrap) return undefined
    const show = () => wrap.classList.add('is-visible')
    const hardShow = () => {
      wrap.style.transition = 'none'
      show()
    }
    if (reduced) {
      hardShow()
      return undefined
    }
    const t1 = setTimeout(show, started ? 150 : 3800)
    const t2 = setTimeout(hardShow, started ? 2100 : 5200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [started, reduced])

  // entrance choreography — paused until the preloader hands over
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const lines = section.querySelectorAll('.hero-name .mask-line > span')
    const fades = section.querySelectorAll('[data-hero-fade]')
    const warp = section.querySelector('.hero-warp')

    if (reduced) {
      sceneWrapRef.current?.classList.add('is-visible')
      return undefined
    }

    gsap.set(lines, { yPercent: 115 })
    gsap.set(fades, { autoAlpha: 0, y: 22 })

    const tl = gsap.timeline({ paused: true })
    tl.to(lines, { yPercent: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' }, 0.1).to(
      fades,
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 },
      0.6
    )

    const play = () => tl.play()
    if (started) play()
    else section.addEventListener('hero:start', play, { once: true })

    // wall-clock safety: never leave the hero text hidden if the ticker stalls
    const safety = setTimeout(() => {
      if (tl.progress() < 1) tl.progress(1)
    }, 4200)

    return () => {
      clearTimeout(safety)
      section.removeEventListener('hero:start', play)
      tl.kill()
    }
  }, [started, reduced])

  // THE interaction — one rAF loop alongside the scene's NATIVE cursor
  // follow. Ownership is split so nothing fights:
  //   • native Follow (Robot ← Cursor Target) moves the BODY horizontally —
  //     authored damping (25) and reset-on-leave give the physical chase;
  //   • this loop bounds the travel (±RANGE), adds the vertical response
  //     (±DRIFT_Y), and orients the character toward the cursor with
  //     bounded Euler writes (can never flip/tip like the paused native
  //     LookAt), plus the speech-bubble cycle.
  // Real pointer events are fed into the runtime's own mouse handler, so
  // the native pipeline runs exactly as authored while the canvas stays
  // pointer-blocked (raycast hover states — the grey washout — never fire).
  useEffect(() => {
    const DZ = 0.12 // dead zone — near-center cursor ≈ neutral pose
    const YAW = 0.13 // ±7.4°  turn toward the cursor
    const PITCH = 0.07 // ±4.0°  nod up/down (cursor up → look up)
    const DRIFT_Y = 16 // vertical response ≈ 4% of hero height
    const shape = (n) => {
      const a = Math.min(1, Math.max(0, (Math.abs(n) - DZ) / (1 - DZ)))
      return Math.sign(n) * Math.pow(a, 1.4)
    }

    const onMove = (e) => {
      targetRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      targetRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
      insideRef.current = true
      // feed the REAL event into the runtime's own mouse handler — the
      // native Follow pipeline runs exactly as authored
      const em = sceneApiRef.current?.app?._eventManager
      if (em) {
        try {
          em.onMouseMove({ pageX: e.pageX, pageY: e.pageY, buttons: e.buttons || 0 })
        } catch {
          /* runtime shape changed — posture channel still works */
        }
      }
    }
    const onLeave = () => {
      targetRef.current.x = 0
      targetRef.current.y = 0
      insideRef.current = false
      // out-of-bounds point tells the native Follow the cursor left → it
      // runs its authored reset (resetOnPointerLeave / resetSpeed)
      const em = sceneApiRef.current?.app?._eventManager
      if (em) {
        try {
          em.onMouseMove({ pageX: -99999, pageY: -99999, buttons: 0 })
        } catch {
          /* ignore */
        }
      }
    }

    let raf
    const tick = () => {
      const api = sceneApiRef.current
      if (api && api.app && api.robot) {
        try {
          const follow = fine && !reduced
          const lerp = insideRef.current ? 0.05 : 0.025 // slow, floaty chase
          currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp
          currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp
          const ex = follow ? shape(currentRef.current.x) : 0
          const ey = follow ? shape(currentRef.current.y) : 0
          const r = api.robot
          r.rotation.x = ey * PITCH
          r.rotation.y = ex * YAW
          r.rotation.z = 0
          // body position — driven DIRECTLY by the loop (guaranteed mouse
          // response, no dependence on native behaviors): the robot sweeps
          // the aura zone with the cursor, double-damped for a smooth chase
          const nx = follow ? currentRef.current.x : 0
          const frac = BOT_ZONE_L + ((nx + 1) / 2) * (BOT_ZONE_R - BOT_ZONE_L)
          const tx = worldXFor(api.app, api.rest.z, frac)
          r.position.x += (tx - r.position.x) * 0.028
          r.position.y = api.rest.y - ey * DRIFT_Y
          r.position.z = api.rest.z

          // speech bubbles: one at a time, gentle pop (first stays under
          // reduced motion)
          const msgs = api.bubbles || []
          if (msgs.length) {
            const active = reduced
              ? 0
              : Math.max(
                  -1,
                  Math.floor((performance.now() - api.t0 - 800) / 3600) % msgs.length
                )
            for (let i = 0; i < msgs.length; i++) {
              const want = i === active ? 1 : 0
              const s = msgs[i].scale.x + (want - msgs[i].scale.x) * 0.1
              msgs[i].scale.x = s
              msgs[i].scale.y = s
              msgs[i].scale.z = s
            }
          }
          api.app.requestRender()
        } catch {
          return // scene disposed — stop the loop
        }
      }
      raf = requestAnimationFrame(tick)
    }

    // keep the native behaviors in step with capability changes
    if (sceneApiRef.current?.app) syncBehaviors(sceneApiRef.current.app)

    if (fine && !reduced) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', onLeave)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      if (fine && !reduced) {
        window.removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('mouseleave', onLeave)
      }
      cancelAnimationFrame(raf)
    }
  }, [reduced, fine])

  // scroll: content lifts, scene fades and stops rendering once out of view
  useEffect(() => {
    if (reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.to(innerRef.current, {
        yPercent: -14,
        autoAlpha: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
      gsap.to(sceneWrapRef.current, {
        autoAlpha: 0.08,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '75% top',
          scrub: true
        }
      })
      // pause the Spline runtime's painting entirely once the hero is gone
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'bottom top',
        onLeave: () => {
          sceneWrapRef.current.style.visibility = 'hidden'
        },
        onEnterBack: () => {
          sceneWrapRef.current.style.visibility = 'visible'
        }
      })
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="hero" id="home" ref={sectionRef} aria-label="Introduction">
      {/* layer 0 — base ambience */}
      <div className="hero-background" aria-hidden="true">
        <div className="hero-light" />
      </div>

      {/* soft light behind the scene — pure CSS breathing, never follows
          the mouse (only the character inside the scene reacts) */}
      <div className="scene-aura" aria-hidden="true">
        <div className="scene-aura-core" />
      </div>

      {/* layer 1 — the Spline environment. The canvas itself NEVER moves:
          pointer-events blocked (no raycast hover states / washout) and all
          character motion happens on the Robot object inside the scene. */}
      <div className="spline-layer" ref={sceneWrapRef} aria-hidden="true">
        <HeroVisual onSceneLoad={handleSceneLoad} />
      </div>

      {/* layer 2 — atmosphere: contrast scrim + technical grid (static) */}
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="hero-scrim" />
        <div className="hero-gridlines" />
      </div>

      {/* layer 3 — typography, metadata, CTA */}
      <div className="hero-inner container" ref={innerRef}>
        <div className="hero-top mono" data-hero-fade>
          <span>FRONTEND DEVELOPER — PORTFOLIO</span>
          <span className="hero-top-right">©2026 — V2.0</span>
        </div>

        <div className="hero-mid">
          <h1 className="hero-name" aria-label="Nisarg Panchal">
            <span className="mask-line hero-l1" aria-hidden="true">
              <span>NISARG</span>
            </span>
            <span className="mask-line hero-l2" aria-hidden="true">
              <span className="outline-text">PANCHAL</span>
            </span>
            <WarpText
              text={'NISARG\nPANCHAL'}
              color="var(--text)"
              fontFamily="var(--font-display)"
              fontSize="clamp(3.4rem, 12vw, 13rem)"
              fontWeight={700}
              letterSpacing="-0.035em"
              lineHeight={0.92}
              align="left"
              fitText={false}
              outlineLines={[1]}
              outlineScale={1.36}
              warpStrength={0.025}
              warpScale={1.2}
              speed={0.35}
              pointerInfluence={0.35}
              pointerStrength={0.18}
              refraction={0.007}
              ripple
              className="hero-warp"
            />
          </h1>

          <p className="hero-role" data-hero-fade>
            <span>FRONTEND</span>
            <span>
              DEVELOPER<span className="accent-dot">.</span>
            </span>
          </p>
        </div>

        <div className="hero-bottom" data-hero-fade>
          <p className="hero-tagline">
            Responsive interfaces built with care —{' '}
            <strong>code, design and motion</strong> working together.
          </p>
          <div className="hero-bottom-right">
            <span className="hero-status">
              <i className="status-dot" aria-hidden="true" />
              Open for opportunities
            </span>
            <span className="hero-scroll">
              Scroll to explore
              <i aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
