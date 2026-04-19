import { useEffect, useMemo, useRef, useState } from 'react'
import { t as tr, type Lang } from '../lib/i18n'

interface Theme {
  bg: string; s1: string; s2: string; ac: string; ad: string; at: string
  b1: string; b2: string; t1: string; t2: string; t3: string; tf: string
}

interface Item { id: string; name: string }

interface Props {
  value: string
  items: Item[]
  onChange: (id: string) => void
  placeholder?: string
  theme: Theme
  maxResults?: number
  lang?: Lang
}

export function Combobox({ value, items, onChange, placeholder, theme, maxResults = 40, lang = 'en' }: Props) {
  const selected = items.find((i) => i.id === value)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = useMemo(() => {
    if (!query) return items.slice(0, maxResults)
    const q = query.toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, maxResults)
  }, [items, query, maxResults])

  useEffect(() => { setHighlight(0) }, [query, open])

  const pick = (id: string) => {
    onChange(id)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHighlight((h) => Math.min(filtered.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(0, h - 1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && filtered[highlight]) pick(filtered[highlight].id)
      else setOpen(true)
    }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        value={open ? query : (selected?.name || '')}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setOpen(true); setQuery('') }}
        onKeyDown={onKey}
        placeholder={items.length === 0 ? 'Loading…' : (placeholder || 'Search…')}
        style={{
          width: '100%', padding: '11px 32px 11px 12px',
          background: theme.s1, color: selected ? theme.t1 : theme.t3,
          border: `1.5px solid ${selected ? theme.ac : theme.b2}`, borderRadius: 10,
          fontSize: 13, outline: 'none', cursor: 'text',
          fontWeight: selected ? 500 : 400,
        }}
      />
      {value && (
        <button
          onMouseDown={(e) => { e.preventDefault(); pick('') }}
          title="Clear"
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.t3, fontSize: 13, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}
        >✕</button>
      )}
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: theme.bg,
            backgroundImage: `linear-gradient(${theme.s1}, ${theme.s1})`,
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            border: `1px solid ${theme.b2}`, borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)', maxHeight: 220, overflowY: 'auto',
            zIndex: 50,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 12, color: theme.t3 }}>{tr('form.noMatches', lang)}</div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.id}
                onMouseDown={(e) => { e.preventDefault(); pick(item.id) }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: '8px 12px', fontSize: 13,
                  color: i === highlight ? theme.at : theme.t1,
                  background: i === highlight ? theme.ad : 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >{item.name}</div>
            ))
          )}
          {query === '' && items.length > maxResults && (
            <div style={{ padding: '6px 12px', fontSize: 11, color: theme.t3, borderTop: `1px solid ${theme.b1}` }}>
              Showing {maxResults} of {items.length} — type to filter
            </div>
          )}
        </div>
      )}
    </div>
  )
}
