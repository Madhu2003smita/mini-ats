import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { STAGES, EMPLOYMENT_TYPES } from '../../utils/constants'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  skillInput: '',
  skills: [],
  experience: '',
  jobId: '',
  stage: 'Applied',
  appliedAt: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (form.experience !== '' && (isNaN(form.experience) || Number(form.experience) < 0)) {
    errors.experience = 'Experience must be a non-negative number'
  }
  return errors
}

export default function CandidateForm({ initial, jobs = [], onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // Populate form when editing
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        email: initial.email || '',
        phone: initial.phone || '',
        skillInput: '',
        skills: initial.skills || [],
        experience: initial.experience ?? '',
        jobId: initial.job?._id || initial.job || '',
        stage: initial.stage || 'Applied',
        appliedAt: initial.appliedAt
          ? new Date(initial.appliedAt).toISOString().slice(0, 10)
          : '',
      })
    } else {
      setForm({ ...EMPTY_FORM, appliedAt: new Date().toISOString().slice(0, 10) })
    }
    setErrors({})
  }, [initial])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const addSkill = () => {
    const s = form.skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s], skillInput: '' }))
    } else {
      setForm((f) => ({ ...f, skillInput: '' }))
    }
  }

  const removeSkill = (skill) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }))

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      skills: form.skills,
      experience: form.experience === '' ? 0 : Number(form.experience),
      job: form.jobId || null,
      stage: form.stage,
      appliedAt: form.appliedAt || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Jane Smith"
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="jane@example.com"
          error={errors.email}
        />
        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="+1-555-000-0000"
        />
        <Input
          label="Years of Experience"
          type="number"
          min="0"
          value={form.experience}
          onChange={set('experience')}
          placeholder="0"
          error={errors.experience}
        />
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.skillInput}
            onChange={set('skillInput')}
            onKeyDown={handleSkillKeyDown}
            placeholder="Type a skill and press Enter"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
            <Plus size={14} /> Add
          </Button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {form.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="text-indigo-400 hover:text-indigo-700"
                  aria-label={`Remove ${s}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job selector */}
        <Select label="Applied Job" value={form.jobId} onChange={set('jobId')}>
          <option value="">— No job selected —</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id} disabled={j.status === 'Closed'}>
              {j.title}{j.status === 'Closed' ? ' (Closed)' : ''}
            </option>
          ))}
        </Select>

        <Select label="Hiring Stage" value={form.stage} onChange={set('stage')}>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Input
          label="Applied Date"
          type="date"
          value={form.appliedAt}
          onChange={set('appliedAt')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save Changes' : 'Add Candidate'}
        </Button>
      </div>
    </form>
  )
}
