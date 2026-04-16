import { useEffect, useRef, useState } from 'react'
import { NewEntryForm } from './NewEntryForm'
import { TimeEntry } from '../api'

interface Props {
  onSave: (entry: TimeEntry) => void
}

export function Timer({ onSave }: Props) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [showForm, setShowForm] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function start() {
    startRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    setRunning(true)
  }

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
    setShowForm(false)
  }

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const hours = Math.round((elapsed / 3600) * 4) / 4 // round to nearest 0.25

  if (showForm) {
    return (
      <div>
        <div className="timer-summary">
          <span>⏱ {formatTime(elapsed)}</span>
          <span className="muted">→ {hours.toFixed(2)}h</span>
          <button className="btn-ghost" onClick={() => setShowForm(false)}>← Back</button>
        </div>
        <NewEntryForm
          date={new Date()}
          prefillHours={hours}
          onSaved={(entry) => {
            reset()
            onSave(entry)
          }}
        />
      </div>
    )
  }

  return (
    <div className="timer">
      <div className={`timer-display ${running ? 'running' : ''}`}>
        {formatTime(elapsed)}
      </div>
      <div className="timer-hours">{hours.toFixed(2)} hours</div>
      <div className="timer-controls">
        {!running ? (
          <button className="btn-primary btn-large" onClick={start}>
            {elapsed === 0 ? '▶ Start' : '▶ Resume'}
          </button>
        ) : (
          <button className="btn-secondary btn-large" onClick={pause}>⏸ Pause</button>
        )}
        {elapsed > 0 && (
          <>
            <button className="btn-primary" onClick={() => { pause(); setShowForm(true) }}>
              ✓ Log time
            </button>
            <button className="btn-ghost" onClick={reset}>✕ Reset</button>
          </>
        )}
      </div>
    </div>
  )
}
