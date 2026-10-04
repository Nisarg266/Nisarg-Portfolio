import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ScrollTrigger } from './lib/gsap'
import { prefersReducedMotion } from './hooks/useMediaQuery'
import Cursor from './components/Cursor'
import BubbleCursor from './components/BubbleCursor'
import ScrollProgress from './components/ScrollProgress'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import TransitionProvider from './components/Transition'
import { ThemeProvider } from './theme/ThemeProvider'
import Home from './pages/Home'
import Work from './pages/Work'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Experience from './pages/Experience'
import Certifications from './pages/Certifications'
import Contact from './pages/Contact'

export default function App() {
  const [introDone, setIntroDone] = useState(() => prefersReducedMotion())
  const handleIntroDone = useCallback(() => {
    setIntroDone(true)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hero:start'))
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('is-locked', !introDone)
    return () => document.body.classList.remove('is-locked')
  }, [introDone])

  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) ScrollTrigger.refresh()
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <TransitionProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Preloader onComplete={handleIntroDone} />
        <Cursor />
        <BubbleCursor />
        <ScrollProgress />
        <Navbar />
        <main id="main">
          <Routes>
            <Route path="/" element={<Home started={introDone} />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <div className="noise" aria-hidden="true" />
        </TransitionProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
