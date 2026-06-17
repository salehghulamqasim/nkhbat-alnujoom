export default function GoldButton({
  children,
  variant = 'solid',
  className = '',
  disabled,
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold h-12 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    solid:
      'bg-accent hover:bg-accent-hover text-black shadow-[0_4px_15px_rgba(212,175,55,0.35)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.4)]',
    outline:
      'bg-transparent border border-accent text-accent hover:bg-accent hover:text-black',
    ghost: 'bg-bg-surface border border-border hover:border-accent/50 hover:text-accent text-text-primary',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
