import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-primary text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-text-secondary mb-4 max-w-xs">
            حاول تحديث الصفحة أو العودة للرئيسية
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-colors"
            >
              تحديث الصفحة
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-5 py-2.5 bg-bg-surface border border-border hover:border-accent/30 rounded-xl transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
