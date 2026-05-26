import { motion } from 'framer-motion'
import Badge from '../ui/Badge'
import { FiClock } from 'react-icons/fi'

const difficultyConfig = {
  easy: { color: 'emerald', label: 'Easy' },
  medium: { color: 'warning', label: 'Medium' },
  hard: { color: 'danger', label: 'Hard' },
}

const typeConfig = {
  HR: { color: 'violet', emoji: '👔' },
  Technical: { color: 'cyan', emoji: '💻' },
  Behavioral: { color: 'emerald', emoji: '🧠' },
  Domain: { color: 'orange', emoji: '🏭' },
}

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  type = 'HR',
  difficulty = 'medium',
}) => {
  const typeInfo = typeConfig[type] || typeConfig.HR
  const diffInfo = difficultyConfig[difficulty] || difficultyConfig.medium

  const getTimeColor = () => {
    if (!timeLeft) return 'text-slate-300'
    if (timeLeft < 30) return 'text-red-400'
    if (timeLeft < 60) return 'text-yellow-400'
    return 'text-slate-300'
  }

  const formatTime = (seconds) => {
    if (!seconds) return '--:--'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={questionNumber}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{typeInfo.emoji}</span>
          <Badge variant={typeInfo.color} size="sm">{type}</Badge>
          <Badge variant={diffInfo.color} size="sm">{diffInfo.label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {timeLeft !== undefined && (
            <div className={`flex items-center gap-1.5 text-sm font-mono font-medium ${getTimeColor()}`}>
              <FiClock size={14} />
              {formatTime(timeLeft)}
            </div>
          )}
          <span className="text-sm text-slate-500 font-medium">
            {questionNumber}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="relative">
        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-transparent" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-white text-lg md:text-xl font-medium leading-relaxed pl-2"
        >
          {question}
        </motion.p>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 p-3 bg-white/3 rounded-xl border border-white/5"
      >
        <p className="text-xs text-slate-500">
          💡 <span className="text-slate-400">Tip:</span> Use the STAR method — describe the{' '}
          <span className="text-violet-400">Situation</span>,{' '}
          <span className="text-cyan-400">Task</span>,{' '}
          <span className="text-emerald-400">Action</span>, and{' '}
          <span className="text-yellow-400">Result</span>.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default QuestionCard
