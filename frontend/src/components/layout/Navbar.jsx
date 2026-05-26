import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiBell, FiUser, FiSettings, FiLogOut, FiMenu, FiX,
  FiChevronDown, FiMoon, FiSun
} from 'react-icons/fi'
import { logoutUser } from '../../store/authSlice'
import { togglePanel } from '../../store/notificationSlice'
import { getInitials, getAvatarGradient } from '../../utils/helpers'
import { NAV_LINKS } from '../../utils/constants'
import NotificationPanel from '../notifications/NotificationPanel'

const Navbar = ({ transparent = false, showDashboardLinks = false }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropOpen, setUserDropOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }

  const initials = getInitials(user?.name)
  const gradient = getAvatarGradient(user?.name)

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${scrolled || !transparent
            ? 'bg-dark-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-glow-violet">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-display font-bold text-xl">
                <span className="gradient-text">Interview</span>
                <span className="text-white">AI</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {!showDashboardLinks && NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === link.href
                      ? 'text-violet-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell — badge only shows when there are unread */}
                  <motion.button
                    onClick={() => dispatch(togglePanel())}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <motion.div
                      animate={unreadCount > 0 ? { rotate: [0, -10, 10, -6, 6, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <FiBell size={18} />
                    </motion.div>
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-violet-500/40"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* User Dropdown */}
                  <div ref={dropRef} className="relative">
                    <button
                      onClick={() => setUserDropOpen(!userDropOpen)}
                      className="flex items-center gap-2 p-1 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-xs`}>
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          initials
                        )}
                      </div>
                      <span className="text-sm font-medium text-white hidden sm:block max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <FiChevronDown size={14} className={`text-slate-400 transition-transform ${userDropOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {userDropOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                        >
                          <div className="p-3 border-b border-white/5">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                          </div>
                          <div className="p-2">
                            <Link
                              to="/dashboard"
                              onClick={() => setUserDropOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                            >
                              <FiUser size={15} /> Dashboard
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setUserDropOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
                            >
                              <FiSettings size={15} /> Settings
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
                            >
                              <FiLogOut size={15} /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-dark-950/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-2">
                {NAV_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    {link.label}
                  </a>
                ))}
                {!isAuthenticated && (
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-center text-slate-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-center text-white btn-primary text-sm font-medium"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <NotificationPanel />
    </>
  )
}

export default Navbar
