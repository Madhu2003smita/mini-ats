export const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']

export const JOB_STATUSES = ['Open', 'Closed']

export const STAGE_COLORS = {
  Applied:   { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-700'   },
  Screening: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700' },
  Interview: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
  Offer:     { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700' },
  Hired:     { bg: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-700'  },
  Rejected:  { bg: 'bg-red-500',    light: 'bg-red-50',    text: 'text-red-700'    },
}

export const CHART_COLORS = {
  Applied:   '#3b82f6',
  Screening: '#eab308',
  Interview: '#a855f7',
  Offer:     '#f97316',
  Hired:     '#22c55e',
  Rejected:  '#ef4444',
}

/**
 * Format an ISO date string to a readable date.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Truncate text to a max length.
 */
export const truncate = (str, max = 40) =>
  str && str.length > max ? str.slice(0, max) + '…' : str
