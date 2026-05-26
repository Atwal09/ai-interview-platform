import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiFile, FiX, FiCheckCircle } from 'react-icons/fi'
import { formatFileSize } from '../../utils/helpers'

const DropZone = ({ onFileSelect, accept = '.pdf', maxSize = 5 * 1024 * 1024, uploading = false }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (!file) return 'No file selected'
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted'
    if (file.size > maxSize) return `File size must be under ${formatFileSize(maxSize)}`
    return null
  }

  const handleFile = (file) => {
    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSelectedFile(file)
    onFileSelect?.(file)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="dropzone-input"
      />

      <motion.div
        animate={{
          borderColor: isDragging
            ? 'rgba(139, 92, 246, 0.6)'
            : selectedFile
            ? 'rgba(16, 185, 129, 0.4)'
            : error
            ? 'rgba(239, 68, 68, 0.4)'
            : 'rgba(255, 255, 255, 0.08)',
          backgroundColor: isDragging
            ? 'rgba(139, 92, 246, 0.05)'
            : 'rgba(255, 255, 255, 0.02)',
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all
          ${!selectedFile && !uploading ? 'cursor-pointer' : ''}
        `}
      >
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <FiCheckCircle size={28} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{selectedFile.name}</p>
                <p className="text-sm text-slate-400 mt-1">{formatFileSize(selectedFile.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile() }}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <FiX size={14} /> Remove
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload-area"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDragging ? 'bg-violet-500/30' : 'bg-white/5'
                }`}
              >
                <FiUpload size={28} className={isDragging ? 'text-violet-400' : 'text-slate-400'} />
              </motion.div>
              <div>
                <p className="text-white font-semibold text-lg">
                  {isDragging ? 'Drop your PDF here' : 'Upload your resume'}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Drag & drop or{' '}
                  <label htmlFor="dropzone-input" className="text-violet-400 hover:text-violet-300 cursor-pointer underline">
                    browse files
                  </label>
                </p>
                <p className="text-slate-600 text-xs mt-2">PDF only · Max {formatFileSize(maxSize)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-sm text-red-400"
        >
          <FiX size={14} />
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default DropZone
