import { formatLocalDate } from './lib/date'
import { ApiError, classifyApiError } from './lib/apiError'
import { mockCall } from './api.mock'
import { isTestMode } from './lib/testMode'
import { createLog } from './lib/logger'

const api = window.electronAPI
const TEST_MODE = isTestMode()
const log = createLog('api')

export type WireBoolIn = '0' | '1'
export type WireBoolOut = 'true' | 'false'
export type HoursString = string
export type IsoDate = string

export interface TimeEntry {
  id: string
  _user_id: string
  _project_id: string
  _company_id: string
  task_date: IsoDate
  description: string
  internal_description: string
  hour: HoursString
  invoice_hours: HoursString
  invoice: WireBoolIn
  no_flex: WireBoolIn
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
  invoice: WireBoolIn
}

export interface SaveEntryPayload {
  id: string
  company: string
  project: string
  description: string
  internal_description: string
  hour: HoursString
  invoice_hours: HoursString
  invoice: WireBoolOut
  no_flex: WireBoolOut
  username: string
  _user_id: string
  _company_id: string
  _project_id: string
  hour_price: string
  task_date: IsoDate
  create_date: string
  admin_ok: WireBoolOut
  _admin_id: string
  admin_date: string
  ignore_flex: WireBoolOut
  invoiced: WireBoolOut
  show_customer: WireBoolOut
  _invoicer_id: string
  invoicer: string
  verifier: string
  delete: WireBoolOut
  companyadmin: WireBoolOut
}

const SERVER_REQUIRED_DEFAULTS = {
  no_flex: 'false',
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
} as const satisfies Partial<SaveEntryPayload>

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
  const h: HoursString = opts.hours.toString()
  return {
    id: opts.existingId || '-1',
    company: opts.company.name,
    project: opts.project.name,
    description: opts.description || opts.project.name,
    internal_description: opts.internalNote,
    hour: h,
    invoice_hours: h,
    invoice: opts.invoice ? 'true' : 'false',
    username: opts.user.username,
    _user_id: opts.user._user_id,
    _company_id: opts.company.id,
    _project_id: opts.project.id,
    hour_price: opts.project.hour_price || '0',
    task_date: formatLocalDate(opts.entryDate),
    create_date: new Date().toISOString().slice(0, 19),
    ...SERVER_REQUIRED_DEFAULTS,
  }
}

async function call<T>(params: Record<string, string>, body?: Record<string, string>): Promise<T> {
  if (TEST_MODE) return mockCall<T>(params, body)
  const result = await api.apiCall(params, body ?? null)
  if (result.error) {
    log.warn(`${params.c}.${params.m} failed`, { error: result.error })
    throw new ApiError(classifyApiError(result.error), result.error)
  }
  return result.data as T
}

const inflightTimeLoads = new Map<string, Promise<TimeEntry[]>>()

export async function loadTimeEntries(date: Date): Promise<TimeEntry[]> {
  const key = formatLocalDate(date)
  const existing = inflightTimeLoads.get(key)
  if (existing) return existing
  const promise = call<{ count: number; rows: TimeEntry[] }>(
    { c: 'time', m: 'load' },
    { date: key }
  )
    .then((res) => res.rows)
    .finally(() => {
      inflightTimeLoads.delete(key)
    })
  inflightTimeLoads.set(key, promise)
  return promise
}

export async function saveTimeEntry(payload: SaveEntryPayload): Promise<{ success: boolean; id?: string }> {
  return call<{ success: boolean; id?: string }>(
    { c: 'time', m: 'save' },
    payload as unknown as Record<string, string>,
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
  const res = await call<{ count: number | string; rows: Record<string, unknown>[] }>({ c: 'user', m: 'load' })
  return (res.rows || []).map((r) => ({
    id: String(r.id),
    username: typeof r.username === 'string' ? r.username : '',
    name: typeof r.name === 'string' ? r.name : '',
    email: typeof r.email === 'string' ? r.email : '',
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
