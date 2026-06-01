import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { isTestMode } from './lib/testMode'
import './App.css'

if (isTestMode()) {
  const FIXED = new Date('2026-06-01T10:00:00Z').getTime()
  const RealDate = Date
  const FakeDate = function (this: Date, ...args: unknown[]) {
    if (args.length === 0) return new RealDate(FIXED)
    return new (RealDate as unknown as new (...a: unknown[]) => Date)(...args)
  } as unknown as DateConstructor
  Object.defineProperty(FakeDate, 'prototype', { value: RealDate.prototype })
  FakeDate.now = () => FIXED
  FakeDate.parse = RealDate.parse.bind(RealDate)
  FakeDate.UTC = RealDate.UTC.bind(RealDate)
  globalThis.Date = FakeDate
  Math.random = () => 0.5
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
