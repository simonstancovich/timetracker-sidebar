# DevCore TimeTracker Sidebar — Architecture & Context

This document is the authoritative context for the app. A new contributor (human or AI) should be able to read only this file + `README.md` + `BUGS.md` and understand what we're building, why, and how it fits together.

---

## 1. Product

**What:** An always-on-top Windows sidebar app (Harvest-style) for logging time to the internal DevCore TimeTracker web app at `https://timetracker.devcore.se`.

**Why it exists:** The web app works, but opening a browser tab, navigating to it, picking client/project, typing hours, and hitting save is friction-heavy enough that people forget to log. A permanent 380 px strip on the right edge of the screen, with a visible running timer and two clicks to log, collapses that friction.

**Scope:** Mirror the core web-app functionality (start/stop timer, log manual entries, edit/delete, list today's entries). Do *not* re-implement reports, admin, invoicing — those stay on the web.

**Target user:** DevCore employees on Windows who log billable hours daily. The signed-in developer (the primary user right now) is `simon.stancovich@devcore.se` / username `stsim` / `_user_id=187`; the app works for any DevCore account.

---

## 2. Stack

| Layer       | Tech                               | Version |
|-------------|------------------------------------|---------|
| Shell       | Electron                           | 28      |
| UI          | React + TypeScript                 | 18 / 5  |
| Bundler     | Vite                               | 5       |
| Local store | electron-store                     | 8       |
| Packager    | electron-builder (NSIS, Windows)   | 24      |
| Dev runner  | concurrently + wait-on             | —       |

No testing framework is wired up yet. No state library — React hooks only.

---

## 3. Repository layout

```
timetracker-sidebar/
├── main.js                    # Electron main process (window, tray, IPC, auth, API transport)
├── preload.js                 # contextBridge — exposes window.electronAPI to renderer
├── index.html                 # Vite entry; CSP allows ws://localhost:* in dev
├── vite.config.ts             # React plugin; server.port=5180, strictPort
├── package.json               # scripts: dev / build; electron-builder config at bottom
├── assets/
│   └── tray-icon.png          # 16×16 placeholder; main.js falls back to empty image
├── scripts/
│   └── gen-tray-icon.js       # Generates the placeholder tray icon
├── src/
│   ├── main.tsx               # React entry
│   ├── App.tsx                # Monolithic UI (~985 lines — split pending, BUGS #19)
│   ├── App.css                # Global styles
│   ├── api.ts                 # Typed API client — all calls go through electronAPI.apiCall
│   ├── electron.d.ts          # Type declarations for window.electronAPI
│   └── components/
│       ├── Combobox.tsx       # Typeahead client/project picker (655 companies)
│       ├── Timer.tsx          # Orphaned — logic lives in App.tsx (BUGS #20)
│       ├── NewEntryForm.tsx   # Orphaned — same
│       ├── EntryList.tsx      # Orphaned — same
│       └── LoginScreen.tsx    # Sign-in CTA shown when unauthenticated
├── README.md                  # Setup + dev + API table
├── BUGS.md                    # Severity-tagged bug/improvement log with statuses
└── ARCHITECTURE.md            # This file
```

---

## 4. Auth

### The constraint
The server is a **CodeIgniter PHP app** using **cookie sessions** (`ci_session`), **not OAuth**. The session cookie is:
- **HMAC-signed** — cannot be forged.
- **IP-locked** — the cookie payload stores `ip_address` and the server rejects the cookie if the requester's IP differs. This means **a session cannot be "exported"** from a separate browser. The app itself must be the party that logs in.

### The flow
1. On startup, `main.js` calls `probeAuthenticated()` — POSTs `c=time&m=load` with today's date. If the response is valid JSON with `rows`, the session is live.
2. If not authenticated, the renderer shows `LoginScreen.tsx` with a "Sign in" button that invokes `electronAPI.openAuth()`.
3. `createAuthWindow()` opens a real `BrowserWindow` pointed at `https://timetracker.devcore.se`. **Crucially, this window uses the same session partition** (`session.fromPartition('persist:timetracker')`) — so cookies set during login are immediately available to the main window's API calls.
4. Login detection uses multiple signals because CodeIgniter sets `ci_session` for anonymous visitors too and not every login flow triggers a top-level `did-navigate`:
   - `did-navigate`, `did-navigate-in-page`, `did-finish-load` events
   - A 2-second polling interval calling `probeAuthenticated()`
   - First successful probe closes the auth window and emits `auth-success` to the renderer.

### Session partition
- Name: `persist:timetracker`
- Set on both the main window and the auth window's `webPreferences.session`.
- Also passed as `session:` to every `net.request` in `main.js` with `useSessionCookies: true`.
- Survives app restarts because the `persist:` prefix tells Electron to disk-persist.

### Sign-out
`signOut()` calls `clearStorageData()` on the partition and deletes `loggedIn` from electron-store; renderer receives `signed-out` and returns to `LoginScreen`.

---

## 5. API

### Transport
**All API calls go through the main process via IPC.** The `api-call` IPC handler in `main.js` wraps Electron's `net.request`. The renderer never touches the network directly.

**Why:** In dev the renderer runs at `http://localhost:5180`, but the API is `https://timetracker.devcore.se`. The server sends no `Access-Control-Allow-*` headers, so a direct renderer `fetch` hits CORS. Routing through `net.request` in the main process:
- Bypasses CORS entirely (CORS is a browser concept; `net.request` isn't a browser).
- Attaches session cookies automatically via `useSessionCookies: true` + the `persist:timetracker` partition.
- Allows us to centralize error handling and BOM stripping.

### Request shape
```
POST https://timetracker.devcore.se/index.php?c={controller}&m={method}[&extra=query]
Content-Type: application/x-www-form-urlencoded
X-Requested-With: XMLHttpRequest
Cookie: ci_session=... (attached automatically from the partition)

Body: URL-encoded form data (or empty for endpoints that take no args)
```

Both headers are required. Omitting `X-Requested-With` makes some endpoints return HTML login pages instead of JSON.

### Response quirks
1. **UTF-8 BOM.** The PHP server prepends `U+FEFF` to JSON responses. Always strip with `.replace(/^\uFEFF/, '')` before `JSON.parse`. `main.js` does this; any new parser must too.
2. **Non-JSON 2xx.** Some endpoints return plain `OK` or empty bodies. `main.js` treats these as `{ success: true, raw: <text> }`.
3. **Redirects = not logged in.** A 3xx response means the server is trying to send us to `/login`. `main.js` returns `{ error: 'not_authenticated' }` without following.
4. **HTML on 5xx.** `main.js` strips tags and truncates to a 120-char snippet for the user-facing toast (see BUGS #15).

### Endpoints

| Purpose          | `c`         | `m`        | Query params                    | Body                                                     |
|------------------|-------------|------------|---------------------------------|----------------------------------------------------------|
| Load day entries | `time`      | `load`     | —                               | `date=YYYY-MM-DD`                                        |
| Save / update    | `time`      | `save`     | —                               | full `SaveEntryPayload` (see below). `id=-1` = new.      |
| Delete           | `time`      | `delete`   | —                               | `id=<id>`                                                |
| List companies   | `companies` | `loadList` | `active=true&has_projects=true` | empty (655 companies returned)                           |
| List projects    | `projects`  | `load`     | `active=true`                   | `_company_id=<id>` — **must be in body, not query**      |
| List users       | `user`      | `load`     | —                               | empty (returns *all* users incl. plaintext `password`)   |

### `SaveEntryPayload` — all fields required even if the server could infer some

```ts
{
  id: string              // '-1' for a new entry
  company: string         // display name
  project: string         // display name
  description: string
  internal_description: string
  hour: string            // decimal hours, e.g. '1.25'
  invoice_hours: string   // usually same as `hour`
  invoice: string         // '1' or 'false' (see BUGS #6)
  no_flex: string         // '0' default
  username: string        // e.g. 'stsim'
  _user_id: string        // numeric id as string
  _company_id: string
  _project_id: string
  hour_price: string      // from the project record
  task_date: string       // 'YYYY-MM-DD'
}
```

### Current-user resolution
There is **no per-user endpoint** (`probe-user` IPC scanned a dozen candidates — all 404 or return the full user list). Strategy:
1. Load today's time entries.
2. If any row exists, grab its `_user_id`.
3. Resolve against `user.load` → cache the user record (sans password) in electron-store under `currentUser`.
4. If the account has never logged an entry, fall back to the hardcoded Simon placeholder.

`loadUsers()` in `api.ts` explicitly strips the plaintext `password` field before returning rows — we never log or persist it.

---

## 6. Windows, modes & input

### Size modes
The main window has three modes; the enum-like argument to `setWindowSize(size)` is `'full' | 'pill' | 'square'`.

| Mode   | Size             | Position                    | Purpose                                 |
|--------|------------------|-----------------------------|-----------------------------------------|
| full   | 380 × workArea.h | right edge, y=0             | Primary UI                              |
| pill   | 360 × 68         | top-right with 12 px margin | Compact read-only status when blurred   |
| square | 72 × 72          | top-right with 12 px margin | Minimal — "just show me the timer"      |

### Main-window flags
```js
frame: false, resizable: false, alwaysOnTop: true, skipTaskbar: true
```
`resizable: false` blocks programmatic `setBounds` on some Windows builds, so `setWindowSize` temporarily flips it to `true`, sets bounds, flips back.

### Blur behavior
`mainWindow.on('blur')` auto-collapses full → pill (BUGS #35). Suppressed when:
- DevTools is focused (`webContents.isDevToolsFocused()`).
- Within 2.5 s of a display-metrics change (monitor swap / Win+P revokes focus transiently).
- Already in pill or square mode.

### Display changes
`screen.on('display-metrics-changed' | 'display-added' | 'display-removed')` → reposition on the current primary display at the correct mode. Sets `displayChangeSilenceUntil = now + 2500` to suppress the blur handler during the swap.

### Global hotkey
`Ctrl+Shift+T` registered via `globalShortcut`. Toggles full ↔ pill from anywhere on the system. Unregistered on `will-quit`.

### Single-instance lock
`app.requestSingleInstanceLock()` — a second launch exits immediately and signals the first instance to restore and focus.

### Tray
`Tray` with `assets/tray-icon.png` (falls back to empty image if missing so the app still boots). Menu: **Show / Hide / Sign out / Quit**. Left-click toggles show/hide.

### Views (inside the full-mode window)
Bottom nav with three tabs:
- **⏱ Timer** — live timer, start/stop/resume, crash-safe draft upserts every 5 min (BUGS #37).
- **+ Log** — manual entry form (prefilled when double-clicking an existing entry — BUGS #12).
- **📋 Today** — today's entries; double-click to edit.

Header: user name | date navigator | total hours (green).

---

## 7. Persistent state (electron-store keys)

| Key              | Type       | Set by                | Meaning                                                        |
|------------------|------------|-----------------------|----------------------------------------------------------------|
| `loggedIn`       | boolean    | main.js auth flow     | Flips to `true` on first successful auth probe.                |
| `currentUser`    | object     | renderer resolution   | Cached `{id, username, name, email}`.                          |
| `tSec`           | number     | renderer timer state  | Seconds elapsed in the current running timer.                  |
| `tRun`           | boolean    | renderer timer state  | Is the timer currently running?                                |
| `tCo`/`tPr`      | string     | renderer timer state  | Selected company/project IDs for the running timer.            |
| `tD`/`tNote`/`tInv` | string  | renderer timer state  | Description, internal notes, invoice flag for running timer.   |
| `startedAt`      | ISO string | renderer timer state  | Timer start wall-clock — on reload, `tSec` = now − startedAt.  |
| `draftId`        | string     | renderer timer state  | Server id of the current draft (upserted every 5 min).         |
| `streak`         | number     | renderer              | Daily logging streak (BUGS #2).                                |
| `lastLoggedDate` | YYYY-MM-DD | renderer              | For streak maintenance.                                        |

Renderer reads/writes via `electronAPI.storeGet` / `storeSet` (IPC).

---

## 8. Dev workflow

### Start
```bash
npm install
npm run dev
```
Runs `concurrently` with two commands: `vite` and `wait-on http://localhost:5180 && electron .`. Vite is `strictPort: true` — if 5180 is occupied it errors out rather than falling back.

### Dev-mode detection
Use `!app.isPackaged` in main-process code. The dev script does **not** set `NODE_ENV=development`, so don't rely on that.

### DevTools
Opened automatically in detached mode in dev.

### Recovering from a stuck port
Orphan `node.exe` from a prior crashed run can hold `:5180`. Find and free:
```bash
netstat -ano | grep ":5180 "
powershell -NoProfile -Command "Stop-Process -Id <PID> -Force"
```
Note: Windows `taskkill //F //PID` sometimes hangs in this environment — prefer `Stop-Process`.

### Hot reload
Vite HMR works for React. Changes to `main.js` / `preload.js` require a full restart (`Ctrl+C`, `npm run dev`).

---

## 9. Build & packaging

```bash
npm run build
```
Runs `vite build` → static assets in `dist/`, then `electron-builder` → Windows NSIS installer.

Config (package.json `build`):
- `appId`: `se.devcore.timetracker`
- `productName`: `DevCore TimeTracker`
- `win.target`: `nsis`

`vite.config.ts` uses `base: './'` so the same `dist/` can be loaded by Electron (`file://`) or, in theory, hosted at `timetracker.devcore.se/sidebar/` for a web build (see BUGS #39 — parallel web build plan).

---

## 10. Known constraints & gotchas (one-liners)

- **BOM on every JSON response** — strip or parsing fails silently.
- **IP-locked session** — can't share cookies across machines / VPN switches. A VPN that changes your IP will invalidate the session.
- **`X-Requested-With` required** — else some endpoints 200 with HTML.
- **`_company_id` goes in body, not query**, for the projects endpoint. The other endpoints that take an id put it in the body too; query params are reserved for `active`/`has_projects` style flags.
- **`time.save` is create-or-update** — `id=-1` creates, anything else updates in place. We exploit this for the crash-safe draft pattern.
- **User-list endpoint leaks plaintext passwords** — `api.ts::loadUsers` strips that field; never add logging that dumps the raw response.
- **`resizable: false` blocks programmatic resize** on some Windows builds — `setWindowSize` toggles it.
- **`window-all-closed`** is a no-op (app stays in tray); this means the tray must be able to re-create the window (partly wired — BUGS #33).
- **Hardcoded Simon fallback** in `NewEntryForm.tsx` (orphan file) and App.tsx — only used if the account has never logged an entry.
- **App.tsx is ~985 lines** — split into per-view components is queued (BUGS #19).

---

## 11. Git

- Default branch: `master`
- Remote: `origin` → `https://github.com/simonstancovich/timetracker-sidebar` (private, GitHub account `simonstancovich`).
- `.gitignore` excludes `node_modules/`, `dist/`, `dist-electron/`, `out/`, `.vite/`, `*.log`, `.env*`.
- Commits are signed with `Co-Authored-By: Claude Opus 4.6 (1M context)` trailer when Claude wrote them.

---

## 12. What's next (pointer to BUGS.md)

All open work — P0 through P2 — lives in `BUGS.md` with status, severity, and implementation notes on every fixed item. Before starting work, read that file.
