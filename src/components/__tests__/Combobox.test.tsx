import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { Combobox } from '../Combobox'

const items = [
  { id: '1', name: 'DevCore' },
  { id: '2', name: 'Acme Corp' },
  { id: '3', name: 'Globex' },
  { id: '4', name: 'Initech' },
]

describe('<Combobox />', () => {
  afterEach(async () => { await i18n.changeLanguage('en') })

  it('renders the placeholder when nothing is selected', () => {
    render(<Combobox value="" items={items} onChange={() => {}} placeholder="Search client…" />)
    expect(screen.getByPlaceholderText('Search client…')).toBeInTheDocument()
  })

  it('shows the selected item name in the input', () => {
    render(<Combobox value="2" items={items} onChange={() => {}} />)
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
  })

  it('opens the dropdown on focus and lists the items', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getByText('DevCore')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('filters items as the user types', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.type(input, 'dev')
    expect(screen.getByText('DevCore')).toBeInTheDocument()
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument()
  })

  it('calls onChange with the picked item id', async () => {
    const onChange = vi.fn()
    render(<Combobox value="" items={items} onChange={onChange} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText('Globex'))
    expect(onChange).toHaveBeenCalledWith('3')
  })

  it('shows "No matches" (EN) when nothing matches', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.type(input, 'zzzz')
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('shows "Inga träffar" (SV) when i18n is in Swedish mode and nothing matches', async () => {
    await i18n.changeLanguage('sv')
    render(<Combobox value="" items={items} onChange={() => {}} />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.type(input, 'zzzz')
    expect(screen.getByText('Inga träffar')).toBeInTheDocument()
  })

  it('clears the selection via the clear button', async () => {
    const onChange = vi.fn()
    render(<Combobox value="2" items={items} onChange={onChange} />)
    await userEvent.click(screen.getByTitle('Clear'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('reopening with ArrowDown highlights the first option (no off-by-one)', async () => {
    const onChange = vi.fn()
    render(<Combobox value="" items={items} onChange={onChange} />)
    const input = screen.getByRole('combobox')
    await userEvent.click(input) // opens on focus
    await userEvent.keyboard('{Escape}') // collapses, stays focused
    await userEvent.keyboard('{ArrowDown}') // reopens, lands on index 0
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('1')
  })
})
