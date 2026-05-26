import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  glow = false,
  glowColor = 'violet',
  padding = true,
  onClick,
  animate = true,
  ...props
}) => {
  const glowClasses = {
    violet: 'hover:shadow-glow-violet hover:border-violet-500/20',
    cyan: 'hover:shadow-glow-cyan hover:border-cyan-500/20',
    emerald: 'hover:shadow-glow-emerald hover:border-emerald-500/20',
  }

  return (
    <motion.div
      whileHover={hover && animate ? { y: -2, scale: 1.005 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className={`
        glass-card
        ${padding ? 'p-6' : ''}
        ${hover ? 'transition-all duration-300 cursor-pointer' : ''}
        ${hover ? (glowClasses[glowColor] || glowClasses.violet) : ''}
        ${gradient ? 'bg-gradient-to-br from-violet-500/10 to-cyan-500/5' : ''}
        ${glow ? `shadow-glow-${glowColor}` : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
