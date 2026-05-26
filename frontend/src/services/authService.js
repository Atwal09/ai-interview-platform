import api from './api'

const authService = {
  register: (name, email, password, role = 'candidate') =>
    api.post('/auth/register', { name, email, password, role }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  googleLogin: (googleToken) =>
    api.post('/auth/google', { token: googleToken }),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),

  verifyEmail: (token) =>
    api.get(`/auth/verify-email/${token}`),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),

  uploadAvatar: (formData) =>
    api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteAccount: () =>
    api.delete('/auth/account'),

  getConnectedAccounts: () =>
    api.get('/auth/connected-accounts'),
}

export default authService
