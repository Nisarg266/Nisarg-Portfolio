import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { usePageMeta } from '../hooks/usePageMeta'
import SectionHeading from '../components/SectionHeading'
import Reveal from '../components/Reveal'
import SplitWords from '../components/SplitWords'
import WarpHeading from '../components/WarpHeading'
import CertificateCard from '../components/CertificateCard'
import CertificateModal from '../components/CertificateModal'
import { CERT_GROUPS, CERTIFICATES_GALLERY } from '../lib/certificates'

/**
 * Premium certificates library — every document rendered as a framed
 * preview, filterable by type, with cinematic entrances and a full-screen
 * viewer that shows the original PDF itself.
 */
export default function Certifications() {
  const [group, setGroup] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const gridRef = useRef(null)
  const reduced = useReducedMotion()

  const filtered = useMemo(
    () => (group === 'all' ? CERTIFICATES_GALLERY : CERTIFICATES_GALLERY.filter((c) => c.group === group)),
    [group]
  )

  const stats = useMemo(() => {
    const issuers = new Set(CERTIFICATES_GALLERY.map((c) => c.issuer))
    const years = CERTIFICATES_GALLERY.map((c) => Number(c.year)).filter(Boolean)
    return {
      count: CERTIFICATES_GALLERY.length,
      issuers: issuers.size,
      span: `${Math.min(...years)} — ${Math.max(...years)}`,
    }
  }, [])

  usePageMeta({
    title: 'Nisarg Panchal — Certifications',
    description: `${stats.count} verified certificates, courses and internships earned by Nisarg Panchal — including AWS Solutions Architecture (Forage), a web-development internship at Sahajanand Digital and LetsUpgrade programmes.`,
  })

  // cinematic entrances — rerun whenever the filter changes the set
  useLayoutEffect(() => {
    if (reduced || !gridRef.current) return undefined
    const grid = gridRef.current
    const tweens = []
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.cert-item', grid).forEach((el, i) => {
        tweens.push(
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
              delay: (i % 6) * 0.055,
              scrollTrigger: { trigger: el, start: 'top 94%', once: true },
            }
          )
        )
      })
    }, gridRef)

    // wall-clock safety (matches Reveal.jsx): if the animation ticker is
    // throttled (hidden or background tab), in-view cards must never stay
    // invisible — jump their tween straight to the end state.
    const safety = setTimeout(() => {
      tweens.forEach((tw) => {
        const el = tw.targets()[0]
        if (el.getBoundingClientRect().top < window.innerHeight * 1.2 && getComputedStyle(el).opacity === '0') {
          tw.scrollTrigger?.kill()
          tw.progress(1)
          tw.kill()
        }
      })
    }, 2400)

    return () => {
      clearTimeout(safety)
      ctx.revert()
    }
  }, [filtered, reduced])

  const activeIndex = filtered.findIndex((c) => c.id === activeId)
  const active = activeIndex >= 0 ? filtered[activeIndex] : null

  const closeModal = useCallback(() => setActiveId(null), [])
  const stepModal = useCallback(
    (dir) => {
      setActiveId((current) => {
        if (!current) return current
        const idx = filtered.findIndex((c) => c.id === current)
        if (idx < 0) return current
        return filtered[(idx + dir + filtered.length) % filtered.length].id
      })
    },
    [filtered]
  )

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
              Every certificate, course and internship I have earned — {stats.count} documents,
              collected in one place and shown exactly as issued.
            </p>
            <ul className="cert-hero-stats mono" aria-label="Collection summary">
              <li>
                <strong>{stats.count}</strong> Documents
              </li>
              <li>
                <strong>{stats.issuers}</strong> Issuers
              </li>
              <li>
                <strong>{stats.span}</strong> Years
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="cert-filters" role="tablist" aria-label="Filter certificates">
              {CERT_GROUPS.map((g) => {
                const count =
                  g.id === 'all'
                    ? CERTIFICATES_GALLERY.length
                    : CERTIFICATES_GALLERY.filter((c) => c.group === g.id).length
                const isActive = group === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`cert-chip mono${isActive ? ' is-active' : ''}`}
                    onClick={() => setGroup(g.id)}
                  >
                    {g.label} <span className="cert-chip-count">{String(count).padStart(2, '0')}</span>
                  </button>
                )
              })}
            </div>
          </Reveal>

          <div className="cert-grid" ref={gridRef}>
            {filtered.map((item) => (
              <CertificateCard key={`${group}-${item.id}`} item={item} onOpen={setActiveId} />
            ))}
          </div>
        </div>
      </section>

      <CertificateModal
        item={active}
        index={activeIndex < 0 ? 0 : activeIndex}
        total={filtered.length}
        onClose={closeModal}
        onStep={stepModal}
      />
    </div>
  )
}
