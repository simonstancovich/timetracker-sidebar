import { formatLocalDate } from './lib/date'

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
  create_date: string
  admin_ok: string
  _admin_id: string
  admin_date: string
  ignore_flex: string
  invoiced: string
  show_customer: string
  _invoicer_id: string
  invoicer: string
  verifier: string
  delete: string
  companyadmin: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function buildSavePayload(opts: {
  company: Company
  project: Project
  hours: number
  description: string
  internalNote: string
  invoice: boolean
  user: { _user_id: string; username: string }
  entryDate: Date
  existingId: string | null
}): SaveEntryPayload {
  const h = opts.hours.toString()
  const nowIso = new Date().toISOString().slice(0, 19)
  return {
    id: opts.existingId || '-1',
    company: opts.company.name,
    project: opts.project.name,
    description: opts.description || opts.project.name,
    internal_description: opts.internalNote,
    hour: h,
    invoice_hours: h,
    invoice: opts.invoice ? 'true' : 'false',
    no_flex: 'false',
    username: opts.user.username,
    _user_id: opts.user._user_id,
    _company_id: opts.company.id,
    _project_id: opts.project.id,
    hour_price: opts.project.hour_price || '0',
    task_date: formatLocalDate(opts.entryDate),
    create_date: nowIso,
    admin_ok: 'false',
    _admin_id: '',
    admin_date: '',
    ignore_flex: 'false',
    invoiced: 'false',
    show_customer: 'false',
    _invoicer_id: '',
    invoicer: '',
    verifier: '',
    delete: 'false',
    companyadmin: 'false',
  }
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
    { date: formatLocalDate(date) }
  )
  return res.rows
}

export async function saveTimeEntry(payload: SaveEntryPayload): Promise<{ success: boolean; id?: string }> {
  console.log('[save] payload:', JSON.stringify(payload))
  const res = await call<{ success: boolean; id?: string }>(
    { c: 'time', m: 'save' },
    payload as unknown as Record<string, string>
  )
  console.log('[save] response:', JSON.stringify(res))
  return res
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

function lastDayIso(monthAnchor: Date): string {
  const last = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}T00:00:00`
}

export async function monthEnded(monthAnchor: Date): Promise<boolean> {
  const res = await call<{ ended?: boolean; success?: boolean }>(
    { c: 'time', m: 'month_ended' },
    { month: lastDayIso(monthAnchor) },
  )
  return !!res.ended
}

export async function endMonth(monthAnchor: Date): Promise<boolean> {
  const res = await call<{ success?: boolean }>(
    { c: 'time', m: 'end_month' },
    { month: lastDayIso(monthAnchor) },
  )
  return !!res.success
}
