import { TimeEntry, deleteTimeEntry } from '../api'

interface Props {
  entries: TimeEntry[]
  loading: boolean
  onDeleted: (id: string) => void
}

export function EntryList({ entries, loading, onDeleted }: Props) {
  if (loading) return <div className="loading">Loading entries...</div>
  if (entries.length === 0) return <div className="empty">No entries logged today.</div>

  const totalHours = entries.reduce((sum, e) => sum + parseFloat(e.hour || '0'), 0)

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await deleteTimeEntry(id)
    onDeleted(id)
  }

  // Group by company
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.company
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, TimeEntry[]>)

  return (
    <div className="entry-list">
      {Object.entries(grouped).map(([company, items]) => {
        const companyHours = items.reduce((sum, e) => sum + parseFloat(e.hour || '0'), 0)
        return (
          <div key={company} className="entry-group">
            <div className="entry-group-header">
              <span className="entry-company">{company}</span>
              <span className="entry-group-hours">{companyHours.toFixed(2)}h</span>
            </div>
            {items.map(entry => (
              <div key={entry.id} className="entry-item">
                <div className="entry-main">
                  <div className="entry-project">{entry.project}</div>
                  <div className="entry-description">{entry.description}</div>
                  {entry.internal_description && (
                    <div className="entry-internal">🔒 {entry.internal_description}</div>
                  )}
                </div>
                <div className="entry-meta">
                  <span className="entry-hours">{parseFloat(entry.hour).toFixed(2)}h</span>
                  <span className={`entry-invoice ${entry.invoice === '1' ? 'invoiceable' : 'non-invoiceable'}`}>
                    {entry.invoice === '1' ? '💰' : '–'}
                  </span>
                  <button className="btn-delete" onClick={() => handleDelete(entry.id)} title="Delete">✕</button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
      <div className="entry-total">
        Total: <strong>{totalHours.toFixed(2)}h</strong>
      </div>
    </div>
  )
}
