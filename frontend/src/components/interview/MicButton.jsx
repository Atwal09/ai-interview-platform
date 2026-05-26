import { motion, AnimatePresence } from 'framer-motion'
import { FiMic, FiMicOff, FiSquare } from 'react-icons/fi'

const MicButton = ({
  isRecording,
  onToggle,
  disabled = false,
  size = 'lg',
  audioLevel = 0,
}) => {
  const sizeConfig = {
    sm: { button: 'w-12 h-12', icon: 16, ring: 'w-16 h-16' },
    md: { button: 'w-16 h-16', icon: 20, ring: 'w-20 h-20' },
    lg: { button: 'w-20 h-20', icon: 24, ring: 'w-28 h-28' },
    xl: { button: 'w-24 h-24', icon: 28, ring: 'w-36 h-36' },
  }
  const cfg = sizeConfig[size] || sizeConfig.lg

  const numRings = 3
  const rings = Array.from({ length: numRings }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Animated rings when recording */}
        <AnimatePresence>
          {isRecording && rings.map(i => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{
                scale: 1 + (i + 1) * 0.3 + (audioLevel / 100) * 0.2,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
              className="absolute rounded-full bg-red-500/20 border border-red-500/30"
              style={{
                width: `${parseInt(cfg.button) + (i + 1) * 20}px`,
                height: `${parseInt(cfg.button) + (i + 1) * 20}px`,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={onToggle}
          disabled={disabled}
          className={`
            relative z-10 ${cfg.button} rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isRecording
              ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
              : 'bg-gradient-to-br from-violet-600 to-cyan-600 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="stop"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <FiSquare size={cfg.icon} className="text-white fill-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <FiMic size={cfg.icon} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Audio level ring */}
        {isRecording && (
          <motion.div
            animate={{
              scale: 1 + (audioLevel / 100) * 0.15,
              opacity: 0.7 + (audioLevel / 100) * 0.3,
            }}
            transition={{ duration: 0.1 }}
            className="absolute rounded-full border-2 border-red-400"
            style={{
              width: parseInt(cfg.button) + 8,
              height: parseInt(cfg.button) + 8,
            }}
          />
        )}
      </div>

      {/* Label */}
      <motion.p
        animate={{ opacity: 1 }}
        className={`text-sm font-medium ${isRecording ? 'text-red-400' : 'text-slate-400'}`}
      >
        {isRecording ? (
          <span className="flex items-center gap-2">
            <span className="recording-dot" />
            Recording...
          </span>
        ) : (
          'Click to record'
        )}
      </motion.p>

      {/* Audio level bars */}
      {isRecording && (
        <div className="flex items-center gap-1 h-6">
          {Array.from({ length: 7 }, (_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-red-400 rounded-full"
              animate={{
                height: isRecording
                  ? `${Math.max(4, (audioLevel + Math.random() * 20) * 0.24)}px`
                  : '4px',
              }}
              transition={{ duration: 0.15, delay: i * 0.02 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MicButton
