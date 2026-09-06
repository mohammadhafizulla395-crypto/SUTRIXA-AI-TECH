# SUTRIXA AI — Deployment Guide

Monorepo layout:

```
<repo root>
├── backend/     → Render (Node.js + Express + TypeScript)
├── frontend/    → Vercel (Next.js + TypeScript)
├── content/products/products.json → committed to Git; source of truth
└── DEPLOYMENT.md
```

Architecture: no database. Persistence is the GitHub Contents API writing
`content/products/products.json`. Local JSON is a development fallback only.

---

## 1. Backend — Render

Root Directory: `backend`

- Build Command: `npm run build` (compiles `src/` → `dist/` via `tsc`)
- Start Command: `npm start` (runs `node dist/index.js`)
- Health Check Path: `/api/health` (returns HTTP 200)

### Environment variables (Render — backend ONLY, never in the frontend)

| Name                  | Required | Purpose |
| --------------------- | -------- | ------- |
| `PORT`                | no*      | server port (*Render injects its own) |
| `ADMIN_EMAIL`         | yes      | admin login email (username) |
| `ADMIN_PASSWORD`      | yes      | admin login password |
| `JWT_SECRET`          | yes      | JSON Web Token signing secret (final admin session) |
| `ADMIN_OWNER_SECRET_HASH` | yes  | bcrypt hash of the private owner verification secret (Step 2) |
| `GITHUB_TOKEN`        | yes      | GitHub token for the repo (see GitHub token section) |
| `GITHUB_OWNER`        | yes      | GitHub username / org owning the repository |
| `GITHUB_REPO`         | yes      | repository name (e.g. sutrixa-tech-website) |
| `GITHUB_BRANCH`       | yes      | branch holding `content/products/products.json` (e.g. main) |
| `ALLOWED_ORIGINS`     | yes      | comma-separated allowed CORS origins, e.g. `https://YOUR-VERCEL-DOMAIN` (add `http://localhost:3000` only if still needed for local testing) |

Set only real browser origins. Never use `*`.

### Admin authentication (two-step)

1. Step 1 — `POST /api/admin/login` with `ADMIN_EMAIL` + `ADMIN_PASSWORD`. Returns a
   short-lived, single-use owner-verification token only (never a session JWT).
2. Step 2 — `POST /api/admin/verify-owner` with that token + the private owner
   secret. The secret is checked against `ADMIN_OWNER_SECRET_HASH` (bcrypt).
3. Only then is the final admin JWT issued. All admin APIs reject requests that
   only hold a Step-1 verification token.

`ADMIN_OWNER_SECRET_HASH` is produced from a secret of your choice:

```
cd backend
$env:OWNER_SECRET_INPUT = "YOUR-PRIVATE-OWNER-SECRET"   # PowerShell
npm run hash-secret
```

Paste the printed bcrypt hash into the environment as `ADMIN_OWNER_SECRET_HASH`.
Never store the plaintext secret or its hash in the frontend, source code, or Git.

### Fail-safe behavior

- If `ADMIN_EMAIL`, `ADMIN_PASSWORD`, or `JWT_SECRET` are missing, Step 1 returns
  HTTP 503 ("Admin authentication is not configured"). No fallback development
  credentials exist.
- If `ADMIN_OWNER_SECRET_HASH` is missing, Step 2 returns HTTP 503 and no admin
  session can be created.
- If `ALLOWED_ORIGINS` is missing, browser cross-origin requests are denied.
  Server-to-server / health-check requests (no `Origin` header) still work.

---

## 2. Frontend — Vercel

Root Directory: `frontend`

- Build Command: `npm run build` (existing `next build --webpack`)
- Framework preset: Next.js

### Environment variables (Vercel — frontend ONLY)

| Name                  | Required | Purpose |
| --------------------- | -------- | ------- |
| `NEXT_PUBLIC_API_URL` | yes      | public backend URL, e.g. `https://YOUR-RENDER-BACKEND.onrender.com` |

`NEXT_PUBLIC_API_URL` is required at build time. The frontend throws a clear
error if it is missing (no silent `localhost` fallback). Do not put backend
secrets in Vercel; only `NEXT_PUBLIC_API_URL` belongs there.

---

## 3. GitHub persistence

- `content/products/products.json` must be committed to Git. This is the
  baseline start-of-truth the backend reads and updates.
- The backend reads/writes that exact path via the GitHub REST Contents API
  when `GITHUB_TOKEN`/`GITHUB_OWNER`/`GITHUB_REPO` are set.
- Update flow: admin change → backend → GitHub Contents API
  (`PUT /repos/{owner}/{repo}/contents/content/products/products.json`) →
  committed on `GITHUB_BRANCH` → future reads return persisted data.
- If `GITHUB_*` are missing, the backend falls back to the local JSON file.
  This is for local development only. Production requires GitHub configured.

### GitHub token (Contents permission)

The backend only uses the GitHub **Contents API** (`GET`/`PUT` a single JSON
file). Use a fine-grained or classic token scoped to that repository with:

- Contents: **Read and write**

Store it ONLY in the Render environment as `GITHUB_TOKEN`. Never in the
frontend, source code, README, or Git history.

---

## 4. Git hygiene

`.gitignore` at the repo root protects:

```
.env
.env.*
.env.local
.env.production
node_modules/
dist/
.next/
*.log
```

Never commit real secret VALUES anywhere (environment files, README,
DEPLOYMENT.md, JSON, or commit messages — names only).

---

## 5. Local development reference

- Backend: `backend/.env` (gitignored) + `npm run dev`
- Frontend: `frontend/.env.local` (gitignored) with
  `NEXT_PUBLIC_API_URL=http://localhost:4000` + `npm run dev`
- Public API only serves products with status `published`. Drafts and archived
  products are never exposed publicly. Admin mutations require a valid JWT.