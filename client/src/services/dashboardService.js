import api from './api'

const dashboardService = {
  /** Fetch all dashboard stats (metrics, stage counts, recent candidates, etc.) */
  getStats: () => api.get('/dashboard/stats'),
}

export default dashboardService
