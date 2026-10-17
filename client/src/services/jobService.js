import api from './api'

const jobService = {
  /** Fetch all jobs with optional status / search filter */
  getAll: (params = {}) => {
    const clean = {}
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') clean[k] = v
    })
    return api.get('/jobs', { params: clean })
  },

  /** Fetch a single job by ID */
  getById: (id) => api.get(`/jobs/${id}`),

  /** Create a new job */
  create: (data) => api.post('/jobs', data),

  /** Update a job */
  update: (id, data) => api.put(`/jobs/${id}`, data),

  /** Delete a job */
  delete: (id) => api.delete(`/jobs/${id}`),
}

export default jobService
