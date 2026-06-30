import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { Lock, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react'
import { haptic } from '../../hooks/useHaptics'
import DarkCard from '../../components/common/DarkCard'
import GoldButton from '../../components/common/GoldButton'
import { useI18n } from '../../i18n/useI18n'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const { isAr } = useI18n()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(false)

    await new Promise((r) => setTimeout(r, 300))

    if (login(pin)) {
      haptic.intense()
      navigate('/admin/dashboard')
    } else {
      haptic.heavy()
      setError(true)
      setPin('')
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-bg-primary ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <button
        onClick={() => {
          haptic.light()
          navigate('/more')
        }}
        className="absolute top-4 end-4 px-4 py-2 flex items-center gap-2 rounded-xl bg-bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-all text-sm font-semibold"
      >
        {isAr && <ArrowRight size={16} />}
        <span>{isAr ? 'العودة للتطبيق' : 'Back to App'}</span>
        {!isAr && <ArrowRight size={16} />}
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />

      <DarkCard className="w-full max-w-sm p-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-bg-surface border border-border flex items-center justify-center mb-6 shadow-inner">
          <Lock size={28} className="text-accent" />
        </div>

        <h1 className="text-2xl font-bold mb-2">{isAr ? 'لوحة التحكم' : 'Admin Panel'}</h1>
        <p className="text-sm text-text-secondary mb-8 text-center">
          {isAr ? 'أدخل رمز الدخول السري للوصول إلى الإدارة' : 'Enter the secret PIN to access the admin panel'}
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                if (error) setError(false)
              }}
              placeholder="••••"
              className={`w-full text-center tracking-[1em] text-2xl bg-bg-surface border rounded-xl py-4 focus:outline-none transition-colors ${
                error
                  ? 'border-danger/60 focus:border-danger'
                  : 'border-border focus:border-accent'
              }`}
              dir="ltr"
              autoFocus
              disabled={submitting}
            />
            {error && (
              <div className="flex items-center gap-1.5 text-danger text-xs mt-2 justify-center animate-pulse">
                <ShieldAlert size={14} />
                <span>{isAr ? 'رمز الدخول غير صحيح. حاول مرة أخرى' : 'Incorrect PIN. Try again'}</span>
              </div>
            )}
          </div>

          <GoldButton type="submit" className="w-full mt-2" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 size={16} className="animate-spin" />
                {isAr ? 'جاري التحقق...' : 'Verifying...'}
              </span>
            ) : (
              isAr ? 'دخول' : 'Login'
            )}
          </GoldButton>
        </form>
      </DarkCard>
    </div>
  )
}
