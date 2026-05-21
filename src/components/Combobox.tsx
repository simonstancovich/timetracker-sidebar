import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useTranslation } from '../lib/i18n'
import { IconButton, MenuItem, Popover, Stack, Text, TextInput } from '../primitives'
import { XIcon } from '../icons/XIcon'

interface Item { id: string; name: string }

interface Props {
  value: string
  items: Item[]
  onChange: (id: string) => void
  placeholder?: string
  maxResults?: number
}

export function Combobox({ value, items, onChange, placeholder, maxResults = 40 }: Props) {
  const { t } = useTranslation()
  const selected = useMemo(() => items.find((i) => i.id === value), [items, value])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const listboxId = useId()
  const optionPrefix = useId()
  const optionDomId = (id: string) => `${optionPrefix}-${id}`

  const mouseActiveRef = useRef(false)

  useEffect(() => {
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const onMove = () => { mouseActiveRef.current = true }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [open])

  const filtered = useMemo(() => {
    if (!query) return items.slice(0, maxResults)
    const q = query.toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, maxResults)
  }, [items, query, maxResults])

  useEffect(() => { setHighlight(0) }, [query, open])

  useEffect(() => {
    if (!open) return
    const active = filtered[highlight]
    if (!active) return
    document.getElementById(optionDomId(active.id))?.scrollIntoView?.({ block: 'nearest' })
  }, [highlight, open, filtered])

  const pick = (id: string) => {
    onChange(id)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      mouseActiveRef.current = false
      // Opening lands on index 0 (the open effect resets highlight); only a
      // second press advances.
      if (!open) setOpen(true)
      else setHighlight((h) => Math.max(0, Math.min(filtered.length - 1, h + 1)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      mouseActiveRef.current = false
      if (!open) setOpen(true)
      else setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Tab' && open && filtered.length > 0) {
      // Tab walks the open list (Shift+Tab backwards); at either edge it closes
      // and lets focus move on, so it's navigable but never a focus trap.
      const atEdge = e.shiftKey ? highlight <= 0 : highlight >= filtered.length - 1
      if (atEdge) {
        setOpen(false)
      } else {
        e.preventDefault()
        mouseActiveRef.current = false
        setHighlight((h) => (e.shiftKey ? Math.max(0, h - 1) : h + 1))
      }
    } else if (e.key === 'Home' && open) {
      e.preventDefault()
      mouseActiveRef.current = false
      setHighlight(0)
    } else if (e.key === 'End' && open) {
      e.preventDefault()
      mouseActiveRef.current = false
      setHighlight(Math.max(0, filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && filtered[highlight]) pick(filtered[highlight].id)
      else setOpen(true)
    } else if (e.key === 'Escape') {
      // Native two-stage: first collapse the list, then blur the input.
      if (open) setOpen(false)
      else inputRef.current?.blur()
    }
  }

  const activeDescendant =
    open && filtered[highlight] ? optionDomId(filtered[highlight].id) : undefined

  const inputValue = open ? query : (selected?.name || '')
  const inputPlaceholder = items.length === 0
    ? t('form.loading')
    : (placeholder || t('form.searchDefault'))
  const isFilled = !!selected

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setOpen(true)
  }
  const handleFocus = () => {
    setOpen(true)
    setQuery('')
  }
  const onClearMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    pick('')
  }
  const onHoverHighlight = (i: number) => {
    if (mouseActiveRef.current) setHighlight(i)
  }
  const renderOption = (item: Item, i: number) => {
    const onPick = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      pick(item.id)
    }
    const onHover = () => onHoverHighlight(i)
    return (
      <MenuItem
        key={item.id}
        id={optionDomId(item.id)}
        highlighted={i === highlight}
        onMouseDown={onPick}
        onMouseEnter={onHover}
      >
        {item.name}
      </MenuItem>
    )
  }

  const showEmptyState = filtered.length === 0
  const showResultsFooter = query === '' && items.length > maxResults
  const resultsFooterText = t('form.showingResults', {
    n: maxResults,
    total: items.length,
  })

  return (
    <Stack ref={rootRef} position="relative" fullWidth>
      <TextInput
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={onKey}
        placeholder={inputPlaceholder}
        filled={isFilled}
        trailingSpace
        fullWidth
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
      />
      {value && (
        <Stack
          position="absolute"
          top="none"
          right="sm"
          bottom="none"
          justify="center"
        >
          <IconButton
            variant="ghost"
            size="sm"
            onMouseDown={onClearMouseDown}
            title={t('form.clear')}
            aria-label={t('form.clear')}
          >
            <XIcon size={12} />
          </IconButton>
        </Stack>
      )}
      {open && (
        <Popover role="listbox" id={listboxId}>
          {showEmptyState ? (
            <Stack paddingX="md" paddingY="sm">
              <Text size="base" color="tertiary">{t('form.noMatches')}</Text>
            </Stack>
          ) : (
            filtered.map(renderOption)
          )}
          {showResultsFooter && (
            <Stack paddingX="md" paddingY="xs" border="top">
              <Text size="sm" color="tertiary">{resultsFooterText}</Text>
            </Stack>
          )}
        </Popover>
      )}
    </Stack>
  )
}
