import { motion, AnimatePresence } from 'framer-motion'

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'right', 'kind of', 'sort of', 'i mean', 'well']

export function countFillerWords(text) {
  if (!text) return 0
  const lower = text.toLowerCase()
  let count = 0
  FILLER_WORDS.forEach(fw => {
    const re = new RegExp(`\\b${fw}\\b`, 'gi')
    const matches = lower.match(re)
    if (matches) count += matches.length
  })
  return count
}

export function calcWPM(text, elapsedSeconds) {
  if (!text || elapsedSeconds < 5) return 0
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.round((words / elapsedSeconds) * 60)
}

export function calcConfidence(wpm, fillerCount, wordCount) {
  if (wordCount < 5) return 0
  let score = 85
  // Deduct for filler words
  score -= Math.min(fillerCount * 4, 30)
  // WPM penalty (ideal: 110-160)
  if (wpm > 0) {
    if (wpm < 80) score -= 15
    else if (wpm < 100) score -= 8
    else if (wpm > 180) score -= 10
    else if (wpm > 200) score -= 20
  }
  return Math.max(10, Math.min(99, score))
}

function GlowBar({ value, max = 100, color = 'violet', label, suffix = '%' }) {
  const pct = Math.round((value / max) * 100)
  const colors = {
    violet: { bar: 'from-violet-600 to-violet-400', glow: 'shadow-violet-500/40', text: 'text-violet-300' },
    cyan: { bar: 'from-cyan-600 to-cyan-400', glow: 'shadow-cyan-500/40', text: 'text-cyan-300' },
    emerald: { bar: 'from-emerald-600 to-emerald-400', glow: 'shadow-emerald-500/40', text: 'text-emerald-300' },
    amber: { bar: 'from-amber-600 to-amber-400', glow: 'shadow-amber-500/40', text: 'text-amber-300' },
    rose: { bar: 'from-rose-600 to-rose-400', glow: 'shadow-rose-500/40', text: 'text-rose-300' },
  }
  const c = colors[color] || colors.violet

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <motion.span key={value} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
          className={`text-xs font-bold ${c.text}`}>
          {value}{suffix}
        </motion.span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${c.bar} shadow-lg ${c.glow}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function LiveSpeechMetrics({ transcript, isRecording, elapsedSeconds, emotion }) {
  const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0
  const fillerCount = countFillerWords(transcript)
  const wpm = calcWPM(transcript, elapsedSeconds)
  const confidence = calcConfidence(wpm, fillerCount, wordCount)

  const tone = wpm === 0 ? 'Waiting...'
    : wpm < 90 ? 'Too Slow'
    : wpm < 110 ? 'Measured'
    : wpm < 150 ? 'Confident'
    : wpm < 175 ? 'Fast'
    : 'Rushing'

  const toneColor = wpm === 0 ? 'text-slate-500'
    : wpm < 90 ? 'text-amber-400'
    : wpm < 110 ? 'text-cyan-400'
    : wpm < 150 ? 'text-emerald-400'
    : wpm < 175 ? 'text-amber-400'
    : 'text-rose-400'

  const eyeContactScore = isRecording ? Math.min(95, 65 + confidence * 0.3) : 0
  const eyeContactLabel = eyeContactScore > 80 ? 'Excellent' : eyeContactScore > 60 ? 'Good' : eyeContactScore > 40 ? 'Fair' : 'Poor'

  const emotionConfig = {
    Confident: { color: 'emerald', emoji: '💪' },
    Focused: { color: 'cyan', emoji: '🎯' },
    Engaged: { color: 'violet', emoji: '✨' },
    Calm: { color: 'cyan', emoji: '😌' },
    Nervous: { color: 'amber', emoji: '😰' },
    Thinking: { color: 'violet', emoji: '🤔' },
  }
  const ec = emotionConfig[emotion] || emotionConfig.Focused

  const fillerBarColor = fillerCount === 0 ? 'emerald' : fillerCount < 3 ? 'cyan' : fillerCount < 6 ? 'amber' : 'rose'

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Analysis</h3>
        <motion.div animate={{ opacity: isRecording ? [1, 0.3, 1] : 0.3 }} transition={{ duration: 1.2, repeat: Infinity }}>
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-slate-600'}`} />
        </motion.div>
      </div>

      {/* Confidence */}
      <GlowBar label="Confidence" value={confidence} color="violet" />

      {/* Speaking Speed */}
      <GlowBar label="Speaking Speed" value={Math.min(wpm, 200)} max={200} color="cyan" suffix=" wpm" />

      {/* Eye Contact */}
      <GlowBar label="Eye Contact" value={Math.round(eyeContactScore)} color="emerald" />

      {/* Filler Words */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Filler Words</span>
          <motion.span key={fillerCount} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
            className={`text-xs font-bold ${fillerCount === 0 ? 'text-emerald-400' : fillerCount < 4 ? 'text-amber-400' : 'text-rose-400'}`}>
            {fillerCount} found
          </motion.span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${
              fillerBarColor === 'emerald' ? 'from-emerald-600 to-emerald-400' :
              fillerBarColor === 'cyan' ? 'from-cyan-600 to-cyan-400' :
              fillerBarColor === 'amber' ? 'from-amber-600 to-amber-400' : 'from-rose-600 to-rose-400'
            }`}
            animate={{ width: `${Math.min((fillerCount / 10) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Quick badges */}
      <div className="space-y-2">
        {/* Tone */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Tone</span>
          <motion.span key={tone} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }}
            className={`text-xs font-semibold ${toneColor}`}>{tone}</motion.span>
        </div>

        {/* Eye contact label */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Eye Contact</span>
          <span className={`text-xs font-semibold ${eyeContactScore > 80 ? 'text-emerald-400' : eyeContactScore > 60 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {eyeContactLabel}
          </span>
        </div>

        {/* Emotion */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Expression</span>
          <motion.span key={emotion} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs font-semibold text-violet-300">
            {ec.emoji} {emotion}
          </motion.span>
        </div>

        {/* Word count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Words Spoken</span>
          <span className="text-xs font-semibold text-slate-300">{wordCount}</span>
        </div>
      </div>

      {/* Tip */}
      <AnimatePresence mode="wait">
        {wpm > 170 && (
          <motion.div key="fast" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-auto text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-amber-300">
            ⚡ Slow down — you're speaking too fast!
          </motion.div>
        )}
        {fillerCount >= 5 && (
          <motion.div key="filler" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-auto text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-rose-300">
            🚫 Avoid filler words like "um", "like", "basically"
          </motion.div>
        )}
        {confidence >= 80 && isRecording && (
          <motion.div key="great" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-auto text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-emerald-300">
            ✅ Great delivery — keep it up!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
