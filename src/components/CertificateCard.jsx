import { ArrowUpRight } from './Icons'

/**
 * Premium gallery card — a framed document preview that lifts, glows and
 * sweeps a light reflection on hover; clicking opens the full viewer.
 */
export default function CertificateCard({ item, onOpen }) {
  return (
    <article className="cert-item">
      <button
        type="button"
        className="cert-open"
        onClick={() => onOpen(item.id)}
        data-cursor="VIEW"
        aria-label={`Open ${item.title} certificate`}
      >
        <span className="cert-preview">
          <img
            className="cert-preview-img"
            src={encodeURI(item.preview)}
            alt={`${item.title} — certificate preview`}
            loading="lazy"
            decoding="async"
          />
          <span className="cert-preview-shine" aria-hidden="true" />
          <span className="cert-format mono">{item.format === 'pdf' ? 'PDF' : 'IMAGE'}</span>
          <span className="cert-view mono" aria-hidden="true">
            View <ArrowUpRight size={11} />
          </span>
        </span>
        <span className="cert-info">
          <span className="cert-meta mono">
            <span className="cert-kind">{item.kind}</span>
            <span className="cert-date">{item.date}</span>
          </span>
          <span className="cert-title">{item.title}</span>
          <span className="cert-issuer mono">{item.issuer}</span>
        </span>
      </button>
    </article>
  )
}
