import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { FiBell, FiX, FiCheck, FiTrash2 } from 'react-icons/fi'
import {
  markAsRead, markAllAsRead, removeNotification,
  clearAllNotifications, togglePanel
} from '../../store/notificationSlice'
import { formatRelativeTime } from '../../utils/helpers'

const notifTypeColors = {
  success: 'text-emerald-400 bg-emerald-500/10',
  error: 'text-red-400 bg-red-500/10',
  warning: 'text-yellow-400 bg-yellow-500/10',
  interview: 'text-violet-400 bg-violet-500/10',
  default: 'text-blue-400 bg-blue-500/10',
}

const NotificationPanel = () => {
  const dispatch = useDispatch()
  const { notifications, unreadCount, isPanelOpen } = useSelector((state) => state.notifications)

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(togglePanel())}
            className="fixed inset-0 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-20 right-4 z-50 w-96 bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FiBell size={18} className="text-violet-400" />
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full border border-violet-500/30">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllAsRead())}
                    className="text-xs text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => dispatch(clearAllNotifications())}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => dispatch(togglePanel())}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <FiBell size={22} className="text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">All caught up!</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Notifications will appear here after you complete interviews or upload resumes.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`group flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/3 transition-all cursor-pointer ${
                        !notif.read ? 'bg-violet-500/3' : ''
                      }`}
                      onClick={() => dispatch(markAsRead(notif.id))}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                        notifTypeColors[notif.type] || notifTypeColors.default
                      }`}>
                        {notif.type === 'success' ? '✓' : notif.type === 'error' ? '✗' : '●'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatRelativeTime(notif.timestamp)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); dispatch(markAsRead(notif.id)) }}
                            className="p-1 rounded text-slate-500 hover:text-emerald-400 transition-colors"
                          >
                            <FiCheck size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); dispatch(removeNotification(notif.id)) }}
                          className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationPanel
