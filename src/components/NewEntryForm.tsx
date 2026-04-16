import { useEffect, useState } from 'react'
import { loadCompanies, loadProjects, saveTimeEntry, Company, Project, TimeEntry } from '../api'

// These come from your session — hardcoded for Simon but could be read dynamically
const USER_ID = '187'
const USERNAME = 'Simon Stancovich'

interface Props {
  date: Date
  onSaved: (entry: TimeEntry) => void
  prefillHours?: number  // from timer
  prefillDescription?: string
}

export function NewEntryForm({ date, onSaved, prefillHours, prefillDescription }: Props) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [hours, setHours] = useState(prefillHours?.toFixed(2) ?? '')
  const [description, setDescription] = useState(prefillDescription ?? '')
  const [internalNote, setInternalNote] = useState('')
  const [invoice, setInvoice] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCompanies().then(setCompanies)
  }, [])

  useEffect(() => {
    if (!selectedCompany) return
    setSelectedProject(null)
    loadProjects(selectedCompany.id).then(setProjects)
  }, [selectedCompany])

  async function handleSave() {
    if (!selectedCompany || !selectedProject || !hours || !description) {
      setError('Fill in all required fields')
      return
    }
    setSaving(true)
    setError('')
    try {
      const taskDate = date.toISOString().split('T')[0]
      await saveTimeEntry({
        id: '-1',
        company: selectedCompany.name,
        project: selectedProject.name,
        description,
        internal_description: internalNote,
        hour: hours,
        invoice_hours: invoice ? hours : '0',
        invoice: invoice ? '1' : 'false',
        no_flex: 'false',
        username: USERNAME,
        _user_id: USER_ID,
        _company_id: selectedCompany.id,
        _project_id: selectedProject.id,
        hour_price: selectedProject.hour_price,
        task_date: taskDate,
      })
      // Construct a local TimeEntry to hand back immediately
      const newEntry: TimeEntry = {
        id: String(Date.now()), // temp — real id comes from server
        _user_id: USER_ID,
        _project_id: selectedProject.id,
        _company_id: selectedCompany.id,
        task_date: taskDate + ' 00:00:00',
        description,
        internal_description: internalNote,
        hour: hours,
        invoice_hours: invoice ? hours : '0',
        invoice: invoice ? '1' : '0',
        no_flex: '0',
        hour_price: selectedProject.hour_price,
        username: USERNAME,
        company: selectedCompany.name,
        project: selectedProject.name,
        create_date: new Date().toISOString(),
      }
      onSaved(newEntry)
      // Reset form
      setHours('')
      setDescription('')
      setInternalNote('')
    } catch (e) {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form">
      <div className="field">
        <label>Client *</label>
        <select
          value={selectedCompany?.id ?? ''}
          onChange={e => {
            const c = companies.find(c => c.id === e.target.value) ?? null
            setSelectedCompany(c)
          }}
        >
          <option value="">— Select client —</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Project *</label>
        <select
          value={selectedProject?.id ?? ''}
          onChange={e => setSelectedProject(projects.find(p => p.id === e.target.value) ?? null)}
          disabled={!selectedCompany}
        >
          <option value="">— Select project —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Hours *</label>
        <input
          type="number"
          step="0.25"
          min="0"
          max="24"
          placeholder="0.00"
          value={hours}
          onChange={e => setHours(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Description *</label>
        <textarea
          placeholder="What did you work on?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="field">
        <label>Internal note</label>
        <textarea
          placeholder="Internal notes (not on invoice)"
          value={internalNote}
          onChange={e => setInternalNote(e.target.value)}
          rows={2}
        />
      </div>

      <div className="field field-row">
        <label>
          <input type="checkbox" checked={invoice} onChange={e => setInvoice(e.target.checked)} />
          Invoiceable
        </label>
        {selectedProject && (
          <span className="hour-price">{parseFloat(selectedProject.hour_price).toFixed(0)} kr/h</span>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save entry'}
      </button>
    </div>
  )
}
