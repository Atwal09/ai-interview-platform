import { motion } from 'framer-motion'

const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'violet',
  size = 'md',
  label,
  showValue = false,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses = {
    violet: 'from-violet-500 to-violet-400',
    cyan: 'from-cyan-500 to-cyan-400',
    emerald: 'from-emerald-500 to-emerald-400',
    red: 'from-red-500 to-red-400',
    yellow: 'from-yellow-500 to-yellow-400',
    blue: 'from-blue-500 to-blue-400',
    orange: 'from-orange-500 to-orange-400',
    gradient: 'from-violet-500 to-cyan-500',
  }

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  }

  const glowColors = {
    violet: 'rgba(139, 92, 246, 0.4)',
    cyan: 'rgba(6, 182, 212, 0.4)',
    emerald: 'rgba(16, 185, 129, 0.4)',
    red: 'rgba(239, 68, 68, 0.4)',
    yellow: 'rgba(234, 179, 8, 0.4)',
    gradient: 'rgba(139, 92, 246, 0.4)',
  }

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${sizeClasses[size] || sizeClasses.md}`}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full bg-gradient-to-r rounded-full ${colorClasses[color] || colorClasses.violet}`}
          style={{
            boxShadow: `0 0 8px ${glowColors[color] || glowColors.violet}`,
          }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
