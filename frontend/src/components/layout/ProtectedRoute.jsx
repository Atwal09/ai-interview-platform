import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const token = localStorage.getItem('token')

  // Not authenticated at all
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />
  }

  // Admin-only guard
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Render child routes via Outlet (React Router v6 layout route pattern)
  return <Outlet />
}

export default ProtectedRoute
