import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'

const variants = {
  primary: 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-violet-500/25',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-violet-500/40',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40',
  outline: 'bg-transparent border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/70',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-emerald-500/25',
  dark: 'bg-dark-900 hover:bg-dark-800 text-white border border-white/5 hover:border-white/10',
}

const sizes = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <FiLoader className="animate-spin w-4 h-4" />
      ) : (
        icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </motion.button>
  )
}

export default Button
