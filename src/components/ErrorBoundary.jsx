import { Component } from 'react'

/** Keeps a rendering-3D failure from taking the page down. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.warn('3D scene failed, falling back:', error)
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}
