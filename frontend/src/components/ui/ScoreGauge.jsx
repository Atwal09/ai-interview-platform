import { motion } from 'framer-motion'

const ScoreGauge = ({
  score = 0,
  size = 160,
  strokeWidth = 12,
  label = 'Score',
  showPercentage = true,
  color,
}) => {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(Math.max(score, 0), 100)
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference

  const getColor = () => {
    if (color) return color
    if (clampedScore >= 80) return '#10b981'
    if (clampedScore >= 60) return '#eab308'
    if (clampedScore >= 40) return '#f97316'
    return '#ef4444'
  }

  const getGlowColor = () => {
    if (color) return color
    if (clampedScore >= 80) return 'rgba(16, 185, 129, 0.5)'
    if (clampedScore >= 60) return 'rgba(234, 179, 8, 0.5)'
    if (clampedScore >= 40) return 'rgba(249, 115, 22, 0.5)'
    return 'rgba(239, 68, 68, 0.5)'
  }

  const activeColor = getColor()
  const glowColor = getGlowColor()

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-3xl font-bold font-display"
            style={{ color: activeColor }}
          >
            {clampedScore}
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-slate-400 mt-0.5 font-medium">{label}</span>
        )}
      </div>
    </div>
  )
}

export default ScoreGauge
