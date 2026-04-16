# DevCore TimeTracker Sidebar — Bug & Improvement Log

Severity scale: **P0** = data loss / broken core flow, **P1** = real user pain, **P2** = polish / nice-to-have.

Status: `open` / `in progress` / `fixed` / `wontfix`.

---

## P0 — Data loss / broken core

| # | Title | Status | Notes |
|---|---|---|---|
| 1 | Timer state lost on window reload / app restart | fixed | `tSec, tRun, tCo, tPr, tD, tNote, tInv` + `startedAt` persisted to electron-store; on load, if running, elapsed is recomputed from `startedAt`. |
| 3 | Timer entries save to `selectedDate` instead of today | fixed | Timer stop now uses `fmtDateISO(new Date())`; Log view still respects `selectedDate` (for back-dated manual entries). |
| 7 | No tray icon → app can zombie if all windows closed | fixed | `assets/tray-icon.png` generated (solid purple 16×16). Tray now visible; Show/Hide/Quit menu works. |
| 8 | Hardcoded user `_user_id=187 / username=Simon Stancovich` | fixed | Endpoint probe showed no per-user API exists; `c=user&m=load` returns all users. Current user is now inferred from any `time.load` row's `_user_id`, resolved against the user list, and cached in electron-store (`currentUser`). Fallback to hardcoded Simon only if the account has never logged an entry. Note: the `user.load` response includes plaintext `password` fields — we intentionally strip them in `api.ts` and never persist/log them. |

## P1 — Real pain

| # | Title | Status | Notes |
|---|---|---|---|
| 2 | `streak` value never updated anywhere | fixed | Computed on load from `lastLoggedDate` + saved streak; incremented on first save of a new day; resets if gap > 1 day. |
| 4 | Delete is fire-and-forget; server rejection still removes locally | fixed | `deleteTimeEntry` now awaited; entry removed from state only on success. |
| 11 | Cannot start timer without a client/project picked | fixed | Start button always enabled; save-gate still requires all fields (toast explains when they're missing at stop time). |
| 35 | Full sidebar doesn't auto-minimize when clicking outside | fixed | `mainWindow.on('blur')` collapses to pill; renderer syncs via `onForcedSize` IPC event so React state matches. |
| 36 | `formatDate` used `toISOString()` (UTC), shifting query date off by one near midnight | fixed | Replaced with local-tz formatter in `api.ts`. Monday's hours now load correctly in Swedish TZ. |
| 37 | No server-side crash safety — unsaved timer time was lost on crash | fixed | While the timer is running, the entry is upserted to the server every 5 min. First save creates a draft (id=-1) and captures the returned `id` into `draftId` (persisted); subsequent saves update the same id. Final Stop & Log uses `draftId` to finalize. No duplicate entries. |
| 38 | Starting a different task from Today/Recent silently discarded the current timer | fixed | Added a themed in-app confirmation modal. `switchTaskGuarded()` wraps both "Continue last task" and Recent ▶; if `tRun` or `tSec > 0`, the user must confirm before the current timer state is reset. Draft stays on the server. |
| 9 | LogView has no internal-notes field; Timer does | fixed | Added Internal-notes textarea to LogView; stored as `internal_description` on save. |
| 10 | 655-company `<select>` is unusable without search | fixed | Replaced both client pickers (Timer + Log) with a typeahead `Combobox` component (`src/components/Combobox.tsx`): type to filter, arrow-keys to navigate, enter to pick, ✕ to clear. Shows first 40 results; 'type to filter' footer when list is clipped. |
| 12 | No way to edit an existing entry | fixed | Double-clicking a logged entry opens the +Log tab prefilled with its values (client/project/hours/description/notes/invoice). Saving passes the original id so the server updates in place. LogView now also has an Internal notes field that maps to `internal_description`. |
| 15 | "Save failed" toast has no detail | fixed | `api-call` in main.js now strips HTML from non-2xx responses and propagates a 120-char snippet (`http_500: Internal Server Error — could not load…`). Toast shows it verbatim. |
| 18 | No global hotkey to expand/toggle sidebar | fixed | `Ctrl+Shift+T` toggles full ↔ pill from anywhere via `globalShortcut`; expands + focuses when collapsed, collapses to pill when full. Unregistered on `will-quit`. |

## P2 — Polish / code quality

| # | Title | Status | Notes |
|---|---|---|---|
| 5 | Achievements only unlock on save (no backfill from history) | open | User with existing logs gets no badges. |
| 6 | `invoice` field: we send `'1'` / `'false'`, server returns `'1'` / `'0'` | open | Verify what's stored after a non-invoiceable save; Today view's BILL dot may misread. |
| 13 | Pill minimize UX: body click expands, ▼ button shrinks further — not obvious | open | Add tooltip or swap button icons. |
| 14 | `window.confirm()` sign-out dialog is unthemed | open | Custom modal would match. |
| 16 | Billable toggle size inconsistent (LogView 44×24, TimerView 36×20) | open | Normalize. |
| 17 | Pill marquee animates even when text fits | open | Detect overflow and conditionally animate. |
| 19 | `App.tsx` is ~985 lines | open | Split into `components/{Header, Today, Timer, Log, XP, Pill, Square}.tsx`. |
| 20 | Orphaned files: `src/components/{Timer,NewEntryForm,EntryList}.tsx` | open | Delete. |
| 21 | Inline styles everywhere | open | Fine for the port; long-term move to CSS vars or styled helpers. |
| 22 | CSP in `index.html` allows `ws://localhost:*` — too loose for prod | open | Emit a stricter CSP for packaged builds. |
| 23 | Window position not persisted across restarts (spec says it is) | open | Persist bounds via electron-store on move/close. |
| 24 | Header row cramped on narrow width | open | Minor — we control width (380 px). |
| 26 | No loading spinner during initial data load | open | Just text "Loading…". |
| 28 | Auth window no fallback if server down / 404 | open | Show a retry / error view. |
| 30 | No offline state handling | open | Queue saves when network is down. |
| 33 | `window-all-closed` handler is a no-op comment — tray should recreate window on click | open | With a real tray icon now, this needs wiring. |
| 34 | No React error boundary | open | One bad render = white screen. |
| 39 | Ship a parallel web build alongside the Electron app | open | Single codebase, runtime adapter. Plan: `src/env.ts` exports `isElectron = !!window.electronAPI`. Add `adapters/{api,storage,window}.ts` — Electron path uses existing IPC, web path uses `fetch(..., { credentials: 'include' })` + `localStorage`. Guard pill/square/tray/global-hotkey on `isElectron`. `npm run build` already emits relative paths (`base: './'`) so the same `dist/` works for both Electron and for dropping into `timetracker.devcore.se/sidebar/` (same-origin → no CORS, cookies shared with main app). Web loses floating sidebar, tray, global hotkey — just a browser tab. Auth flow splits: web redirects top window to login instead of opening a BrowserWindow. Est. half to full day. |

---

## Conventions for this file
- Add new rows at the bottom of the relevant severity section.
- When fixing, set Status to `fixed` and leave the Notes line describing the fix so future you has a breadcrumb.
- Don't delete rows; we keep the history.
