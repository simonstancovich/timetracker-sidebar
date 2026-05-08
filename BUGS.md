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

## `main.js` code review (2026-04-16) — improvements to reach 10/10

Current rating: **8/10**. Thoughtful code that handles real edge cases (IP-lock, display-metrics focus revocation, CORS bypass, BOM). Items below are the gap to 10/10.

### Real bugs

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 40 | `probeAuthenticated` uses UTC date → wrong-day query near midnight | P1 | fixed | Added `formatLocalDate(date)` helper at top of `main.js`, mirrors `api.ts::formatDate`. `probeAuthenticated` now calls `formatLocalDate(new Date())` instead of `toISOString().slice(0,10)`. |
| 41 | `net.request` has no timeout — hung connection freezes renderer IPC forever | P1 | fixed | Added `REQUEST_TIMEOUT_MS = 15000` + a `done()` single-resolve guard pattern to both `api-call` and `probeAuthenticated`. On timeout: `req.abort()` and resolve with `{ error: 'timeout' }` (or `false` for the probe). Subsequent `'error'` events from the aborted request are silently dropped by the `settled` flag. |

### Dead / stale code

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 42 | `probeUserEndpoints` + `probe-user` IPC + `preload.js:probeUser` are dead code | P2 | fixed | Deleted the 35-line scan function, the IPC handler, and the preload export. Left a one-line comment above `probeAuthenticated` explaining the current-user strategy (no separate API — infer from `time.load` + resolve in `user.load`). |
| 43 | `store.get('loggedIn')` is set but never read | P2 | fixed | Dropped both the `store.set("loggedIn", true)` after auth and the `store.delete("loggedIn")` in `signOut`. `probeAuthenticated` is the single source of truth for session state; a cached flag would only have risked showing the logged-in UI against a server-expired session. `store` instance still used by the `store-get`/`store-set` IPC handlers. |

### Duplication

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 44 | Three near-identical `net.request` blocks | P2 | fixed | Extracted `apiRequest({ c, m, query, body })` at top of IPC section. Returns uniform `{ status, body } \| { timedOut } \| { networkError }`. Both `api-call` and `probeAuthenticated` are now thin interpreters of that shape — session/headers/timeout/BOM live in one place. Next new call site (e.g. a future `c=user&m=current` probe) just consumes `apiRequest` and decides what the response means. |

### Smaller polish

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 45 | Empty `window-all-closed` handler (`main.js:358`) | P2 | fixed | Collapsed `() => { if (process.platform !== "darwin") {} }` to `() => {}`. The registration itself is the load-bearing part — it overrides Electron's default "quit when all windows close" so the app keeps running in the tray on Windows. The platform check was noise (macOS default is also "don't quit"). |
| 46 | Window-mode inference from current height uses magic numbers (`main.js:330`) | P2 | fixed | Added `let currentMode = "full"` in module scope; `setWindowSize(size)` updates it. The blur handler (`currentMode === "full"`), `onDisplayChange` (`setWindowSize(currentMode)`), and global hotkey (`isFull = currentMode === "full"`) now read the mode directly instead of reverse-engineering from pixel bounds. Removed 3 magic-number comparisons and 3 `getSize()`/`workAreaSize` reads. |
| 47 | No process-level error handlers | P2 | fixed | Added `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` at the top of `main.js` — both route through `log.error` (electron-log). One bad async callback no longer takes down the whole main process silently. |
| 48 | No production logging — only `console.log` visible in dev terminal | P2 | fixed | `npm i electron-log`; main.js now uses `const log = require('electron-log/main')` with `log.initialize()` and info-level console + file transports. All `console.log` sites replaced with `log.info` (normal), `log.warn` (timeouts, redirects, non-JSON, invalid params), `log.error` (process-level handlers). Packaged builds write to `%APPDATA%/{app name}/logs/main.log` with rotation — users can attach it to bug reports. |
| 49 | IPC input not shape-checked | P2 | fixed | `api-call` handler now guards at the top: `if (!params \|\| !params.c \|\| !params.m)` → `log.warn` + `return { error: 'invalid_params' }`. A renderer typo (undefined payload, missing c/m, wrong key names) now surfaces as a clean structured error instead of a cryptic destructure TypeError or a `c=undefined&m=undefined` URL. |

### Structural

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 50 | `main.js` is 364 lines doing 6 jobs (window, tray, auth, API, IPC, lifecycle) | P2 | open | Fine at this size. At ~500 lines, split into `src/main/{window,auth,api,tray,ipc,store}.js` each exporting its public surface; `main.js` becomes the composition root. |

### Recommended fix order (to hit 10/10)

1. #40 — UTC date (5 min)
2. #41 — request timeout (10 min, lands inside #44)
3. #42, #43, #45 — delete dead code (5 min)
4. #44 — extract shared `request()` helper (30 min)
5. #47, #48 — error handlers + electron-log (20 min)

---

## `App.tsx` code review (2026-04-16) — improvements toward a maintainable 10/10

Current rating: **6/10**. The UX is thoughtful, crash-safety is correct, focus/display-change handling is real-world-tested. The problem is shape: it's one 1434-line component holding ~40 `useState`s, four views as IIFEs, two full alternate renders (pill + square), inline styles on every element, and several duplicated pieces. Everything below is structural — no behavior changes, just making the code tell you what it does without you having to trace 900 lines of rendering.

### Structure — the big ones

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 52 | File is one component doing 6 jobs (1434 lines) | P2 | open | Split at the natural seams. Target: `src/App.tsx` drops to ~150 lines (composition + auth gate + shell), everything else moves to `src/views/{TodayView,TimerView,LogView,XpView}.tsx`, `src/layouts/{PillBar,SquareBar}.tsx`, `src/components/{Header,ProgressBar,Footer,FloatToast,AchievementToast,ConfirmDialog}.tsx`. The IIFE `todayView`/`timerView`/etc. pattern currently computes all four tabs on every render even when inactive — components with `{tab === 'x' && <X />}` are strictly better (free, clearer, and naturally lazy). |
| 53 | ~40 `useState`s in a single component, state concerns not separated | P2 | open | Bucket into custom hooks: `useTimerState()` (tCo/tPr/tD/tNote/tInv/tSec/tRun/draftId + reset + persistence), `useLogForm()` (fCo/fPr/fH/fD/fNote/fInv/fHInput/editingId), `useGamification()` (xp/unlocked/streak/achievement toast), `useWindowMode()` (size/expandLockUntil/goSize). `App.tsx` then reads each via `const timer = useTimerState()`. Makes it trivial to see what belongs to which feature and unblocks per-hook unit testing later. |
| 54 | `usePersistedState<T>(key, initial)` would collapse 6 useEffects | P2 | open | Lines 323-326 and the manual load/save pairs for `mode`/`xp`/`unlocked`/`streak`/`timer`/`logForm`/`currentUser` are the same pattern 7 times: load once on mount, write on change, gated by `authed`. One 20-line hook replaces all of them; state declarations become `const [xp, setXp] = usePersistedState('xp', 0)`. |

### Duplication

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 55 | `SaveEntryPayload` built identically in `saveNewEntry` and `autoSaveDraft` | P1 | fixed | Extracted `buildSavePayload({ company, project, hours, description, internalNote, invoice, user, entryDate, existingId })` to `api.ts`. Both call sites are now ~7-line object literals instead of ~17. Single source of truth for field shape, coercions (`invoice ? '1' : 'false'`), and date formatting. |
| 56 | Timer reset logic inlined in three places | P2 | fixed | Extracted `resetTimer()` (7 setters + ref clear). Call sites: `stopAndLogCurrent` and `stop` inside `timerView`. Also extracted `resetLogForm()` for the same pattern across the +Log tab's save-success and cancel-edit paths. |
| 57 | `fmtDateISO` in App.tsx, `formatDate` in api.ts, `formatLocalDate` in main.js — three copies of the same 4-line function | P2 | fixed | Created `src/lib/date.ts` exporting `formatLocalDate(date)`. `App.tsx` and `api.ts` both import from it; `App.tsx` keeps `fmtDateISO` as a local re-alias so existing call sites don't change. `main.js` still has its own copy (different module context — no shared TypeScript path to the renderer). All three copies now share one definition. |
| 58 | Inline styles everywhere, palette tokens repeated hundreds of times | P2 | open | BUGS #21 called this out already. Deferred: the review flags this as post-#52 work. Refactoring styles touches fewer files once views are split into `src/views/*.tsx`. Doing it before the view split would force two passes over the same code. |
| 59 | `<style>` keyframe blocks copy-pasted three times (full / pill / square renders) | P2 | fixed | Moved all 5 keyframes (`pulse`, `marquee`, `runEdge`, `floatUp`, `achIn`), `.pill-marquee*`, `.rec-runner*::after`, scrollbar width/thumb, and `select option` into `App.css`. Theme-dependent colors (`M.pk`, `M.b1`, `M.bg`, `M.t1`) swapped for CSS custom properties (`--rec-color`, `--scrollbar-thumb`, `--select-bg`, `--select-fg`) written to `document.documentElement.style` by a new `useEffect([M])`. All three inline `<style>` blocks removed from App.tsx. Net: 1 source of truth for animations, no render-time CSS string interpolation. |
| 60 | `weekH.reduce((s, h) => s + h, 0)` in three places without memo | P2 | fixed | Added `const weekTotal = useMemo(() => weekH.reduce((s, h) => s + h, 0), [weekH])` next to `todayH`. Replaced all three inline reduce calls (Today view total, XP view week label, XP view bonus calc) with `weekTotal`. |
| 61 | `(currentUser \|\| FALLBACK_USER)` repeated 4×; `currentUser: null` is always transient | P2 | fixed | Seeded `useState` with `FALLBACK_USER` as the initial value and removed the `\| null` from the type. All 4 `(currentUser \|\| FALLBACK_USER).field` coalesces gone — they're now just `currentUser.field` (via the `buildSavePayload` helper for two of them, and direct access for `firstName` derivation). Initial render shows "Simon" until the resolve effect either confirms or upgrades to the real signed-in user. |

### State-machine / control-flow clarity

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 62 | `switchTaskGuarded` bundles 4 outcomes in nested inline ifs | P2 | open | Lines 208-253. The decision — "running+has-unsaved → confirm, paused+has-unsaved → save-silent, empty → apply" — is data, not control flow. Split: `const decision = computeSwitchAction({ tRun, canSaveCurrent })` returning `'confirm' \| 'save-silent' \| 'apply'`. Then `switch(decision)`. The confirm/apply/save handlers are already separated; just lift the dispatch. |
| 63 | Achievement checks inlined 2× in `saveNewEntry`, one `if` per badge | P2 | open | Lines 527-538. Every new achievement adds another copy/paste. Replace with a predicate table: `const ACH_TRIGGERS: { id: string; when: (ctx: AchCtx) => boolean }[] = [...]`. Loop and unlock. Also unblocks BUGS #5 (backfill achievements from history) since you can run the same predicates over past entries. |

### Smaller polish

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 64 | `views[tab]` dict pretends to route but evaluates all four views every render | P2 | open | Line 1225. Replace with `{tab === 'today' && <TodayView {...} />}` etc. Inactive tabs stop rendering entirely — real lazy render, no `useMemo` needed. Directly addresses #52's IIFE perf smell. |
| 65 | `height: 'calc(100vh - 124px)'` — 124 is a magic constant (header 72 + footer 40 + border 12) | P2 | open | Silent breakage if either chrome piece changes. Use flexbox: outer `display: flex, flexDirection: column, height: 100vh`, header+footer `flex: 0`, content `flex: 1, overflowY: auto`. No more number to maintain. |
| 66 | `err: any` at every catch site | P2 | open | Renderer's `api.ts::call` throws `Error('NOT_AUTHENTICATED')` — a real typed `ApiError` class with a discriminator would let call sites do `err instanceof ApiError && err.kind === 'not_authenticated'` instead of string-compare. Low value today but lets #67 (error boundary) be typed too. |
| 67 | No React error boundary | P2 | open | BUGS #34 — already tracked. Low effort, high value: one bad render no longer white-screens. With #51 (session-lost) handling transport errors and this handling render errors, recovery is complete. |
| 68 | `autoSaveRef.current = autoSaveDraft` on every render (no dep list) | P2 | open | Line 574. Works — re-assigns the ref on each render so the setInterval callback reads fresh state. But the mechanism is non-obvious and the effect has no `[dep]` array. Wrap in `useEffect(() => { autoSaveRef.current = autoSaveDraft })` (bare effect runs every render, same semantics) or explicitly `useEffect(..., [autoSaveDraft])` for clarity. Better: `useLatestCallback` hook. |
| 69 | Orphan files `src/components/{Timer,NewEntryForm,EntryList}.tsx` | P2 | open | BUGS #20 already tracked. Natural home for the extractions in #52 — either resurrect them as the real components or delete them when the new components land. |

### Recommended fix order (biggest legibility win per unit of work)

1. **#59** (keyframes → App.css) — 5 min, one file is shorter by 45 lines.
2. **#55** (`buildSavePayload`) — 20 min, deletes 20 lines, closes a drift surface.
3. **#56, #60, #61** (resetTimer, memoize week total, drop FALLBACK_USER coalesce) — 15 min together, small but clean.
4. **#54** (`usePersistedState`) — 30 min, collapses 7 effect blocks into one hook call per slice.
5. **#52 + #64** (extract views as components, real lazy render) — 2-3 h, biggest single legibility win. Do this as one PR; half-extractions are messier than the original.
6. **#58** (styled primitives) — 2-3 h on top of #52. Order matters: extract components first, then the styling refactor touches fewer files.
7. **#53** (state into custom hooks) — 1-2 h once views are extracted; the seams are obvious by then.
8. **Remaining items** — opportunistic, during normal work.

Post-refactor target: `App.tsx` ≤ 200 lines, each view file ≤ 250 lines, zero keyframe duplication, one payload builder, one date formatter shared main↔renderer.

---

## Post-review bugs

| # | Title | Severity | Status | Notes |
|---|---|---|---|---|
| 51 | Cookie expiry mid-session → blank screen instead of LoginScreen | P0 | fixed | Root cause: only 2 of ~8 API call sites caught `NOT_AUTHENTICATED` (others silent-swallowed or re-threw) and there's no React error boundary, so an uncaught throw unmounted the whole tree. Fix at the transport layer: `main.js` `api-call` handler now sends a `session-lost` IPC event alongside `{ error: 'not_authenticated' }` whenever the server returns a 3xx redirect. Renderer subscribes once (same effect as other auth listeners) → `setAuthed(false)` → existing render guard at `App.tsx:598` shows `<LoginScreen>`. Individual call-site catches can keep their silent-swallow semantics for transient errors without masking auth loss. Also softened `loadCompanies().catch(() => setAuthed(false))` to `.catch(() => {})` — transient errors (500/network) no longer bounce to login, only real auth loss does. |

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
