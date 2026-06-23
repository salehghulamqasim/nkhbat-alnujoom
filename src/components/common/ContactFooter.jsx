import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '../../hooks/useTranslation'
import { haptic } from '../../hooks/useHaptics'
import DarkCard from './DarkCard'

function SnapchatIcon({ size = 16, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M12.166.053C6.344.053 3.743 4.456 3.743 7.669c0 1.407.278 2.697.59 3.373.138.3.283.716.107 1.1-.183.395-.55.67-.88.898-.518.36-1.07.556-1.284.73-.23.19-.255.376-.076.676.23.384.918.696 1.834.89.36.076.683.104.937.15.056.253.13.588.27.777.16.218.516.22.867.22.47 0 1.127-.13 1.874-.396.483-.172.92-.224 1.29-.224.31 0 .567.038.75.09.81.23 1.636.95 2.685 1.45.826.393 1.704.587 2.46.587h.087c.756 0 1.634-.194 2.46-.587 1.05-.5 1.875-1.22 2.684-1.45.184-.052.44-.09.75-.09.37 0 .807.052 1.29.224.748.267 1.405.396 1.875.396.35 0 .706-.002.867-.22.14-.19.214-.524.27-.777.254-.046.577-.074.937-.15.917-.194 1.604-.506 1.834-.89.18-.3.154-.486-.076-.676-.214-.174-.766-.37-1.284-.73-.33-.228-.697-.503-.88-.898-.176-.384-.03-.8.108-1.1.312-.676.59-1.966.59-3.373 0-3.213-2.602-7.616-8.423-7.616z" />
    </svg>
  )
}

export default function ContactFooter() {
  const { lang } = useTranslation()
  const isAr = lang === 'ar'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full mt-4"
    >
      <DarkCard className="p-5 border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent/3 rounded-full blur-lg pointer-events-none" />
        
        <div className="flex flex-col items-center text-center gap-3 relative z-10">
          <h3 className="font-bold text-accent text-sm tracking-wide uppercase">
            {isAr ? 'تواصل معنا' : 'Contact Us'}
          </h3>
          <p className="text-xs font-bold text-text-primary">
            {isAr ? 'أكاديمية نخبة النجوم الرياضية' : 'Star Elite Sports Academy'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-1.5 w-full">
            {/* Snapchat */}
            <a
              href="https://www.snapchat.com/add/abujulia91"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic.light()}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-bg-surface hover:bg-yellow-500/5 border border-border hover:border-yellow-400/40 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] group duration-200"
            >
              <SnapchatIcon size={16} className="text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-text-secondary group-hover:text-text-primary" dir="ltr">@abujulia91</span>
            </a>

            {/* Phone */}
            <a
              href="tel:0545448864"
              onClick={() => haptic.light()}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-bg-surface hover:bg-accent/5 border border-border hover:border-accent/40 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] group duration-200"
            >
              <Phone size={15} className="text-accent group-hover:scale-110 transition-transform" />
              <span className="text-text-secondary group-hover:text-text-primary" dir="ltr">0545448864</span>
            </a>
          </div>
        </div>
      </DarkCard>
    </motion.div>
  )
}

