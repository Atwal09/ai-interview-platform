import api from './api'

const dashboardService = {
  getStats: () =>
    api.get('/dashboard/stats'),

  getPerformanceCharts: (range = '30d') =>
    api.get(`/dashboard/performance?range=${range}`),

  getLeaderboard: (limit = 10) =>
    api.get(`/dashboard/leaderboard?limit=${limit}`),

  getRecommendations: () =>
    api.get('/dashboard/recommendations'),

  getRecentInterviews: (limit = 5) =>
    api.get(`/dashboard/recent-interviews?limit=${limit}`),

  getActivityHeatmap: () =>
    api.get('/dashboard/activity'),

  getDailyTip: () =>
    api.get('/dashboard/daily-tip'),

  getUpcomingFeatures: () =>
    api.get('/dashboard/upcoming'),

  getAnalyticsSummary: (dateRange) =>
    api.get('/dashboard/analytics-summary', { params: dateRange }),
}

export default dashboardService
