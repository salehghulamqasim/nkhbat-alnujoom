export default function DarkCard({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`glass-card ${
        hover ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
