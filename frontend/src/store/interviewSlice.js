import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import interviewService from '../services/interviewService'
import toast from 'react-hot-toast'

const initialState = {
  interviews: [],
  currentInterview: null,
  questions: [],
  currentQuestionIndex: 0,
  responses: [],
  analysisResults: null,
  sessionLoading: false,
  loading: false,
  error: null,
  isRecording: false,
  transcription: '',
  audioBlob: null,
  timer: 0,
  isInterviewActive: false,
  speechMetrics: null,
  interviewConfig: {
    type: 'HR',
    domain: 'Software Engineering',
    difficulty: 'Medium',
    duration: 30,
    numQuestions: 10,
  },
}

export const createInterview = createAsyncThunk(
  'interview/create',
  async (config, { rejectWithValue }) => {
    try {
      const response = await interviewService.createInterview(config)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create interview.'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchInterviews = createAsyncThunk(
  'interview/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interviewService.getInterviews()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interviews.')
    }
  }
)

export const fetchInterview = createAsyncThunk(
  'interview/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await interviewService.getInterview(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interview.')
    }
  }
)

export const generateQuestions = createAsyncThunk(
  'interview/generateQuestions',
  async ({ interviewId, config }, { rejectWithValue }) => {
    try {
      const response = await interviewService.generateQuestions(interviewId, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate questions.')
    }
  }
)

export const submitResponse = createAsyncThunk(
  'interview/submitResponse',
  async ({ interviewId, questionId, response: resp, audioData }, { rejectWithValue }) => {
    try {
      const response = await interviewService.submitResponse(interviewId, questionId, resp, audioData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit response.')
    }
  }
)

export const getAnalysis = createAsyncThunk(
  'interview/getAnalysis',
  async (interviewId, { rejectWithValue }) => {
    try {
      const response = await interviewService.getAnalysis(interviewId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get analysis.')
    }
  }
)

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setInterviewConfig: (state, action) => {
      state.interviewConfig = { ...state.interviewConfig, ...action.payload }
    },
    setCurrentQuestionIndex: (state, action) => {
      state.currentQuestionIndex = action.payload
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1
      }
    },
    setIsRecording: (state, action) => {
      state.isRecording = action.payload
    },
    setTranscription: (state, action) => {
      state.transcription = action.payload
    },
    setAudioBlob: (state, action) => {
      state.audioBlob = action.payload
    },
    setTimer: (state, action) => {
      state.timer = action.payload
    },
    setIsInterviewActive: (state, action) => {
      state.isInterviewActive = action.payload
    },
    setSpeechMetrics: (state, action) => {
      state.speechMetrics = action.payload
    },
    addResponse: (state, action) => {
      state.responses.push(action.payload)
    },
    clearCurrentInterview: (state) => {
      state.currentInterview = null
      state.questions = []
      state.currentQuestionIndex = 0
      state.responses = []
      state.analysisResults = null
      state.isInterviewActive = false
      state.transcription = ''
      state.speechMetrics = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInterview.pending, (state) => {
        state.sessionLoading = true
        state.error = null
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.sessionLoading = false
        state.currentInterview = action.payload.interview
        state.questions = action.payload.questions || []
        state.isInterviewActive = true
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.sessionLoading = false
        state.error = action.payload
      })
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false
        state.interviews = action.payload.interviews || []
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchInterview.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInterview.fulfilled, (state, action) => {
        state.loading = false
        state.currentInterview = action.payload.interview
        state.questions = action.payload.questions || []
      })
      .addCase(fetchInterview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        state.questions = action.payload.questions || []
      })
      .addCase(submitResponse.fulfilled, (state, action) => {
        state.speechMetrics = action.payload.metrics
        state.responses.push(action.payload.response)
      })
      .addCase(getAnalysis.pending, (state) => {
        state.loading = true
      })
      .addCase(getAnalysis.fulfilled, (state, action) => {
        state.loading = false
        state.analysisResults = action.payload.analysis
      })
      .addCase(getAnalysis.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  setInterviewConfig,
  setCurrentQuestionIndex,
  nextQuestion,
  setIsRecording,
  setTranscription,
  setAudioBlob,
  setTimer,
  setIsInterviewActive,
  setSpeechMetrics,
  addResponse,
  clearCurrentInterview,
  clearError,
} = interviewSlice.actions

export default interviewSlice.reducer
