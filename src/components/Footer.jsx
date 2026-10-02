import { useLocation } from 'react-router-dom'
import { TLink } from './Transition'
import { ArrowUp, ArrowUpRight } from './Icons'
import { PROFILE, ROUTES, AVAILABILITY } from '../lib/data'

export default function Footer() {
  const year = new Date().getFullYear()
  const toTop = () => window.scrollTo({ top: 0, behavior: 'auto' })

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-brand">Nisarg Panchal</p>
            <p className="footer-role">Frontend Developer</p>
          </div>

          <div className="footer-col">
            <h3>Navigation</h3>
            <ul>
              {ROUTES.map((route) => (
                <li key={route.to}>
                  <TLink to={route.to} label={route.label} className="link-line">
                    {route.label}
                  </TLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Available for</h3>
            <ul>
              {AVAILABILITY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>Elsewhere</h3>
            <ul>
              <li>
                <a href={`mailto:${PROFILE.email}`} className="link-line">
                  Email
                </a>
              </li>
              <li>
                <a href={`tel:${PROFILE.phone}`} className="link-line">
                  {PROFILE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={PROFILE.github} target="_blank" rel="noreferrer" className="link-line">
                  GitHub <ArrowUpRight size={10} />
                </a>
              </li>
            </ul>
          </div>

          <button className="to-top" onClick={toTop}>
            Back to top <ArrowUp />
          </button>
        </div>

        <div className="footer-base">
          <span>© {year} Nisarg Panchal</span>
          <span>Designed & built with HTML, CSS, JavaScript & React</span>
        </div>
      </div>
    </footer>
  )
}
