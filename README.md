# DevPulse Frontend

Web UI for **DevPulse** — submit a public GitHub repo URL, watch the audit progress in real time, and view the report (health score, summary, and findings by category).

## Features

- **Landing page**: Enter a GitHub repository URL and start an audit
- **Report page**: Live progress via Server-Sent Events; then full report with health score, summary, and findings (with severity badges and affected files)
- **Routing**: React Router — `/` (home), `/report/:id` (report view)
- **Styling**: Tailwind CSS; responsive layout

## Tech Stack

- **React** 18
- **Vite** (build and dev server)
- **React Router** 6
- **Tailwind CSS** (PostCSS)
- **Firebase** (client SDK; optional for future auth or Firestore reads from client)

## Prerequisites

- **Node.js** 18+ (recommend 20+)
- **DevPulse backend** running (default: `http://localhost:3001`) for `/api` proxy and audit submission

## Environment Variables

Create a `.env` file in the project root (see `.env.example`). All client-side env vars must be prefixed with `VITE_`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend base URL (default: `http://localhost:3001`). Used for API requests; dev server also proxies `/api` to this target. |
| `VITE_FIREBASE_*` | Optional | Firebase client config (e.g. `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`) if you use Firebase in the client. |

**Security**: Do not put secrets in `VITE_*` variables — they are embedded in the client bundle.

## Installation

```bash
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (default: http://localhost:5173) with `/api` proxied to backend |
| `npm run build` | Production build (output in `dist/`) |
| `npm run preview` | Serve the production build locally |

## Project Structure

```
src/
├── main.jsx           # React root, BrowserRouter, routes
├── index.css          # Global/Tailwind styles
├── lib/
│   └── firebase.js    # Firebase client init (if used)
├── pages/
│   ├── Home.jsx       # Landing: repo URL input, submit, navigate to report
│   └── Report.jsx     # Report: SSE progress, then report view
└── components/
    ├── AuditStream.jsx     # SSE connection and progress UI
    ├── HealthScore.jsx     # Health score display
    ├── ReportCard.jsx      # Single finding card (title, severity, file, snippet, affected files)
    ├── SeverityBadge.jsx   # Severity pill (critical/high/medium/low/info)
    ├── LandingBackground.jsx
    └── Logo.jsx

public/
└── favicon.svg
```

## Development

1. Start the **backend** (e.g. `cd ../backend && npm run dev`).
2. Start the frontend: `npm run dev`.
3. Open http://localhost:5173, enter a public GitHub repo URL (e.g. `https://github.com/owner/repo`), submit, and open the report page when redirected.

The Vite config proxies `/api` to `VITE_API_URL` (or `http://localhost:3001`) so the same origin is used for API calls during development.

## Build and Deploy

- Run `npm run build` and deploy the `dist/` folder to any static host.
- Set `VITE_API_URL` at build time to your backend URL so the client talks to the correct API in production.

## License

Private / see repository settings.
