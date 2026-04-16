const api = window.electronAPI

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string
  _user_id: string
  _project_id: string
  _company_id: string
  task_date: string
  description: string
  internal_description: string
  hour: string
  invoice_hours: string
  invoice: string
  no_flex: string
  hour_price: string
  username: string
  company: string
  project: string
  create_date: string
}

export interface Company {
  id: string
  name: string
}

export interface User {
  id: string
  username: string
  name: string
  email: string
}

export interface Project {
  id: string
  name: string
  _company_id: string
  company: string
  projecttype: string
  hour_price: string
  invoice: string
}

export interface SaveEntryPayload {
  id: string           // '-1' for new
  company: string
  project: string
  description: string
  internal_description: string
  hour: string
  invoice_hours: string
  invoice: string
  no_flex: string
  username: string
  _user_id: string
  _company_id: string
  _project_id: string
  hour_price: string
  task_date: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

async function call<T>(params: Record<string, string>, body?: Record<string, string>): Promise<T> {
  const result = await api.apiCall(params, body ?? null)
  if (result.error === 'not_authenticated') throw new Error('NOT_AUTHENTICATED')
  if (result.error) throw new Error(result.error)
  return result.data as T
}

// ─── API methods ──────────────────────────────────────────────────────────────

export async function loadTimeEntries(date: Date): Promise<TimeEntry[]> {
  const res = await call<{ count: number; rows: TimeEntry[] }>(
    { c: 'time', m: 'load' },
    { date: formatDate(date) }
  )
  return res.rows
}

export async function saveTimeEntry(payload: SaveEntryPayload): Promise<{ success: boolean; id?: string }> {
  return call(
    { c: 'time', m: 'save' },
    payload as unknown as Record<string, string>
  )
}

export async function deleteTimeEntry(id: string): Promise<void> {
  await call({ c: 'time', m: 'delete' }, { id })
}

export async function loadCompanies(): Promise<Company[]> {
  const res = await call<{ count: number; rows: Company[] }>(
    { c: 'companies', m: 'loadList', active: 'true', has_projects: 'true' }
  )
  return res.rows
}

export async function loadUsers(): Promise<User[]> {
  // Endpoint returns every user (incl. plaintext password field we ignore).
  const res = await call<{ count: number | string; rows: any[] }>({ c: 'user', m: 'load' })
  return (res.rows || []).map((r) => ({
    id: String(r.id),
    username: r.username || '',
    name: r.name || '',
    email: r.email || '',
  }))
}

export async function loadProjects(companyId: string): Promise<Project[]> {
  const res = await call<{ count: number; rows: Project[] }>(
    { c: 'projects', m: 'load', active: 'true' },
    { _company_id: companyId }
  )
  return res.rows
}
