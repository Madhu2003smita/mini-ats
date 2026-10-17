import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import {
  Search, SlidersHorizontal, UserPlus, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Pencil, Trash2, Eye, X,
} from 'lucide-react'
import candidateService from '../services/candidateService'
import jobService from '../services/jobService'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { ToastContainer } from '../components/ui/Toast'
import CandidateForm from '../components/candidates/CandidateForm'
import useToast from '../hooks/useToast'
import { STAGES, formatDate } from '../utils/constants'

const PAGE_SIZE = 15

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <ChevronUp size={13} className="text-slate-300" />
  return sortOrder === 'asc'
    ? <ChevronUp size={13} className="text-indigo-500" />
    : <ChevronDown size={13} className="text-indigo-500" />
}

export default function Candidates() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { toasts, removeToast, toast } = useToast()

  // ── State ─────────────────────────────────────────────────────────────────
  const [candidates, setCandidates] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, pages: 1 })
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters — always driven from URL search params
  const search     = searchParams.get('search') || ''
  const filterStage = searchParams.get('stage')  || ''
  const filterJob   = searchParams.get('job')    || ''
  const sortBy      = searchParams.get('sortBy') || 'appliedAt'
  const sortOrder   = searchParams.get('sortOrder') || 'desc'
  const page        = Number(searchParams.get('page') || '1')

  // Auto-open filter panel when job or stage arrives via URL
  const [filtersOpen, setFiltersOpen] = useState(!!(searchParams.get('job') || searchParams.get('stage')))

  // Modals
  const [addOpen, setAddOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Open add modal if navigated here with openAdd state (e.g. from Dashboard)
  useEffect(() => {
    if (location.state?.openAdd) {
      setAddOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // When URL params change (e.g. navigating from Jobs page), open filters panel
  useEffect(() => {
    if (filterJob || filterStage) setFiltersOpen(true)
  }, [filterJob, filterStage])

  // ── Helper: update a single URL param ─────────────────────────────────────
  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.delete('page') // reset page on any filter change
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setPage = useCallback((p) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    }, { replace: true })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await candidateService.getAll({
        search, stage: filterStage, job: filterJob,
        sortBy, sortOrder, page, limit: PAGE_SIZE,
      })
      setCandidates(res.data)
      setPagination(res.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, filterStage, filterJob, sortBy, sortOrder, page])

  useEffect(() => {
    jobService.getAll().then((r) => setJobs(r.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  // ── Sort handler ───────────────────────────────────────────────────────────
  const handleSort = (field) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (prev.get('sortBy') === field) {
        next.set('sortOrder', prev.get('sortOrder') === 'asc' ? 'desc' : 'asc')
      } else {
        next.set('sortBy', field)
        next.set('sortOrder', 'asc')
      }
      next.delete('page')
      return next
    }, { replace: true })
  }

  const hasFilters = search || filterStage || filterJob

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleAdd = async (data) => {
    try {
      setSaving(true)
      await candidateService.create(data)
      toast.success('Candidate added successfully')
      setAddOpen(false)
      fetchCandidates()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data) => {
    try {
      setSaving(true)
      await candidateService.update(editCandidate._id, data)
      toast.success('Candidate updated successfully')
      setEditCandidate(null)
      fetchCandidates()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await candidateService.delete(deleteCandidate._id)
      toast.success('Candidate deleted')
      setDeleteCandidate(null)
      fetchCandidates()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Active filter count for badge
  const activeFilterCount = [filterStage, filterJob].filter(Boolean).length

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Candidates</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} total candidate{pagination.total !== 1 ? 's' : ''}
            {filterJob && jobs.length > 0 && (() => {
              const j = jobs.find(j => j._id === filterJob)
              return j ? <span className="text-indigo-600"> · {j.title}</span> : null
            })()}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus size={16} /> Add Candidate
        </Button>
      </div>

      {/* Search + Filters */}
      <Card>
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFiltersOpen(o => !o)}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} /> Clear all
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filterJob && jobs.length > 0 && (() => {
              const j = jobs.find(j => j._id === filterJob)
              return j ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                  Job: {j.title}
                  <button onClick={() => setParam('job', '')} className="hover:text-indigo-900" aria-label="Remove job filter">
                    <X size={11} />
                  </button>
                </span>
              ) : null
            })()}
            {filterStage && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                Stage: {filterStage}
                <button onClick={() => setParam('stage', '')} className="hover:text-purple-900" aria-label="Remove stage filter">
                  <X size={11} />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                Search: "{search}"
                <button onClick={() => setParam('search', '')} className="hover:text-slate-900" aria-label="Remove search">
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setParam('stage', e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Stages</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job</label>
              <select
                value={filterJob}
                onChange={(e) => setParam('job', e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Jobs</option>
                {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <PageSpinner />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <Button variant="secondary" onClick={fetchCandidates}>Retry</Button>
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            title="No candidates found"
            description={hasFilters ? 'Try adjusting your search or filters.' : 'Add your first candidate to get started.'}
            action={
              !hasFilters && (
                <Button onClick={() => setAddOpen(true)}>
                  <UserPlus size={16} /> Add Candidate
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    { label: 'Candidate', field: 'name' },
                    { label: 'Job',        field: null },
                    { label: 'Stage',      field: null },
                    { label: 'Experience', field: 'experience' },
                    { label: 'Applied',    field: 'appliedAt' },
                    { label: 'Skills',     field: null },
                    { label: '',           field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label || 'actions'}
                      onClick={field ? () => handleSort(field) : undefined}
                      className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
                        ${field ? 'cursor-pointer hover:text-slate-700 select-none' : ''}
                        ${label === 'Skills'     ? 'hidden lg:table-cell' : ''}
                        ${label === 'Experience' ? 'hidden md:table-cell' : ''}
                      `}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors group">

                    {/* Candidate — name is a clickable link */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/candidates/${c._id}`}
                            className="font-medium text-slate-900 hover:text-indigo-600 truncate max-w-[160px] block transition-colors"
                          >
                            {c.name}
                          </Link>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Job — clickable to filter by this job */}
                    <td className="px-4 py-3 max-w-[140px]">
                      {c.job ? (
                        <button
                          onClick={() => setParam('job', c.job._id)}
                          className="text-left w-full group/job"
                          title={`Filter by ${c.job.title}`}
                        >
                          <p className="truncate text-slate-600 group-hover/job:text-indigo-600 transition-colors">
                            {c.job.title}
                          </p>
                          {c.job.department && (
                            <p className="text-xs text-slate-400 truncate">{c.job.department}</p>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <Badge label={c.stage} variant="stage" />
                    </td>

                    {/* Experience */}
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {c.experience}yr{c.experience !== 1 ? 's' : ''}
                    </td>

                    {/* Applied */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(c.appliedAt)}
                    </td>

                    {/* Skills */}
                    <td className="px-4 py-3 hidden lg:table-cell max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                            {s}
                          </span>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full">
                            +{c.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions — always visible, not hidden */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/candidates/${c._id}`} title="View profile">
                          <Button variant="ghost" size="icon">
                            <Eye size={15} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => setEditCandidate(c)}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => setDeleteCandidate(c)}
                          className="hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 flex-wrap gap-2">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} results
            </p>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={15} />
              </Button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="min-w-[32px]"
                  >
                    {p}
                  </Button>
                )
              })}
              <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Candidate" size="lg">
        <CandidateForm jobs={jobs} onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editCandidate} onClose={() => setEditCandidate(null)} title="Edit Candidate" size="lg">
        <CandidateForm
          initial={editCandidate}
          jobs={jobs}
          onSubmit={handleEdit}
          onCancel={() => setEditCandidate(null)}
          loading={saving}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${deleteCandidate?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
