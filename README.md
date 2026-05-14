# CivicReport

A full-stack web app for citizens to report civic issues (potholes, broken lights, waste, etc.) and track their resolution in real time.

---

## Project Structure

```
CivicReport/
├── artifacts/
│   ├── api-server/        # BACKEND — Express.js REST API
│   └── civicreport/       # FRONTEND — React + Vite
├── lib/
│   ├── db/                # Database schema & Drizzle ORM config
│   ├── api-spec/          # OpenAPI spec (shared between frontend & backend)
│   ├── api-client-react/  # Auto-generated React Query API client
│   └── api-zod/           # Zod validation schemas
├── package.json           # Monorepo root (pnpm workspaces)
└── pnpm-workspace.yaml
```

---

## Backend — `artifacts/api-server/`

**Stack:** Node.js · Express · TypeScript · Drizzle ORM · PostgreSQL

| Path | Purpose |
|------|---------|
| `src/index.ts` | Entry point, seeds the DB on startup |
| `src/app.ts` | Express app setup, middleware |
| `src/routes/` | Route handlers: auth, issues, stats, notifications, officials |
| `src/lib/auth.ts` | Session-based authentication |
| `src/lib/store.ts` | DB query helpers |

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register citizen or government official |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/issues` | List all issues |
| POST | `/api/issues` | Create a new issue |
| GET | `/api/issues/:id` | Get a single issue |
| PATCH | `/api/issues/:id/status` | Update issue status (officials only) |
| POST | `/api/issues/:id/confirm` | Confirm an existing issue |
| POST | `/api/issues/:id/comments` | Add a comment |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/officials` | List government officials |

---

## Frontend — `artifacts/civicreport/`

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Root component, routing |
| `src/pages/Landing.tsx` | Public landing page |
| `src/pages/citizen/` | Citizen dashboard, report form, issue detail |
| `src/pages/gov/` | Government official dashboard |
| `src/components/ui/` | shadcn/ui component library |
| `src/components/layout/` | Navbar, layout wrappers |

The frontend proxies all `/api/*` requests to the backend (configured in `vite.config.ts`).

---

## Database — `lib/db/`

**ORM:** Drizzle · **Database:** PostgreSQL

Tables: `citizens` · `issues` · `issue_confirmations` · `issue_subscribers` · `comments` · `comment_upvotes` · `notifications`

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/civicreport"

# 3. Push DB schema
pnpm --filter @workspace/db run push

# 4. Start backend (runs on port 8080)
pnpm --filter @workspace/api-server run dev

# 5. Start frontend (runs on port 5173)
pnpm --filter @workspace/civicreport run dev
```

Then open `http://localhost:5173` in your browser.

---

## Features

- Citizen registration and login
- Report civic issues with title, description, category, and location
- Confirm other citizens' reports
- Real-time status updates via SSE
- Comment on issues
- Government official dashboard to manage and resolve issues
- Dashboard statistics and issue heatmap
- Notification system
