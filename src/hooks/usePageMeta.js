import { useEffect } from 'react'

/** Per-page title + meta description (SPA-safe). */
export function usePageMeta({ title, description }) {
  useEffect(() => {
    document.title = title
    const set = (selector, value) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute('content', value)
    }
    set('meta[name="description"]', description)
    set('meta[property="og:title"]', title)
    set('meta[property="og:description"]', description)
  }, [title, description])
}
