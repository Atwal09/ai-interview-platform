import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiTrendingUp, FiAlertCircle, FiArrowRight, FiHome, FiBarChart2 } from 'react-icons/fi'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

function ScoreRing({ score, label, color = '#8b5cf6', size = 80 }) {
  const r = 32, circ = 2 * Math.PI * r
  const offset = circ - (Math.min(score || 0, 100) / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score || 0}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center">{label}</span>
    </div>
  )
}

// Extract readable text from any AI item shape
function extractText(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  // strength/weakness: {area, detail} or {area, detail, priority}
  if (item.detail) return item.area ? `${item.area}: ${item.detail}` : item.detail
  // action item: {task, timeframe, resource}
  if (item.task) {
    let text = item.task
    if (item.timeframe) text += ` (${item.timeframe})`
    if (item.resource) text += ` — ${item.resource}`
    return text
  }
  // generic fallbacks
  return item.point || item.text || item.action || item.description || item.content || JSON.stringify(item)
}

function StrengthItem({ item, index }) {
  const main = typeof item === 'string' ? item : (item.detail || item.point || item.text || '')
  const label = typeof item === 'object' && item.area ? item.area : null
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
      className="flex items-start gap-2.5 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
      <FiCheckCircle size={15} className="text-emerald-400 mt-0.5 shrink-0" />
      <div>
        {label && <div className="text-xs font-semibold text-emerald-400 mb-0.5">{label}</div>}
        <span className="text-sm text-slate-300">{main}</span>
      </div>
    </motion.div>
  )
}

function WeaknessItem({ item, index }) {
  const main = typeof item === 'string' ? item : (item.detail || item.point || item.text || '')
  const label = typeof item === 'object' && item.area ? item.area : null
  const priority = typeof item === 'object' && item.priority ? item.priority : null
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
      className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
      <FiAlertCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          {label && <div className="text-xs font-semibold text-amber-400">{label}</div>}
          {priority && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              priority === 'high' ? 'bg-rose-500/15 text-rose-400' :
              priority === 'medium' ? 'bg-amber-500/15 text-amber-400' :
              'bg-slate-500/15 text-slate-400'
            }`}>{priority}</span>
          )}
        </div>
        <span className="text-sm text-slate-300">{main}</span>
      </div>
    </motion.div>
  )
}

export default function InterviewFeedbackDashboard({ interview, responses, overallScore }) {
  const navigate = useNavigate()
  const ai = interview?.aiFeedback || {}

  const radarData = [
    { subject: 'Communication', A: interview?.communicationScore || 0 },
    { subject: 'Technical', A: interview?.technicalScore || 0 },
    { subject: 'Confidence', A: interview?.confidenceScore || 0 },
    { subject: 'Structure', A: Math.round((interview?.communicationScore || 0) * 0.9) },
    { subject: 'Clarity', A: Math.round((overallScore || 0) * 0.95) },
    { subject: 'Depth', A: Math.round((interview?.technicalScore || 0) * 0.85) },
  ]

  const barData = (responses || []).slice(0, 8).map((r, i) => ({
    name: `Q${i + 1}`,
    score: r.score || 0,
  }))

  const strengths = Array.isArray(ai.strengths) ? ai.strengths.slice(0, 4) : [
    'Clear and structured responses', 'Good use of examples',
    'Maintained professional tone', 'Showed relevant knowledge'
  ]

  const weaknesses = Array.isArray(ai.weaknesses) ? ai.weaknesses.slice(0, 4) : [
    'Could elaborate more on technical details',
    'Reduce filler words for cleaner delivery',
    'Practice STAR method for behavioral questions',
  ]

  const rating = ai.overallRating || 'average'
  const ratingConfig = {
    excellent: { text: 'Excellent! 🌟', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { text: 'Good Job! 👍', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    average: { text: 'Keep Practicing! 💪', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    needs_improvement: { text: 'Room to Grow 📚', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  }
  const rc = ratingConfig[rating] || ratingConfig.average

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <FiCheckCircle size={16} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-base font-semibold text-white">Interview Complete!</h1>
            <p className="text-xs text-slate-400">{interview?.title || 'Mock Interview'} · {interview?.difficulty}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/interview')}
            className="flex items-center gap-1.5 text-sm border border-white/10 hover:border-violet-500/50 text-slate-400 hover:text-violet-300 px-4 py-2 rounded-xl transition-all">
            New Interview
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20">
            <FiHome size={14} /> Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Overall Score Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-violet-900/40 via-slate-900/60 to-cyan-900/40 border border-white/10 rounded-2xl p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-cyan-500/5" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Big score */}
            <div className="text-center">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                className="text-7xl font-black bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {overallScore || 0}
              </motion.div>
              <div className="text-sm text-slate-400 mt-1">out of 100</div>
            </div>

            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-3 ${rc.bg} ${rc.color}`}>
                {rc.text}
              </div>
              {ai.summary && <p className="text-sm text-slate-300 leading-relaxed">{ai.summary}</p>}
              <div className="flex gap-4 mt-4">
                <ScoreRing score={interview?.communicationScore} label="Communication" color="#06b6d4" />
                <ScoreRing score={interview?.technicalScore} label="Technical" color="#8b5cf6" />
                <ScoreRing score={interview?.confidenceScore} label="Confidence" color="#10b981" />
                <ScoreRing score={overallScore} label="Overall" color="#f59e0b" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FiBarChart2 size={15} className="text-violet-400" /> Skill Radar
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff08" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25}
                  dot={{ fill: '#8b5cf6', r: 3 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Per-question Bar Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp size={15} className="text-cyan-400" /> Score Per Question
            </h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e1f2e', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 70 ? '#8b5cf6' : entry.score >= 50 ? '#06b6d4' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No response data</div>
            )}
          </motion.div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-emerald-400 mb-3">✅ Strengths</h2>
            <div className="space-y-2">
              {strengths.map((s, i) => <StrengthItem key={i} item={s} index={i} />)}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-amber-400 mb-3">⚠️ Areas to Improve</h2>
            <div className="space-y-2">
              {weaknesses.map((w, i) => <WeaknessItem key={i} item={w} index={i} />)}
            </div>
          </motion.div>
        </div>

        {/* Action Items */}
        {Array.isArray(ai.actionItems) && ai.actionItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-violet-400 mb-3">🎯 Action Plan</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {ai.actionItems.slice(0, 6).map((item, i) => {
                const task = typeof item === 'string' ? item : (item.task || item.action || item.description || JSON.stringify(item))
                const timeframe = typeof item === 'object' && item.timeframe ? item.timeframe : null
                const resource = typeof item === 'object' && item.resource ? item.resource : null
                return (
                  <div key={i} className="flex items-start gap-2 p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                    <span className="text-violet-400 text-xs font-bold mt-0.5 shrink-0">{i + 1}.</span>
                    <div>
                      <div className="text-sm text-slate-300">{task}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {timeframe && <span className="text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">⏱ {timeframe}</span>}
                        {resource && <span className="text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">🔗 {resource}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Per-question breakdown */}
        {responses && responses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white">📋 Question-by-Question Analysis</h2>
            </div>
            <div className="divide-y divide-white/5">
              {responses.slice(0, 6).map((r, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-sm text-slate-300 font-medium flex-1">{r.questionText || `Question ${i + 1}`}</p>
                    <div className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      (r.score || 0) >= 70 ? 'bg-emerald-500/15 text-emerald-400' :
                      (r.score || 0) >= 50 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>{r.score || 0}/100</div>
                  </div>
                  {r.overallFeedback && (
                    <p className="text-xs text-slate-500 mb-2">{r.overallFeedback}</p>
                  )}
                  <div className="flex gap-4 text-xs">
                    {r.strengths?.length > 0 && (
                      <span className="text-emerald-400">✓ {r.strengths[0]}</span>
                    )}
                    {r.improvements?.length > 0 && (
                      <span className="text-amber-400">→ {r.improvements[0]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex gap-3 justify-center pb-4">
          <button onClick={() => navigate('/interview')}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25">
            Practice Again <FiArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/analytics')}
            className="flex items-center gap-2 border border-white/20 hover:border-violet-500/50 text-slate-300 hover:text-violet-300 px-6 py-3 rounded-xl font-semibold text-sm transition-all">
            <FiBarChart2 size={16} /> View Analytics
          </button>
        </motion.div>
      </div>
    </div>
  )
}
