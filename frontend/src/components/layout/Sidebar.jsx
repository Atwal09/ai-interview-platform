import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  FiGrid, FiVideo, FiFileText, FiBarChart2, FiUser,
  FiShield, FiChevronLeft, FiChevronRight, FiLogOut,
} from 'react-icons/fi'
import { logoutUser } from '../../store/authSlice'
import { getInitials, getAvatarGradient } from '../../utils/helpers'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: FiGrid },
  { label: 'Interviews', href: '/interview', icon: FiVideo },
  { label: 'Resume', href: '/resume', icon: FiFileText },
  { label: 'Analytics', href: '/analytics', icon: FiBarChart2 },
  { label: 'Profile', href: '/profile', icon: FiUser },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const initials = getInitials(user?.name)
  const gradient = getAvatarGradient(user?.name)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }

  const isActive = (href) => location.pathname === href

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="h-screen bg-dark-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col fixed top-0 left-0 z-30 overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-glow-violet flex-shrink-0">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-display font-bold text-base whitespace-nowrap">
                <span className="gradient-text">Interview</span>
                <span className="text-white">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${collapsed ? 'hidden' : ''}`}
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            title={collapsed ? label : undefined}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${isActive(href)
                ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20 shadow-glow-violet'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Icon
              size={18}
              className={`flex-shrink-0 ${isActive(href) ? 'text-violet-400' : 'text-slate-400 group-hover:text-white'}`}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive(href) && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute right-3 w-1.5 h-4 bg-violet-400 rounded-full"
              />
            )}
          </Link>
        ))}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <div className={`pt-3 pb-1 ${collapsed ? 'px-0' : 'px-2'}`}>
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Admin</p>
              )}
              {collapsed && <div className="border-t border-white/5" />}
            </div>
            <Link
              to="/admin"
              title={collapsed ? 'Admin' : undefined}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive('/admin')
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <FiShield size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">Admin Panel</span>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Toggle button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-3 mb-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all flex justify-center"
        >
          <FiChevronRight size={16} />
        </button>
      )}

      {/* User info at bottom */}
      <div className={`px-3 py-3 border-t border-white/5 ${collapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
