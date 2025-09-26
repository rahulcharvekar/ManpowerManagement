# Manpower Management Frontend

React + Vite single-page app for searching MT940, MT942, and ISO 20022 CAMT.052 / CAMT.053 statements via the FastAPI backend.

## Prerequisites

- Node.js 18+ (LTS recommended)
- Backend API running locally (default `http://localhost:8000`)

## Getting started

```bash
cd Frontend
npm install
npm run dev
```

Open the printed URL (typically `http://localhost:5173`). The app defaults to the backend at `http://localhost:8000`.

To point at a different backend, create a `.env` file in the `Frontend` directory with either variable (both supported for compatibility):

```
VITE_API_URL=https://statement-processor.internal.delightfulsand-562b205d.westus2.azurecontainerapps.io/
# or the legacy name
VITE_API_BASE_URL=https://statement-processor.internal.delightfulsand-562b205d.westus2.azurecontainerapps.io/
```

Restart `npm run dev` after changing environment variables. A ready-to-copy example lives in `Frontend/.env.example`.

When deploying to GitHub Pages, the build output must be served from `/ManpowerManagement/`. The Vite config sets this automatically on GitHub Actions (via `GITHUB_ACTIONS=true`). To test locally with the same base path, run:

```bash
VITE_BASE_PATH=/ManpowerManagement/ npm run build
```

## Available scripts

- `npm run dev` – start local dev server with hot reload.
- `npm run build` – create production build.
- `npm run preview` – serve the production build locally.
- `npm run typecheck` – verify TypeScript types without emitting output.

## Features

- Switch between MT940, MT942, CAMT.052, and CAMT.053 statement formats.
- Paste raw statement content or upload a file for server-side parsing.
- Configure match limit, case-sensitivity, and search scope (all fields vs. bank reference only).
- Tabular results with optional currency column and summary metrics.
