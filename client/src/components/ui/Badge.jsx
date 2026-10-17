const stageColors = {
  Applied:   'bg-blue-50 text-blue-700 border-blue-200',
  Screening: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Interview: 'bg-purple-50 text-purple-700 border-purple-200',
  Offer:     'bg-orange-50 text-orange-700 border-orange-200',
  Hired:     'bg-green-50 text-green-700 border-green-200',
  Rejected:  'bg-red-50 text-red-700 border-red-200',
}

const typeColors = {
  'Full-time':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Part-time':  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Contract':   'bg-violet-50 text-violet-700 border-violet-200',
  'Internship': 'bg-teal-50 text-teal-700 border-teal-200',
  'Open':       'bg-green-50 text-green-700 border-green-200',
  'Closed':     'bg-slate-100 text-slate-600 border-slate-200',
}

export default function Badge({ label, variant = 'stage', className = '' }) {
  const colorMap = variant === 'stage' ? stageColors : typeColors
  const colors = colorMap[label] || 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors} ${className}`}
    >
      {label}
    </span>
  )
}
