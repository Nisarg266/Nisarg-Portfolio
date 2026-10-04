import { useEffect, useRef } from 'react'

/**
 * Particle class for the bubble cursor trail.
 * Renders lightweight rising bubbles with smooth opacity and scale life cycle.
 */
class BubbleParticle {
  constructor(x, y) {
    this.initialLifeSpan = Math.floor(Math.random() * 60 + 50)
    this.lifeSpan = this.initialLifeSpan
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
      y: -0.4 + Math.random() * -1
    }
    this.position = { x, y }
    this.baseDimension = 4
  }

  update(context) {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75
    this.velocity.y -= Math.random() / 600
    this.lifeSpan--

    const progress = (this.initialLifeSpan - this.lifeSpan) / this.initialLifeSpan
    const scale = 0.2 + progress
    const alpha = Math.max(0, 1 - progress * 0.9)

    context.save()
    context.globalAlpha = alpha
    context.fillStyle = '#e6f1f7'
    context.strokeStyle = '#3a92c5'
    context.lineWidth = 1

    context.beginPath()
    context.arc(
      this.position.x - (this.baseDimension / 2) * scale,
      this.position.y - this.baseDimension / 2,
      this.baseDimension * scale,
      0,
      2 * Math.PI
    )
    context.stroke()
    context.fill()
    context.closePath()
    context.restore()
  }
}

/**
 * BubbleCursor component:
 * - Renders a transparent fixed canvas overlay that never blocks clicks or interactions.
 * - Spawns delicate bubble particles as the mouse moves.
 * - Completely passive and decoupled from DOM UI.
 */
export default function BubbleCursor({ zIndex = 99990 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion.matches) return undefined

    // Only run on fine pointers (mice / trackpads) to avoid unnecessary mobile touch overhead
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!hasFinePointer) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    let animationFrameId = null
    const particles = []
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    resize()

    const addParticle = (x, y) => {
      // Limit total particles to maintain 60fps effortlessly
      if (particles.length > 70) return
      particles.push(new BubbleParticle(x, y))
    }

    const onMouseMove = (e) => {
      addParticle(e.clientX, e.clientY)
    }

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        addParticle(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const loop = () => {
      if (!context || !canvas) return

      if (particles.length > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height)

        for (let i = 0; i < particles.length; i++) {
          particles[i].update(context)
        }

        // Clean up expired particles
        for (let i = particles.length - 1; i >= 0; i--) {
          if (particles[i].lifeSpan <= 0) {
            particles.splice(i, 1)
          }
        }

        if (particles.length === 0) {
          context.clearRect(0, 0, canvas.width, canvas.height)
        }
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('resize', resize, { passive: true })

    loop()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex,
        userSelect: 'none'
      }}
      aria-hidden="true"
    />
  )
}
