import { motion } from 'framer-motion'

export default function TactileButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? {} : { scale: 0.96, y: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className={`focus:outline-none select-none active:outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
