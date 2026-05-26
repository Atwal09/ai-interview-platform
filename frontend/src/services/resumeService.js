import api from './api'

const resumeService = {
  uploadResume: (file, onProgress) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      },
    })
  },

  getResumes: () =>
    api.get('/resumes'),

  getResume: (resumeId) =>
    api.get(`/resumes/${resumeId}`),

  getResumeAnalysis: (resumeId) =>
    api.get(`/resumes/${resumeId}/analysis`),

  deleteResume: (resumeId) =>
    api.delete(`/resumes/${resumeId}`),

  downloadReport: (resumeId) =>
    api.get(`/resumes/${resumeId}/report`, { responseType: 'blob' }),

  analyzeAgainstJob: (resumeId, jobDescription) =>
    api.post(`/resumes/${resumeId}/analyze-job`, { jobDescription }),

  getKeywords: (jobRole) =>
    api.get(`/resumes/keywords/${jobRole}`),
}

export default resumeService
