import { Component } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { AlertTriangle } from 'lucide-react'

const arTexts = {
  unexpectedError: 'حدث خطأ غير متوقع',
  refreshOrHome: 'حاول تحديث الصفحة أو العودة للرئيسية',
  refresh: 'تحديث الصفحة',
  goHome: 'العودة للرئيسية',
}

const enTexts = {
  unexpectedError: 'An unexpected error occurred',
  refreshOrHome: 'Try refreshing the page or returning to the homepage',
  refresh: 'Refresh Page',
  goHome: 'Go to Homepage',
}

function ErrorUI({ error, lang }) {
  const texts = lang === 'ar' ? arTexts : enTexts

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-primary text-center">
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-danger" />
      </div>
      <h2 className="text-lg font-bold mb-2">{texts.unexpectedError}</h2>
      <p className="text-sm text-text-secondary mb-4 max-w-xs">
        {texts.refreshOrHome}
      </p>

      {error && (
        <details className="mb-4 max-w-md w-full text-right" dir="ltr">
          <summary className="text-xs text-text-secondary cursor-pointer hover:text-text-primary mb-2">
            🔍 Error Details
          </summary>
          <pre className="text-xs bg-bg-surface border border-border rounded-lg p-3 overflow-auto text-danger text-left" dir="ltr">
            {error.toString()}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-colors"
        >
          {texts.refresh}
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-5 py-2.5 bg-bg-surface border border-border hover:border-accent/30 rounded-xl transition-colors"
        >
          {texts.goHome}
        </button>
      </div>
    </div>
  )
}

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
        <ErrorBoundaryInner error={this.state.error} />
      )
    }
    return this.props.children
  }
}

function ErrorBoundaryInner({ error }) {
  const language = useAppStore((s) => s.language)
  return <ErrorUI error={error} lang={language} />
}
