import api from './api'

const interviewService = {
  createInterview: (config) =>
    api.post('/interviews', config),

  getInterviews: (params = {}) =>
    api.get('/interviews', { params }),

  getInterview: (id) =>
    api.get(`/interviews/${id}`),

  generateQuestions: (interviewId, config) =>
    api.post(`/interviews/${interviewId}/questions`, config),

  submitResponse: (interviewId, questionId, response, audioData) =>
    api.post(`/interviews/${interviewId}/responses`, {
      questionId,
      response,
      audioData,
    }),

  getAnalysis: (interviewId) =>
    api.get(`/interviews/${interviewId}/analysis`),

  endInterview: (interviewId) =>
    api.put(`/interviews/${interviewId}/end`),

  deleteInterview: (interviewId) =>
    api.delete(`/interviews/${interviewId}`),

  getInterviewStats: () =>
    api.get('/interviews/stats'),

  submitAudio: (interviewId, questionId, formData) =>
    api.post(`/interviews/${interviewId}/audio/${questionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getTranscription: (interviewId, questionId) =>
    api.get(`/interviews/${interviewId}/transcription/${questionId}`),
}

export default interviewService
