import Spline from '@splinetool/react-spline'

/**
 * The user's Spline scene — the primary atmospheric environment of the
 * hero. Loaded lazily so the runtime never blocks first paint.
 *
 * onLoad hands the runtime Application to the parent via callback, so the
 * hero can neutralize the scene's built-in mouse-follow behavior (the
 * character must never tilt) and keep full control of movement itself.
 */
export default function SplineBackground({ onLoad }) {
  return (
    <Spline
      scene="https://prod.spline.design/pPIrEi4nVUFVKg4n/scene.splinecode"
      onLoad={onLoad}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
