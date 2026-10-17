import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Briefcase, Calendar, Award,
  Pencil, Trash2, ChevronDown,
} from 'lucide-react'
import candidateService from '../services/candidateService'
import jobService from '../services/jobService'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PageSpinner } from '../components/ui/Spinner'
import { ToastContainer } from '../components/ui/Toast'
import CandidateForm from '../components/candidates/CandidateForm'
import useToast from '../hooks/useToast'
import { STAGES, formatDate } from '../utils/constants'

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, removeToast, toast } = useToast()

  const [candidate, setCandidate] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stageChanging, setStageChanging] = useState(false)

  const fetchCandidate = useCallback(async () => {
    try {
      setLoading(true)
      const res = await candidateService.getById(id)
      setCandidate(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchCandidate() }, [fetchCandidate])
  useEffect(() => {
    jobService.getAll().then((r) => setJobs(r.data)).catch(() => {})
  }, [])

  const handleStageChange = async (stage) => {
    try {
      setStageChanging(true)
      const res = await candidateService.updateStage(id, stage)
      setCandidate(res.data)
      toast.success(`Stage updated to ${stage}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setStageChanging(false)
    }
  }

  const handleEdit = async (data) => {
    try {
      setSaving(true)
      const res = await candidateService.update(id, data)
      setCandidate(res.data)
      toast.success('Candidate updated')
      setEditOpen(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await candidateService.delete(id)
      toast.success('Candidate deleted')
      navigate('/candidates')
    } catch (err) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  if (loading) return <PageSpinner />
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-600">{error}</p>
        <Button variant="secondary" onClick={fetchCandidate}>Retry</Button>
      </div>
    )
  }
  if (!candidate) return null

  const stageIndex = STAGES.indexOf(candidate.stage)

  return (
    <div className="space-y-4 max-w-4xl">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Back + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/candidates" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Candidates
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      {/* Hero card */}
      <Card>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{candidate.email}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Badge label={candidate.stage} variant="stage" />
              {candidate.job?.title && (
                <span className="text-sm text-slate-600 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-400" />
                  {candidate.job.title}
                </span>
              )}
            </div>
          </div>

          {/* Stage changer */}
          <div className="shrink-0">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Change Stage
            </label>
            <div className="relative">
              <select
                value={candidate.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                disabled={stageChanging}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pipeline Progress</p>
          <div className="flex items-center gap-1">
            {STAGES.filter(s => s !== 'Rejected').map((s, i) => {
              const active = candidate.stage === 'Rejected'
                ? false
                : i <= (stageIndex === STAGES.length - 1 ? -1 : stageIndex)
              const current = candidate.stage === s
              return (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className={`flex-1 h-2 rounded-full transition-colors ${
                    active || current ? 'bg-indigo-500' : 'bg-slate-200'
                  }`} />
                  {i < STAGES.filter(s => s !== 'Rejected').length - 1 && (
                    <div className={`w-1 h-1 rounded-full mx-0.5 shrink-0 ${active ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            {STAGES.filter(s => s !== 'Rejected').map((s) => (
              <span key={s} className={`text-[10px] ${candidate.stage === s ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                {s}
              </span>
            ))}
          </div>
          {candidate.stage === 'Rejected' && (
            <p className="mt-2 text-xs font-medium text-red-500">Candidate was rejected</p>
          )}
        </div>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact & Info */}
        <Card>
          <CardHeader title="Contact & Details" />
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={candidate.email} />
            <InfoRow icon={Phone} label="Phone" value={candidate.phone || '—'} />
            <InfoRow icon={Award} label="Experience" value={`${candidate.experience} year${candidate.experience !== 1 ? 's' : ''}`} />
            <InfoRow icon={Calendar} label="Applied Date" value={formatDate(candidate.appliedAt)} />
            <InfoRow
              icon={Briefcase}
              label="Applied Job"
              value={candidate.job ? `${candidate.job.title}${candidate.job.department ? ` · ${candidate.job.department}` : ''}` : '—'}
            />
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader title="Skills" subtitle={`${candidate.skills.length} skill${candidate.skills.length !== 1 ? 's' : ''} listed`} />
          {candidate.skills.length === 0 ? (
            <p className="text-sm text-slate-400">No skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Candidate" size="lg">
        <CandidateForm
          initial={candidate}
          jobs={jobs}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Candidate"
        message={`Are you sure you want to permanently delete ${candidate.name}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
