import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { AbsenceForm } from '../AbsenceForm'

const company = { id: 'c1', name: 'DevCore' }
const projects = [
  { id: 'p1', name: 'Vacation' },
  { id: 'p2', name: 'Sick leave' },
]

function baseProps(overrides: Partial<Parameters<typeof AbsenceForm>[0]> = {}) {
  return {
    company,
    projects,
    minFromISO: '2026-05-01',
    todayISO: '2026-05-15',
    saving: false,
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }
}

describe('<AbsenceForm />', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('shows the empty message and no form when company is null', () => {
    render(<AbsenceForm {...baseProps({ company: null })} />)
    const emptyMatches = screen.getAllByText('No Frånvaro client found')
    expect(emptyMatches.length).toBeGreaterThan(0)
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('renders the form with the company name in the hint and a project picker', () => {
    render(<AbsenceForm {...baseProps()} />)
    expect(screen.getByText('DevCore')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('keeps submit disabled until project + note are provided', async () => {
    render(<AbsenceForm {...baseProps()} />)
    const submit = screen.getByRole('button', { name: 'Report absence' })
    expect(submit).toBeDisabled()

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Vacation'))
    expect(submit).toBeDisabled()

    await userEvent.type(
      screen.getByPlaceholderText('e.g. vacation, sick, parental…'),
      'Family',
    )
    expect(submit).toBeEnabled()
  })

  it('calls onSubmit with the picked project, dates and note', async () => {
    const onSubmit = vi.fn()
    render(<AbsenceForm {...baseProps({ onSubmit })} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Sick leave'))
    await userEvent.type(
      screen.getByPlaceholderText('e.g. vacation, sick, parental…'),
      'Cold',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Report absence' }))

    expect(onSubmit).toHaveBeenCalledWith('p2', '2026-05-15', '2026-05-15', 'Cold')
  })

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<AbsenceForm {...baseProps({ onClose })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows the saving label and keeps submit disabled while saving', async () => {
    render(<AbsenceForm {...baseProps({ saving: true })} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Vacation'))
    await userEvent.type(
      screen.getByPlaceholderText('e.g. vacation, sick, parental…'),
      'x',
    )
    const submit = screen.getByRole('button', { name: 'Reporting…' })
    expect(submit).toBeDisabled()
  })
})
