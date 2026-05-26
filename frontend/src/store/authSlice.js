import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'
import toast from 'react-hot-toast'

const storedToken = localStorage.getItem('token')
const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
})()

const initialState = {
  user: storedUser || null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
  emailVerified: false,
  passwordResetSent: false,
}

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success(`Welcome back, ${response.data.user.name}!`)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await authService.register(name, email, password, role)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success('Account created! Please verify your email.')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.success('Logged out successfully.')
      return null
    } catch (error) {
      return rejectWithValue('Logout failed')
    }
  }
)

export const forgotPasswordAction = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      toast.success('Password reset email sent!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const resetPasswordAction = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password)
      toast.success('Password reset successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateProfileAction = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success('Profile updated successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user || action.payload
      state.token = action.payload.token || state.token
      state.isAuthenticated = true
    },
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
    // Forgot Password
    builder
      .addCase(forgotPasswordAction.pending, (state) => {
        state.loading = true
      })
      .addCase(forgotPasswordAction.fulfilled, (state) => {
        state.loading = false
        state.passwordResetSent = true
      })
      .addCase(forgotPasswordAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // Update Profile
    builder
      .addCase(updateProfileAction.pending, (state) => {
        state.loading = true
      })
      .addCase(updateProfileAction.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(updateProfileAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setUser, loginStart, loginSuccess, loginFailure, clearError, updateUser, logout } = authSlice.actions
export default authSlice.reducer
