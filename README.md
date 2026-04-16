# DevCore TimeTracker Sidebar

Windows sidebar app for logging time to timetracker.devcore.se.

## Setup

```bash
npm install
```

## Dev

```bash
npm run dev
```

Opens Vite on **:5180** (`strictPort`) + Electron pointing at it via `concurrently` + `wait-on`. Hot reload works.

If Vite fails with `Port 5180 is already in use`, an orphan `node.exe` is holding it. Find the PID with `netstat -ano | grep ":5180 "` and kill it via PowerShell `Stop-Process -Id <pid> -Force` (Windows `taskkill` can hang).

## Build

```bash
npm run build
```

Produces a Windows installer in `dist/`.

## First run

On first launch, the sidebar appears docked to the right edge. Click **Sign in** — a browser window opens pointing at timetracker.devcore.se. Log in normally. The session persists across restarts (stored in Electron's persistent session partition).

## Architecture notes

- **Session:** `session.fromPartition('persist:timetracker')` — cookies survive restarts. CodeIgniter `ci_session` is IP-locked (HMAC-signed, stores `ip_address`), so API calls must come from the same IP as the browser login. Electron uses the machine IP → fine.
- **API transport:** all requests go through the `api-call` IPC handler in `main.js`, which uses Electron's `net.request` with `useSessionCookies: true` against the persistent partition. This bypasses the CORS that blocks direct renderer fetches in dev (renderer at `http://localhost:5180` → API at `https://timetracker.devcore.se` sends no `Access-Control-Allow-*`).
- **BOM gotcha:** the PHP server prepends a UTF-8 BOM (U+FEFF) to JSON responses. `src/api.ts` strips it with `text.replace(/^\uFEFF/, '')` before `JSON.parse` — do the same for any new response-parsing code.
- **Current user:** no per-user endpoint exists; the user is inferred from any `time.load` row's `_user_id`, resolved against `c=user&m=load`, and cached in electron-store as `currentUser`. The user-list response contains plaintext passwords — `api.ts` strips them before caching.
- **Tray icon:** `assets/tray-icon.png` (16×16 placeholder). `main.js` falls back to `nativeImage.createEmpty()` if absent so the app still boots.

## API endpoints used

| Action | Endpoint |
|---|---|
| Load entries | `POST /index.php?c=time&m=load` |
| Save entry | `POST /index.php?c=time&m=save` |
| Delete entry | `POST /index.php?c=time&m=delete` |
| List companies | `POST /index.php?c=companies&m=loadList&active=true&has_projects=true` |
| List projects | `POST /index.php?c=projects&m=load&active=true` + body `_company_id=X` |
