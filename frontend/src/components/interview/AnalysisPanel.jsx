import { motion } from 'framer-motion'
import { FiCheckCircle, FiAlertCircle, FiBarChart2, FiZap } from 'react-icons/fi'

function Bar({ label, value, color }) {
  const colors = {
    violet: 'from-violet-600 to-violet-400',
    cyan: 'from-cyan-600 to-cyan-400',
    emerald: 'from-emerald-600 to-emerald-400',
    amber: 'from-amber-600 to-amber-400',
  }
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{Math.round(value || 0)}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value || 0, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function AnalysisPanel({ analysis }) {
  // analysis is from backend: { score, strengths, improvements, overall_feedback, communication_score, technical_accuracy, structure_score, filler_word_count, words_per_minute }
  const score = analysis?.score ?? 72
  const communicationScore = analysis?.communication_score ?? analysis?.communicationScore ?? 70
  const technicalScore = analysis?.technical_accuracy ?? analysis?.technicalAccuracy ?? 65
  const structureScore = analysis?.structure_score ?? analysis?.structureScore ?? 70
  const fillerCount = analysis?.filler_word_count ?? analysis?.fillerWordCount ?? 0
  const wpm = analysis?.words_per_minute ?? analysis?.wordsPerMinute ?? 0
  const strengths = analysis?.strengths || ['Good structure', 'Clear delivery']
  const improvements = analysis?.improvements || ['Add more specific examples', 'Reduce filler words']
  const feedback = analysis?.overall_feedback ?? analysis?.overallFeedback ?? ''

  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-cyan-400' : 'text-amber-400'
  const scoreBg = score >= 80 ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20'
    : score >= 60 ? 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20'
    : 'from-amber-500/10 to-amber-500/5 border-amber-500/20'

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-violet-500/15 rounded-lg flex items-center justify-center">
          <FiBarChart2 size={14} className="text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Answer Analysis</h3>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-violet-300">
          <FiZap size={12} /> AI Scored
        </div>
      </div>

      {/* Score */}
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`p-4 bg-gradient-to-br ${scoreBg} border rounded-xl flex items-center gap-4`}>
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`text-4xl font-black ${scoreColor}`}>{Math.round(score)}</motion.div>
          <div className="text-xs text-slate-500 mt-0.5">/ 100</div>
        </div>
        <div className="flex-1 space-y-2">
          <Bar label="Communication" value={communicationScore} color="cyan" />
          <Bar label="Technical Accuracy" value={technicalScore} color="violet" />
          <Bar label="Structure" value={structureScore} color="emerald" />
        </div>
      </motion.div>

      {/* Stats row */}
      {(fillerCount > 0 || wpm > 0) && (
        <div className="flex gap-3 text-xs">
          {fillerCount > 0 && (
            <div className={`flex-1 p-2 rounded-lg border text-center ${fillerCount > 4 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
              <div className={`font-bold text-base ${fillerCount > 4 ? 'text-rose-400' : 'text-amber-400'}`}>{fillerCount}</div>
              <div className="text-slate-500">filler words</div>
            </div>
          )}
          {wpm > 0 && (
            <div className="flex-1 p-2 rounded-lg border bg-cyan-500/10 border-cyan-500/20 text-center">
              <div className="font-bold text-base text-cyan-400">{wpm}</div>
              <div className="text-slate-500">words/min</div>
            </div>
          )}
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
          <p className="text-xs text-violet-300 font-medium mb-1">💡 AI Feedback</p>
          <p className="text-xs text-slate-400 leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-emerald-400 flex items-center gap-1"><FiCheckCircle size={11} /> Strengths</p>
          {strengths.slice(0, 2).map((s, i) => (
            <div key={i} className="text-xs text-slate-400 pl-3 border-l border-emerald-500/30">{s}</div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-amber-400 flex items-center gap-1"><FiAlertCircle size={11} /> Improve</p>
          {improvements.slice(0, 2).map((m, i) => (
            <div key={i} className="text-xs text-slate-400 pl-3 border-l border-amber-500/30">{m}</div>
          ))}
        </div>
      )}
    </div>
  )
}
