import api from './api'

/**
 * Build a query string from a params object, omitting empty values.
 */
const buildParams = (params = {}) => {
  const clean = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') clean[k] = v
  })
  return clean
}

const candidateService = {
  /**
   * Fetch all candidates with optional search / filter / sort / pagination.
   * @param {Object} params - { search, stage, job, skills, sortBy, sortOrder, page, limit }
   */
  getAll: (params = {}) =>
    api.get('/candidates', { params: buildParams(params) }),

  /** Fetch a single candidate by ID */
  getById: (id) => api.get(`/candidates/${id}`),

  /** Create a new candidate */
  create: (data) => api.post('/candidates', data),

  /** Full update a candidate */
  update: (id, data) => api.put(`/candidates/${id}`, data),

  /** Update only the hiring stage */
  updateStage: (id, stage) => api.patch(`/candidates/${id}/stage`, { stage }),

  /** Delete a candidate */
  delete: (id) => api.delete(`/candidates/${id}`),
}

export default candidateService
