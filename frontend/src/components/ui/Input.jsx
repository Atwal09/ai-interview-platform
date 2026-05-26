import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  type = 'text',
  className = '',
  inputClassName = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-violet-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <motion.input
          ref={ref}
          type={type}
          disabled={disabled}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`
            w-full bg-white/5 border rounded-xl px-4 py-3 text-white
            placeholder-slate-500 transition-all duration-200 outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'
            }
            ${inputClassName}
          `}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
