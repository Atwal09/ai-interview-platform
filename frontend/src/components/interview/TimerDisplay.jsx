import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiAlertTriangle } from 'react-icons/fi'

const TimerDisplay = ({
  initialTime = 120,
  onTimeUp,
  paused = false,
  size = 'md',
  showWarning = true,
  warningThreshold = 30,
  dangerThreshold = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isWarning, setIsWarning] = useState(false)
  const [isDanger, setIsDanger] = useState(false)

  useEffect(() => {
    setTimeLeft(initialTime)
    setIsWarning(false)
    setIsDanger(false)
  }, [initialTime])

  useEffect(() => {
    if (paused || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        if (next <= dangerThreshold) setIsDanger(true)
        else if (next <= warningThreshold) setIsWarning(true)
        if (next <= 0) {
          clearInterval(interval)
          onTimeUp?.()
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [paused, timeLeft, onTimeUp, warningThreshold, dangerThreshold])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const progress = (timeLeft / initialTime) * 100

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  }

  const containerSizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  }

  const strokeWidth = 4
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const color = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#8b5cf6'
  const glowColor = isDanger ? 'rgba(239,68,68,0.4)' : isWarning ? 'rgba(245,158,11,0.4)' : 'rgba(139,92,246,0.4)'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${containerSizes[size]} flex items-center justify-center`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
        </svg>
        <div className="text-center z-10">
          <motion.span
            key={timeLeft}
            animate={isDanger ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`font-mono font-bold ${textSizes[size]} ${
              isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'
            }`}
          >
            {formatTime(timeLeft)}
          </motion.span>
        </div>
      </div>

      {showWarning && isWarning && !isDanger && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-yellow-400 text-xs"
          >
            <FiClock size={12} />
            <span>Time running low</span>
          </motion.div>
        </AnimatePresence>
      )}

      {isDanger && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-red-400 text-xs"
          >
            <FiAlertTriangle size={12} />
            <span>Wrap up your answer!</span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default TimerDisplay
