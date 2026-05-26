import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import interviewReducer from './interviewSlice'
import resumeReducer from './resumeSlice'
import notificationReducer from './notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
    resume: resumeReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['interview/setAudioBlob'],
        ignoredPaths: ['interview.audioBlob'],
      },
    }),
})

export default store
