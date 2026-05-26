import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useWebSocket from '../../hooks/useWebSocket'
import AIChatbot from '../chatbot/AIChatbot'

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Initialize WebSocket connection
  useWebSocket()

  const sidebarWidth = sidebarCollapsed ? 72 : 240

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-orb bg-orb-violet w-96 h-96 top-1/4 right-1/4 opacity-5" />
        <div className="bg-orb bg-orb-cyan w-80 h-80 bottom-1/4 left-1/3 opacity-5" />
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="flex-1 min-h-screen flex flex-col relative"
      >
        <Navbar showDashboardLinks transparent={false} />
        <div className="flex-1 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
      <AIChatbot />
    </div>
  )
}

export default DashboardLayout
