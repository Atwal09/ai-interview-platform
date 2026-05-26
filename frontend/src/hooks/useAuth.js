import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, logoutUser, forgotPasswordAction, clearError } from '../store/authSlice'

const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth)

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }))
    if (!result.error) {
      navigate('/dashboard')
    }
    return result
  }

  const register = async (name, email, password, role) => {
    const result = await dispatch(registerUser({ name, email, password, role }))
    if (!result.error) {
      navigate('/dashboard')
    }
    return result
  }

  const logout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }

  const forgotPassword = async (email) => {
    return dispatch(forgotPasswordAction(email))
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  const isAdmin = user?.role === 'admin'
  const isRecruiter = user?.role === 'recruiter'
  const isCandidate = user?.role === 'candidate'

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isAdmin,
    isRecruiter,
    isCandidate,
    login,
    register,
    logout,
    forgotPassword,
    clearAuthError,
  }
}

export default useAuth
