/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', { ...defaults, ...options })
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(dateString)
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in minutes to human-readable string
 */
export const formatDurationMinutes = (minutes) => {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Calculate a composite score from multiple metrics
 */
export const calculateScore = (metrics) => {
  if (!metrics || Object.keys(metrics).length === 0) return 0
  const values = Object.values(metrics).filter(v => typeof v === 'number')
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
}

/**
 * Truncate text to a specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Get color class based on score
 */
export const getScoreColor = (score) => {
  if (score >= 80) return 'emerald'
  if (score >= 60) return 'yellow'
  if (score >= 40) return 'orange'
  return 'red'
}

/**
 * Get color class string for Tailwind based on score
 */
export const getScoreColorClass = (score) => {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Get background color class based on score
 */
export const getScoreBgClass = (score) => {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400'
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-400'
  if (score >= 40) return 'bg-orange-500/20 text-orange-400'
  return 'bg-red-500/20 text-red-400'
}

/**
 * Format score as percentage string
 */
export const formatScore = (score, suffix = '%') => {
  if (score === null || score === undefined) return 'N/A'
  return `${Math.round(score)}${suffix}`
}

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Generate initials from a full name
 */
export const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')
}

/**
 * Generate a gradient based on initials/name for avatar
 */
export const getAvatarGradient = (name) => {
  const gradients = [
    'from-violet-500 to-cyan-500',
    'from-emerald-500 to-cyan-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-violet-500',
    'from-blue-500 to-violet-500',
    'from-yellow-500 to-orange-500',
  ]
  if (!name) return gradients[0]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const strength = Object.values(checks).filter(Boolean).length
  return { checks, strength, isStrong: strength >= 4 }
}

/**
 * Count filler words in transcription
 */
export const countFillerWords = (text) => {
  if (!text) return { count: 0, words: {} }
  const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'sort of', 'kind of', 'right']
  const words = {}
  let count = 0

  fillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = text.match(regex) || []
    if (matches.length > 0) {
      words[filler] = matches.length
      count += matches.length
    }
  })

  return { count, words }
}

/**
 * Calculate words per minute from text and duration
 */
export const calculateWPM = (text, durationSeconds) => {
  if (!text || !durationSeconds) return 0
  const wordCount = text.trim().split(/\s+/).length
  const minutes = durationSeconds / 60
  return Math.round(wordCount / minutes)
}

/**
 * Generate a color from a string (for consistent coloring)
 */
export const stringToColor = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Debounce function
 */
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Deep clone an object
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

/**
 * Sort array of objects by key
 */
export const sortByKey = (arr, key, direction = 'asc') => {
  return [...arr].sort((a, b) => {
    if (direction === 'asc') return a[key] > b[key] ? 1 : -1
    return a[key] < b[key] ? 1 : -1
  })
}

/**
 * Get trend indicator based on value change
 */
export const getTrend = (current, previous) => {
  if (!previous) return { direction: 'neutral', percentage: 0 }
  const change = ((current - previous) / previous) * 100
  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    percentage: Math.abs(Math.round(change)),
  }
}

/**
 * Parse JWT token
 */
export const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true
  const decoded = parseJWT(token)
  if (!decoded?.exp) return true
  return Date.now() >= decoded.exp * 1000
}
