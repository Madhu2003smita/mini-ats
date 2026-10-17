import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { EMPLOYMENT_TYPES, JOB_STATUSES } from '../../utils/constants'

const EMPTY = {
  title: '',
  department: '',
  location: '',
  employmentType: 'Full-time',
  description: '',
  status: 'Open',
}

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Job title is required'
  return errors
}

export default function JobForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        department: initial.department || '',
        location: initial.location || '',
        employmentType: initial.employmentType || 'Full-time',
        description: initial.description || '',
        status: initial.status || 'Open',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [initial])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onSubmit({
      title: form.title.trim(),
      department: form.department.trim(),
      location: form.location.trim(),
      employmentType: form.employmentType,
      description: form.description.trim(),
      status: form.status,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Job Title"
        required
        value={form.title}
        onChange={set('title')}
        placeholder="e.g. Senior Frontend Engineer"
        error={errors.title}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Department"
          value={form.department}
          onChange={set('department')}
          placeholder="e.g. Engineering"
        />
        <Input
          label="Location"
          value={form.location}
          onChange={set('location')}
          placeholder="e.g. Remote, New York, NY"
        />
        <Select
          label="Employment Type"
          value={form.employmentType}
          onChange={set('employmentType')}
        >
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select
          label="Status"
          value={form.status}
          onChange={set('status')}
        >
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Job Description"
        value={form.description}
        onChange={set('description')}
        placeholder="Describe the role, responsibilities, and requirements…"
        rows={5}
      />

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save Changes' : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
