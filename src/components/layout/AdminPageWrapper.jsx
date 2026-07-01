import { motion } from 'framer-motion'

const adminVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.15, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  }
}

export default function AdminPageWrapper({ children }) {
  return (
    <motion.div
      variants={adminVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
