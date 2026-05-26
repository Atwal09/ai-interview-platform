import { motion } from 'framer-motion'
import Badge from '../ui/Badge'
import { FiArrowRight, FiAlertCircle, FiInfo } from 'react-icons/fi'

const priorityConfig = {
  high: { variant: 'high', label: 'High', icon: FiAlertCircle, border: 'border-red-500/20 bg-red-500/3' },
  medium: { variant: 'medium', label: 'Medium', icon: FiInfo, border: 'border-yellow-500/20 bg-yellow-500/3' },
  low: { variant: 'low', label: 'Low', icon: FiArrowRight, border: 'border-emerald-500/20 bg-emerald-500/3' },
}

const defaultSuggestions = [
  {
    id: 1,
    priority: 'high',
    title: 'Add quantifiable achievements',
    description: 'Replace vague descriptions with specific numbers and metrics (e.g., "Increased sales by 35%").',
    category: 'Content',
  },
  {
    id: 2,
    priority: 'high',
    title: 'Include more ATS keywords',
    description: 'Add industry-relevant keywords like "Agile", "CI/CD", "TypeScript", "REST APIs" to improve ATS compatibility.',
    category: 'Keywords',
  },
  {
    id: 3,
    priority: 'medium',
    title: 'Strengthen your professional summary',
    description: 'Your summary is too short. Add a 3-4 sentence overview highlighting your key skills and career goals.',
    category: 'Content',
  },
  {
    id: 4,
    priority: 'medium',
    title: 'Improve action verb usage',
    description: 'Start bullet points with strong action verbs like "Architected", "Spearheaded", "Optimized" instead of "Worked on".',
    category: 'Language',
  },
  {
    id: 5,
    priority: 'low',
    title: 'Add a LinkedIn URL',
    description: 'Including your LinkedIn profile URL increases credibility and gives recruiters more context.',
    category: 'Contact',
  },
  {
    id: 6,
    priority: 'low',
    title: 'Update formatting consistency',
    description: 'Ensure consistent date formats (e.g., "Jan 2023" vs "2023-01") throughout the document.',
    category: 'Formatting',
  },
]

const SuggestionList = ({ suggestions = null }) => {
  const items = suggestions || defaultSuggestions

  const groupedByPriority = {
    high: items.filter(s => s.priority === 'high'),
    medium: items.filter(s => s.priority === 'medium'),
    low: items.filter(s => s.priority === 'low'),
  }

  return (
    <div className="space-y-6">
      {['high', 'medium', 'low'].map(priority => {
        const group = groupedByPriority[priority]
        if (group.length === 0) return null
        const config = priorityConfig[priority]
        const IconComp = config.icon

        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={config.variant} size="sm" dot>
                {config.label} Priority
              </Badge>
              <span className="text-xs text-slate-500">({group.length} suggestions)</span>
            </div>
            <div className="space-y-2">
              {group.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-4 rounded-xl border ${config.border} transition-all hover:border-opacity-40`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <IconComp size={15} className={
                        priority === 'high' ? 'text-red-400' :
                        priority === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-sm text-white">{item.title}</p>
                        {item.category && (
                          <span className="px-2 py-0.5 text-[10px] bg-white/5 text-slate-400 rounded-md border border-white/5">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SuggestionList
