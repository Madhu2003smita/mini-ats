import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, UserPlus, ChevronDown, AlertCircle } from 'lucide-react'
import candidateService from '../services/candidateService'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { ToastContainer } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import CandidateForm from '../components/candidates/CandidateForm'
import jobService from '../services/jobService'
import useToast from '../hooks/useToast'
import { STAGES, STAGE_COLORS, formatDate } from '../utils/constants'

// ── Stage column header colors ─────────────────────────────────────────────────
const COLUMN_HEADER = {
  Applied:   'bg-blue-50 border-blue-200 text-blue-700',
  Screening: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  Interview: 'bg-purple-50 border-purple-200 text-purple-700',
  Offer:     'bg-orange-50 border-orange-200 text-orange-700',
  Hired:     'bg-green-50 border-green-200 text-green-700',
  Rejected:  'bg-red-50 border-red-200 text-red-700',
}

const DOT_COLOR = {
  Applied:   'bg-blue-500',
  Screening: 'bg-yellow-500',
  Interview: 'bg-purple-500',
  Offer:     'bg-orange-500',
  Hired:     'bg-green-500',
  Rejected:  'bg-red-500',
}

// ── Candidate card ─────────────────────────────────────────────────────────────
function CandidateCard({ candidate, onStageChange, updating }) {
  const isUpdating = updating === candidate._id

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 transition-all
        ${isUpdating ? 'opacity-60 pointer-events-none' : 'hover:shadow-md hover:border-slate-300'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              to={`/candidates/${candidate._id}`}
              className="text-sm font-semibold text-slate-900 hover:text-indigo-600 truncate block"
            >
              {candidate.name}
            </Link>
            <p className="text-xs text-slate-400 truncate">{candidate.email}</p>
          </div>
        </div>
        {isUpdating && (
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Job */}
      {candidate.job?.title && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-full">
            {candidate.job.title}
          </span>
        </div>
      )}

      {/* Skills */}
      {candidate.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-full">
              {s}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-full">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: date + stage change */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">{formatDate(candidate.appliedAt)}</span>
        <div className="relative">
          <select
            value={candidate.stage}
            onChange={(e) => onStageChange(candidate._id, e.target.value)}
            disabled={isUpdating}
            className="appearance-none text-[11px] font-medium pl-2 pr-6 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer disabled:opacity-50"
            aria-label={`Change stage for ${candidate.name}`}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

// ── Stage column ───────────────────────────────────────────────────────────────
function StageColumn({ stage, candidates, onStageChange, updating }) {
  const headerClass = COLUMN_HEADER[stage]
  const dotClass = DOT_COLOR[stage]

  return (
    <div className="flex flex-col min-w-[260px] max-w-[280px] flex-1">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3 ${headerClass}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className="text-sm font-semibold">{stage}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70">
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 flex-1 min-h-[120px]">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400">
            No candidates
          </div>
        ) : (
          candidates.map((c) => (
            <CandidateCard
              key={c._id}
              candidate={c}
              onStageChange={onStageChange}
              updating={updating}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main Pipeline page ─────────────────────────────────────────────────────────
export default function Pipeline() {
  const { toasts, removeToast, toast } = useToast()

  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null) // candidateId being updated
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterJob, setFilterJob] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { limit: 200 }
      if (filterJob) params.job = filterJob
      const res = await candidateService.getAll(params)
      setCandidates(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterJob])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    jobService.getAll().then((r) => setJobs(r.data)).catch(() => {})
  }, [])

  // Group by stage
  const byStage = STAGES.reduce((acc, s) => {
    acc[s] = candidates.filter((c) => c.stage === s)
    return acc
  }, {})

  const handleStageChange = async (candidateId, newStage) => {
    const prev = candidates.find((c) => c._id === candidateId)
    if (!prev || prev.stage === newStage) return

    // Optimistic update
    setCandidates((list) =>
      list.map((c) => (c._id === candidateId ? { ...c, stage: newStage } : c))
    )
    setUpdating(candidateId)

    try {
      const res = await candidateService.updateStage(candidateId, newStage)
      setCandidates((list) =>
        list.map((c) => (c._id === candidateId ? res.data : c))
      )
      toast.success(`${prev.name} moved to ${newStage}`)
    } catch (err) {
      // Revert on failure
      setCandidates((list) =>
        list.map((c) => (c._id === candidateId ? prev : c))
      )
      toast.error(`Failed to update stage: ${err.message}`)
    } finally {
      setUpdating(null)
    }
  }

  const handleAdd = async (data) => {
    try {
      setSaving(true)
      await candidateService.create(data)
      toast.success('Candidate added')
      setAddOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-red-600 font-medium">{error}</p>
        <Button variant="secondary" onClick={fetchAll}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hiring Pipeline</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} across {STAGES.length} stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Job filter */}
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by job"
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={fetchAll} title="Refresh">
            <RefreshCw size={15} />
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus size={16} /> Add Candidate
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map((s) => (
          <div
            key={s}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${COLUMN_HEADER[s]}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[s]}`} />
            {s}: {byStage[s].length}
          </div>
        ))}
      </div>

      {/* Pipeline board */}
      {candidates.length === 0 ? (
        <EmptyState
          title="No candidates in the pipeline"
          description="Add candidates to see them appear in the pipeline."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus size={16} /> Add Candidate
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                candidates={byStage[stage]}
                onStageChange={handleStageChange}
                updating={updating}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add candidate modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Candidate" size="lg">
        <CandidateForm
          jobs={jobs}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
