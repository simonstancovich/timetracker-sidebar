import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Combobox } from '../Combobox'

const theme = {
  bg: '#fff', s1: '#fff', s2: '#eee', ac: '#7c3aed',
  ad: '#eee', at: '#000', b1: '#ccc', b2: '#aaa',
  t1: '#000', t2: '#333', t3: '#666', tf: '#999',
}

const items = [
  { id: '1', name: 'DevCore' },
  { id: '2', name: 'Acme Corp' },
  { id: '3', name: 'Globex' },
  { id: '4', name: 'Initech' },
]

describe('<Combobox />', () => {
  it('renders the placeholder when nothing is selected', () => {
    render(<Combobox value="" items={items} onChange={() => {}} placeholder="Search client…" theme={theme} />)
    expect(screen.getByPlaceholderText('Search client…')).toBeInTheDocument()
  })

  it('shows the selected item name in the input', () => {
    render(<Combobox value="2" items={items} onChange={() => {}} theme={theme} />)
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
  })

  it('opens the dropdown on focus and lists the items', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} theme={theme} />)
    await userEvent.click(screen.getByRole('textbox'))
    expect(screen.getByText('DevCore')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('filters items as the user types', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} theme={theme} />)
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.type(input, 'dev')
    expect(screen.getByText('DevCore')).toBeInTheDocument()
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument()
  })

  it('calls onChange with the picked item id', async () => {
    const onChange = vi.fn()
    render(<Combobox value="" items={items} onChange={onChange} theme={theme} />)
    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(screen.getByText('Globex'))
    expect(onChange).toHaveBeenCalledWith('3')
  })

  it('shows "No matches" (EN) when nothing matches', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} theme={theme} />)
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.type(input, 'zzzz')
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('shows "Inga träffar" (SV) when lang=sv and nothing matches', async () => {
    render(<Combobox value="" items={items} onChange={() => {}} theme={theme} lang="sv" />)
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.type(input, 'zzzz')
    expect(screen.getByText('Inga träffar')).toBeInTheDocument()
  })

  it('clears the selection via the ✕ button', async () => {
    const onChange = vi.fn()
    render(<Combobox value="2" items={items} onChange={onChange} theme={theme} />)
    await userEvent.click(screen.getByTitle('Clear'))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
