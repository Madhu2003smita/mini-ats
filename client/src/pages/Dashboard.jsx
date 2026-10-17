import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
} from 'recharts'
import {
  Users, Briefcase, CalendarCheck, Gift, CheckCircle2, XCircle,
  TrendingUp, ArrowRight, UserPlus,
} from 'lucide-react'
import dashboardService from '../services/dashboardService'
import Badge from '../components/ui/Badge'
import Card, { CardHeader } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { CHART_COLORS, formatDate } from '../utils/constants'

// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, color, sub, to }) {
  const inner = (
    <>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-900 leading-none">{value ?? '—'}</p>
        <p className="text-sm text-slate-500 mt-0.5 truncate">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="block">
        <Card className="flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
          {inner}
        </Card>
      </Link>
    )
  }

  return <Card className="flex items-center gap-4">{inner}</Card>
}

// ── Custom bar tooltip ─────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-sm">
      <span className="font-medium text-slate-700">{name}: </span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  )
}

// ── Pipeline funnel tooltip ────────────────────────────────────────────────────
function CustomFunnelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-sm">
      <span className="font-medium text-slate-700">{d.stage}: </span>
      <span className="font-bold text-slate-900">{d.count}</span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await dashboardService.getStats()
      setStats(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-600 font-medium">{error}</p>
        <Button variant="secondary" onClick={fetchStats}>Retry</Button>
      </div>
    )
  }

  const { metrics, pipelineData, recentCandidates, candidatesByJob } = stats

  const metricCards = [
    { label: 'Total Candidates',      value: metrics.totalCandidates,      icon: Users,         color: 'bg-indigo-500', to: '/candidates' },
    { label: 'Active Applications',   value: metrics.activeApplications,   icon: TrendingUp,    color: 'bg-blue-500',   to: '/pipeline' },
    { label: 'Interviews Scheduled',  value: metrics.interviewsScheduled,  icon: CalendarCheck, color: 'bg-purple-500', to: '/candidates?stage=Interview' },
    { label: 'Offers Made',           value: metrics.offersMade,           icon: Gift,          color: 'bg-orange-500', to: '/candidates?stage=Offer' },
    { label: 'Hired',                 value: metrics.hired,                icon: CheckCircle2,  color: 'bg-green-500',  to: '/candidates?stage=Hired' },
    { label: 'Rejected',              value: metrics.rejected,             icon: XCircle,       color: 'bg-red-400',    to: '/candidates?stage=Rejected' },
    { label: 'Open Jobs',             value: metrics.openJobs,             icon: Briefcase,     color: 'bg-cyan-500',   to: '/jobs', sub: `of ${metrics.totalJobs} total` },
  ]

  // Add color to pipeline data
  const coloredPipeline = pipelineData.map((d) => ({
    ...d,
    fill: CHART_COLORS[d.stage],
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Live recruitment metrics from your database</p>
        </div>
        <Link to="/candidates" state={{ openAdd: true }}>
          <Button>
            <UserPlus size={16} />
            Add Candidate
          </Button>
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.slice(0, 4).map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.slice(4).map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart: candidates by stage */}
        <Card>
          <CardHeader title="Candidates by Stage" subtitle="All-time distribution across hiring stages" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {pipelineData.map((entry) => (
                  <Cell key={entry.stage} fill={CHART_COLORS[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top jobs */}
        <Card>
          <CardHeader
            title="Top Jobs by Applicants"
            subtitle="Jobs with the most candidate applications"
            action={
              <Link to="/jobs" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            }
          />
          {candidatesByJob.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3 mt-2">
              {candidatesByJob.map((item, i) => {
                const max = candidatesByJob[0]?.count || 1
                const pct = Math.round((item.count / max) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {item.jobTitle || 'Unassigned'}
                        </p>
                        {item.department && (
                          <p className="text-xs text-slate-400">{item.department}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-900 ml-3 shrink-0">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent candidates table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Candidates</h3>
            <p className="text-sm text-slate-400 mt-0.5">Latest 10 applicants by applied date</p>
          </div>
          <Link to="/candidates" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentCandidates.length === 0 ? (
          <p className="text-sm text-slate-400 py-12 text-center">No candidates yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Job
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Applied
                  </th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{c.name}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {c.experience}yr exp
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">
                      {c.job?.title || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={c.stage} variant="stage" />
                    </td>
                    <td className="px-5 py-3 text-slate-500 hidden md:table-cell">
                      {formatDate(c.appliedAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/candidates/${c._id}`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
