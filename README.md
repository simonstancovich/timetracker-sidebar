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

Opens Vite on :5173 + Electron pointing at it. Hot reload works.

## Build

```bash
npm run build
```

Produces a Windows installer in `dist/`.

## First run

On first launch, the sidebar appears docked to the right edge. Click **Sign in** — a browser window opens pointing at timetracker.devcore.se. Log in normally. The session persists across restarts (stored in Electron's persistent session partition).

## Notes

- Tray icon lives in `assets/tray-icon.png` — replace with a 16x16 or 32x32 PNG
- User ID `187` and username `Simon Stancovich` are currently hardcoded in `NewEntryForm.tsx`. These can be read dynamically from the `ci_session` cookie after login if needed.
- The app uses `session.fromPartition('persist:timetracker')` — cookies survive restarts automatically
- IP validation on the server means API calls must come from the same IP as the browser login. Since Electron uses the machine's actual IP this is fine.

## API endpoints used

| Action | Endpoint |
|---|---|
| Load entries | `POST /index.php?c=time&m=load` |
| Save entry | `POST /index.php?c=time&m=save` |
| Delete entry | `POST /index.php?c=time&m=delete` |
| List companies | `POST /index.php?c=companies&m=loadList&active=true&has_projects=true` |
| List projects | `POST /index.php?c=projects&m=load&active=true` + body `_company_id=X` |
