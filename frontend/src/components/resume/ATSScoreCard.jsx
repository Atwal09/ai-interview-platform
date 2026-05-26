import { motion } from 'framer-motion'
import ScoreGauge from '../ui/ScoreGauge'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

const checklistItems = [
  { label: 'Proper file format (PDF)', key: 'fileFormat', default: true },
  { label: 'Contact information present', key: 'contactInfo', default: true },
  { label: 'Professional summary', key: 'summary', default: false },
  { label: 'Work experience section', key: 'experience', default: true },
  { label: 'Education section', key: 'education', default: true },
  { label: 'Skills section', key: 'skills', default: true },
  { label: 'No tables or images', key: 'noTables', default: true },
  { label: 'Standard fonts used', key: 'standardFonts', default: true },
  { label: 'Keyword optimization', key: 'keywords', default: false },
  { label: 'Appropriate length (1-2 pages)', key: 'length', default: true },
]

const ATSScoreCard = ({ score = 72, breakdown = null, checklist = null }) => {
  const atsBreakdown = breakdown || [
    { label: 'Keywords Match', value: 65, color: 'violet' },
    { label: 'Formatting', value: 88, color: 'cyan' },
    { label: 'Content Quality', value: 74, color: 'emerald' },
    { label: 'Readability', value: 82, color: 'yellow' },
  ]

  const defaultChecklist = checklist ||
    checklistItems.map(item => ({ ...item, passed: item.default }))

  const passedCount = defaultChecklist.filter(i => i.passed).length

  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className="flex flex-col sm:flex-row items-center gap-8 p-6 glass-card">
        <div className="flex flex-col items-center">
          <ScoreGauge score={score} size={160} label="ATS Score" />
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-white">
              {score >= 80 ? '🎉 Excellent!' : score >= 60 ? '👍 Good' : score >= 40 ? '⚠️ Needs Work' : '❌ Poor'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {score >= 80
                ? 'Your resume is well-optimized for ATS systems'
                : score >= 60
                ? 'Minor improvements will boost your score'
                : 'Significant improvements needed for ATS compatibility'
              }
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 w-full space-y-4">
          {atsBreakdown.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProgressBar
                value={item.value}
                color={item.color}
                label={item.label}
                showValue
                size="sm"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ATS Checklist */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">ATS Compatibility Checklist</h3>
          <Badge variant={passedCount >= 8 ? 'emerald' : passedCount >= 5 ? 'warning' : 'danger'}>
            {passedCount}/{defaultChecklist.length} Passed
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {defaultChecklist.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl ${
                item.passed ? 'bg-emerald-500/5 border border-emerald-500/15' : 'bg-red-500/5 border border-red-500/15'
              }`}
            >
              {item.passed ? (
                <FiCheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <FiXCircle size={15} className="text-red-400 flex-shrink-0" />
              )}
              <span className={`text-xs ${item.passed ? 'text-slate-300' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ATSScoreCard
