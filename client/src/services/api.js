import axios from 'axios'

// Always use relative /api — Vercel rewrites route it to the server service.
// VITE_API_URL is injected by the Vercel binding but is an internal URL
// (not reachable from the browser), so we only use it server-side if needed.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'An unexpected error occurred'

    return Promise.reject(new Error(message))
  }
)

export default api
