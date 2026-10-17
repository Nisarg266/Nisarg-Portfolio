import { useEffect } from 'react'
import { useScrollLock } from '../hooks/useScrollLock'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ArrowLeft, ArrowRight, ArrowUpRight, Close, Download } from './Icons'

/**
 * Full-screen certificate viewer — shows the original PDF inside the
 * browser's viewer (or the image directly) with keyboard navigation and
 * open/save actions. Phones get the generated preview image instead of the
 * embedded PDF (mobile browsers render PDF iframes unreliably); the Open and
 * Save actions still expose the original file. Motion is pure CSS, so it can
 * never be trapped by a throttled animation ticker.
 */
export default function CertificateModal({ item, index, total, onClose, onStep }) {
  useScrollLock(!!item)
  const isPhone = useMediaQuery('(max-width: 900px)')

  // keyboard — esc closes, arrows step through the current set
  useEffect(() => {
    if (!item) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onStep(1)
      else if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose, onStep])

  if (!item) return null

  const url = encodeURI(item.file)
  const counter = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

  return (
    <div className="cert-modal" role="dialog" aria-modal="true" aria-label={`${item.title} — certificate viewer`}>
      <button type="button" className="cert-modal-backdrop" aria-label="Close viewer" onClick={onClose} tabIndex={-1} />

      {/* keyed by id so the rise-in replays on every prev/next step */}
      <div className="cert-modal-panel" key={item.id}>
        <header className="cert-modal-head">
          <div className="cert-modal-titles">
            <p className="cert-modal-kicker mono">
              {item.kind} · {item.date} <span className="cert-modal-count">— {counter}</span>
            </p>
            <h2 className="cert-modal-title">{item.title}</h2>
            <p className="cert-modal-issuer mono">{item.issuer}</p>
          </div>
          <div className="cert-modal-actions">
            <a className="cert-modal-btn mono" href={url} target="_blank" rel="noopener noreferrer">
              Open <ArrowUpRight size={11} />
            </a>
            <a className="cert-modal-btn mono" href={url} download>
              <Download size={11} /> Save
            </a>
            <button type="button" className="cert-modal-close" onClick={onClose} aria-label="Close viewer">
              <Close size={13} />
            </button>
          </div>
        </header>

        <div className="cert-modal-body">
          {item.format === 'pdf' && !isPhone ? (
            <iframe className="cert-modal-frame" src={`${url}#view=FitH&toolbar=0`} title={`${item.title} — PDF`} />
          ) : (
            <img
              className="cert-modal-image"
              src={encodeURI(item.format === 'pdf' ? item.preview : url)}
              alt={`${item.title} certificate`}
            />
          )}
        </div>

        {item.note ? <p className="cert-modal-note mono">{item.note}</p> : null}

        <button type="button" className="cert-modal-nav prev" onClick={() => onStep(-1)} aria-label="Previous certificate">
          <ArrowLeft size={15} />
        </button>
        <button type="button" className="cert-modal-nav next" onClick={() => onStep(1)} aria-label="Next certificate">
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
