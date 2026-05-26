import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import resumeService from '../services/resumeService'
import toast from 'react-hot-toast'

const initialState = {
  resumes: [],
  currentResume: null,
  analysisResult: null,
  uploadProgress: 0,
  loading: false,
  uploading: false,
  error: null,
  atsScore: null,
  suggestions: [],
  keywords: [],
  activeTab: 'ats',
}

export const uploadResume = createAsyncThunk(
  'resume/upload',
  async ({ file, onProgress }, { rejectWithValue }) => {
    try {
      const response = await resumeService.uploadResume(file, onProgress)
      toast.success('Resume uploaded and analyzed successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload resume.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchResumes = createAsyncThunk(
  'resume/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resumeService.getResumes()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resumes.')
    }
  }
)

export const fetchResumeAnalysis = createAsyncThunk(
  'resume/fetchAnalysis',
  async (resumeId, { rejectWithValue }) => {
    try {
      const response = await resumeService.getResumeAnalysis(resumeId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analysis.')
    }
  }
)

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setCurrentResume: (state, action) => {
      state.currentResume = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearAnalysis: (state) => {
      state.analysisResult = null
      state.atsScore = null
      state.suggestions = []
      state.keywords = []
      state.uploadProgress = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.uploading = true
        state.error = null
        state.uploadProgress = 0
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploading = false
        state.uploadProgress = 100
        state.currentResume = action.payload.resume
        state.analysisResult = action.payload.analysis
        state.atsScore = action.payload.analysis?.atsScore
        state.suggestions = action.payload.analysis?.suggestions || []
        state.keywords = action.payload.analysis?.keywords || []
        if (!state.resumes.find(r => r._id === action.payload.resume._id)) {
          state.resumes.unshift(action.payload.resume)
        }
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })
      .addCase(fetchResumes.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchResumes.fulfilled, (state, action) => {
        state.loading = false
        state.resumes = action.payload.resumes || []
      })
      .addCase(fetchResumes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchResumeAnalysis.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchResumeAnalysis.fulfilled, (state, action) => {
        state.loading = false
        state.analysisResult = action.payload.analysis
        state.atsScore = action.payload.analysis?.atsScore
        state.suggestions = action.payload.analysis?.suggestions || []
        state.keywords = action.payload.analysis?.keywords || []
      })
      .addCase(fetchResumeAnalysis.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setUploadProgress,
  setActiveTab,
  setCurrentResume,
  clearError,
  clearAnalysis,
} = resumeSlice.actions

export default resumeSlice.reducer
