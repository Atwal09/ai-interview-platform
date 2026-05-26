import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
}) => {
  const overlayRef = useRef(null)

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`
              w-full ${sizes[size] || sizes.md}
              bg-dark-900/95 backdrop-blur-xl
              border border-white/10 rounded-2xl
              shadow-[0_24px_64px_rgba(0,0,0,0.6)]
              overflow-hidden
              ${className}
            `}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                {title && (
                  <h3 className="text-lg font-semibold text-white font-display">{title}</h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-auto"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
