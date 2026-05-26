import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const showTooltip = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-700',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 px-3 py-1.5 text-xs font-medium text-white
              bg-slate-800 border border-white/10 rounded-lg whitespace-nowrap
              shadow-xl pointer-events-none
              ${positionClasses[position] || positionClasses.top}
              ${className}
            `}
          >
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position] || arrowClasses.top}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tooltip
