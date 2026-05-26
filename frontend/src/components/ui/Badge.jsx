const variantClasses = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/25',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  violet: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  orange: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  slate: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
  high: 'bg-red-500/15 text-red-400 border border-red-500/25',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
}

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs rounded-md',
  sm: 'px-2.5 py-1 text-xs rounded-lg',
  md: 'px-3 py-1 text-xs rounded-lg',
  lg: 'px-4 py-1.5 text-sm rounded-xl',
}

const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  icon,
  className = '',
  dot = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium
        ${variantClasses[variant] || variantClasses.info}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success' || variant === 'emerald' || variant === 'low'
              ? 'bg-emerald-400'
              : variant === 'warning' || variant === 'medium'
              ? 'bg-yellow-400'
              : variant === 'danger' || variant === 'high'
              ? 'bg-red-400'
              : variant === 'violet'
              ? 'bg-violet-400'
              : 'bg-blue-400'
          }`}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

export default Badge
