import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  isPanelOpen: false,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      }
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true })
      state.unreadCount = 0
    },
    removeNotification: (state, action) => {
      const idx = state.notifications.findIndex(n => n.id === action.payload)
      if (idx !== -1) {
        if (!state.notifications[idx].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(idx, 1)
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload
    },
    togglePanel: (state) => {
      state.isPanelOpen = !state.isPanelOpen
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.read).length
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setSocketConnected,
  togglePanel,
  setNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer
