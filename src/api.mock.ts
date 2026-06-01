import type { TimeEntry, Company, Project, User } from './api'

const TODAY = '2026-06-01'

const acme: Company = { id: 'c1', name: 'Acme Corp' }
const fravaro: Company = { id: 'c2', name: 'Frånvaro' }

const project: Project = {
  id: 'p1',
  name: 'Website redesign',
  _company_id: 'c1',
  company: 'Acme Corp',
  projecttype: 'consulting',
  hour_price: '1200',
  invoice: '1',
}
const sickProject: Project = {
  id: 'p2',
  name: 'Sick leave',
  _company_id: 'c2',
  company: 'Frånvaro',
  projecttype: 'absence',
  hour_price: '0',
  invoice: '0',
}

const testUser: User = { id: '1', username: 'testuser', name: 'Test User', email: 'test@example.com' }

function makeEntry(
  id: string,
  hour: string,
  description: string,
  invoice: '0' | '1',
): TimeEntry {
  return {
    id,
    _user_id: '1',
    _project_id: 'p1',
    _company_id: 'c1',
    task_date: `${TODAY} 00:00:00`,
    description,
    internal_description: '',
    hour,
    invoice_hours: hour,
    invoice,
    no_flex: '0',
    hour_price: '1200.00',
    username: 'testuser',
    company: 'Acme Corp',
    project: 'Website redesign',
    create_date: `${TODAY} 09:00:00`,
  }
}

const todayEntries: TimeEntry[] = [
  makeEntry('e1', '1.50', 'Wireframes for homepage', '1'),
  makeEntry('e2', '2.00', 'Component library audit', '1'),
  makeEntry('e3', '0.75', 'Design review with client', '1'),
]

export function mockCall<T>(
  params: Record<string, string>,
  body?: Record<string, string>,
): T {
  const key = `${params.c}.${params.m}`

  switch (key) {
    case 'time.load': {
      const date = body?.date ?? TODAY
      const rows = date === TODAY ? todayEntries : []
      return { count: rows.length, rows } as T
    }
    case 'time.save':
      return { success: true, id: `new-${Date.now()}` } as T
    case 'time.delete':
      return { success: true } as T
    case 'time.month_ended':
      return { ended: false } as T
    case 'time.end_month':
      return { success: true } as T
    case 'companies.loadList':
      return { count: 2, rows: [acme, fravaro] } as T
    case 'projects.load': {
      const cid = body?._company_id
      if (cid === 'c1') return { count: 1, rows: [project] } as T
      if (cid === 'c2') return { count: 1, rows: [sickProject] } as T
      return { count: 0, rows: [] } as T
    }
    case 'user.load':
      return { count: 1, rows: [testUser] } as T
    default:
      return { count: 0, rows: [] } as T
  }
}
