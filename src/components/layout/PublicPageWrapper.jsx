import { motion } from 'framer-motion'

const publicVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: 'easeInOut' } 
  },
  exit: { 
    opacity: 0, 
    y: 10, 
    transition: { duration: 0.25, ease: 'easeInOut' } 
  }
}

export default function PublicPageWrapper({ children }) {
  return (
    <motion.div
      variants={publicVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-full"
    >
      {children}
    </motion.div>
  )
}
