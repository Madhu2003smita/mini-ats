import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Search, Pencil, Trash2, Users, MapPin,
  Clock, Building2, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import jobService from '../services/jobService'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { ToastContainer } from '../components/ui/Toast'
import JobForm from '../components/jobs/JobForm'
import useToast from '../hooks/useToast'
import { formatDate } from '../utils/constants'

const TYPE_COLORS = {
  'Full-time':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Part-time':  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Contract':   'bg-violet-50 text-violet-700 border-violet-200',
  'Internship': 'bg-teal-50 text-teal-700 border-teal-200',
}

function JobCard({ job, onEdit, onDelete, expanded, onToggle }) {
  const typeColor = TYPE_COLORS[job.employmentType] || 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <Card className={`transition-all ${job.status === 'Closed' ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-indigo-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              {/* Clickable title → filtered candidates */}
              <Link
                to={`/candidates?job=${job._id}`}
                className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
                title={`View applicants for ${job.title}`}
              >
                {job.title}
              </Link>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {job.department && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Building2 size={11} className="text-slate-400" />
                    {job.department}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={11} className="text-slate-400" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>
            </div>

            {/* Right: badges + actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeColor}`}>
                {job.employmentType}
              </span>
              <Badge label={job.status} variant="type" />
              {/* Always show applicants count as a clickable link */}
              <Link
                to={`/candidates?job=${job._id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors"
                title="View applicants"
              >
                <Users size={11} />
                {job.candidateCount ?? 0} applicant{(job.candidateCount ?? 0) !== 1 ? 's' : ''}
              </Link>
              <Button variant="ghost" size="icon" onClick={() => onEdit(job)} title="Edit job">
                <Pencil size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(job)}
                title="Delete job"
                className="hover:text-red-600"
              >
                <Trash2 size={15} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onToggle} title={expanded ? 'Collapse' : 'Expand'}>
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </Button>
            </div>
          </div>

          {/* Expanded description */}
          {expanded && job.description && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          )}
          {expanded && !job.description && (
            <p className="mt-3 text-sm text-slate-400 italic">No description provided.</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function Jobs() {
  const { toasts, removeToast, toast } = useToast()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const [addOpen, setAddOpen] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [deleteJob, setDeleteJob] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (search) params.search = search
      const res = await jobService.getAll(params)
      setJobs(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleAdd = async (data) => {
    try {
      setSaving(true)
      await jobService.create(data)
      toast.success('Job created successfully')
      setAddOpen(false)
      fetchJobs()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data) => {
    try {
      setSaving(true)
      await jobService.update(editJob._id, data)
      toast.success('Job updated successfully')
      setEditJob(null)
      fetchJobs()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await jobService.delete(deleteJob._id)
      toast.success('Job deleted')
      setDeleteJob(null)
      fetchJobs()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const openCount = jobs.filter((j) => j.status === 'Open').length
  const closedCount = jobs.filter((j) => j.status === 'Closed').length
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.candidateCount || 0), 0)

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Jobs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {openCount} open · {closedCount} closed · {totalApplicants} total applicants
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> New Job
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        {(search || filterStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(''); setFilterStatus('') }}
          >
            <X size={14} /> Clear
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Jobs', value: jobs.length, color: 'text-slate-900' },
          { label: 'Open Positions', value: openCount, color: 'text-green-600' },
          { label: 'Total Applicants', value: totalApplicants, color: 'text-indigo-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center py-3">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <PageSpinner />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <p className="text-red-600">{error}</p>
          <Button variant="secondary" onClick={fetchJobs}>Retry</Button>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={search || filterStatus ? 'Try adjusting your filters.' : 'Create your first job posting.'}
          action={
            !(search || filterStatus) && (
              <Button onClick={() => setAddOpen(true)}>
                <Plus size={16} /> New Job
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onEdit={setEditJob}
              onDelete={setDeleteJob}
              expanded={expandedId === job._id}
              onToggle={() => setExpandedId((id) => id === job._id ? null : job._id)}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create New Job" size="lg">
        <JobForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editJob} onClose={() => setEditJob(null)} title="Edit Job" size="lg">
        <JobForm
          initial={editJob}
          onSubmit={handleEdit}
          onCancel={() => setEditJob(null)}
          loading={saving}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteJob}
        onClose={() => setDeleteJob(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Job"
        message={`Delete "${deleteJob?.title}"? Any candidates linked to this job will be unlinked but not deleted.`}
        confirmLabel="Delete Job"
        variant="danger"
      />
    </div>
  )
}
