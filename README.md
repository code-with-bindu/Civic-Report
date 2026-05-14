# CivicReport

A full-stack civic issue reporting platform that bridges the gap between citizens and government officials — enabling communities to report, track, and resolve local problems transparently.

---

## Problem Statement

Citizens across cities face daily inconveniences — potholes, broken streetlights, garbage overflow, damaged public infrastructure — but have no effective channel to report these issues and track whether they are being resolved. Government departments often lack visibility into ground-level problems, leading to delays, duplicated complaints, and zero accountability.

There is no single platform where:
- Citizens can report issues with location and proof
- Communities can validate and upvote real problems
- Government officials can manage, prioritize, and resolve issues
- Everyone can track progress in real time

---

## Solution

**CivicReport** is a two-sided web platform connecting citizens and government officials:

- **Citizens** report civic issues with title, description, category, location (map pin), photo, and urgency level. They can also confirm issues reported by others, comment on them, and receive real-time updates when the status changes.
- **Government Officials** log in to a dedicated dashboard, see all issues in their constituency, update statuses (Pending → In Progress → Resolved/Rejected), and post official notes visible to the public.
- The platform features a **public heatmap** showing issue density by location, a **trust/reputation system** for citizens, and **live notifications** via Server-Sent Events.

---

## Website Layout

```
/                    → Public landing page (live stats, how it works, CTA)
/heatmap             → Public issue heatmap (geographic view)
/citizen/auth        → Citizen login / register
/citizen/dashboard   → Citizen feed (local issues, filters, report button)
/citizen/issues/new  → Report a new civic issue (form + map)
/citizen/issues/:id  → Issue detail (timeline, comments, confirmations)
/citizen/notifications → Real-time notifications for the citizen
/gov/login           → Government official login
/gov/dashboard       → Official dashboard (manage issues, area stats)
```

---

## Features & Functionalities

### Citizen Features
| Feature | Description |
|---|---|
| Register / Login | Create an account or log in as a citizen or guest |
| Report an Issue | Submit a civic issue with title, description, category, address, map location, photo URL, and urgency flag |
| Anonymous Reporting | Option to report without revealing identity |
| Confirm Issues | Upvote/confirm issues reported by others — increases authenticity score |
| Comment on Issues | Discuss issues with other citizens and officials |
| Upvote Comments | Mark helpful comments |
| Subscribe to Issues | Follow an issue and get notified on status changes |
| Real-time Notifications | Instant bell notifications via SSE when issue status updates or new comments arrive |
| Reputation System | Citizens earn reputation points for confirmed reports |
| Issue Timeline | Full history of status changes visible on each issue |

### Government Official Features
| Feature | Description |
|---|---|
| Official Login | Dedicated login for verified government officials |
| Constituency Dashboard | View all issues filed in their assigned area |
| Status Management | Update issue status: Pending → In Progress → Resolved / Rejected |
| Add Official Notes | Post structured notes on issues visible to citizens |
| Area Statistics | View open, in-progress, and resolved counts for their constituency |

### Public Features
| Feature | Description |
|---|---|
| Landing Page Stats | Live counts of total issues, resolved, and active reporters |
| Issue Heatmap | Geographic map showing issue density across the city |
| Public Issue Feed | Browse reported issues without logging in |

---

## Tech Stack

### Frontend — `frontend/`
| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| TypeScript | Type-safe JavaScript |
| Vite 7 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first CSS framework |
| shadcn/ui + Radix UI | Accessible UI component library |
| React Query (TanStack) | Server-state management and data fetching |
| Wouter | Lightweight client-side routing |
| React Leaflet | Interactive map for issue location and heatmap |
| Framer Motion | Animations and transitions |
| React Hook Form + Zod | Form handling and validation |
| Sonner | Toast notifications |
| Recharts | Charts and statistics visualization |
| Lucide React | Icon library |

### Backend — `backend/`
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and REST API |
| TypeScript | Type-safe server code |
| Drizzle ORM | Type-safe database query builder |
| JWT (jose) | Stateless authentication tokens |
| Pino | Structured JSON logging |
| SSE (Server-Sent Events) | Real-time push notifications to clients |
| esbuild | Fast bundler for production builds |
| cors | Cross-origin request handling |

### Database — `database/`
| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Drizzle ORM | Schema definition and migrations |

#### Database Tables
| Table | Purpose |
|---|---|
| `citizens` | User accounts, email, password hash, reputation score |
| `issues` | Core issue data — title, description, category, location, status, timeline |
| `issue_confirmations` | Tracks which user confirmed which issue (crowdsourced validation) |
| `issue_subscribers` | Users subscribed to follow specific issues |
| `comments` | Discussion threads on issues (with author role: citizen / official) |
| `comment_upvotes` | Upvotes on individual comments |
| `notifications` | Per-user notification log (issue updates, comments) |

### Shared Libraries — `lib/`
| Package | Purpose |
|---|---|
| `lib/api-spec/` | OpenAPI 3.1 YAML spec — single source of truth for the API contract |
| `lib/api-client-react/` | Auto-generated React Query hooks from the OpenAPI spec (via Orval) |
| `lib/api-zod/` | Auto-generated Zod validation schemas from the OpenAPI spec |

### Tooling & Infrastructure
| Tool | Purpose |
|---|---|
| pnpm Workspaces | Monorepo package management |
| Orval | Code generation from OpenAPI spec |
| Drizzle Kit | Database schema migrations and push |
| ESLint / Prettier | Code quality and formatting |

---

## Project Structure

```
CivicReport/
├── frontend/              # React + Vite web app (port 5000)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   ├── citizen/   # Auth, Dashboard, NewIssue, IssueDetail, Notifications
│   │   │   └── gov/       # Login, Dashboard
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui component library
│   │   │   └── layout/    # Navbar, Layout wrapper
│   │   └── hooks/         # use-notification-stream (SSE)
│   └── vite.config.ts
│
├── backend/               # Express REST API (port 8080)
│   ├── src/
│   │   ├── routes/        # auth, issues, stats, notifications, officials
│   │   └── lib/           # auth (JWT), store (DB queries), SSE, logger
│   └── build.mjs
│
├── database/              # Drizzle ORM schema + config
│   └── src/schema/index.ts
│
├── lib/
│   ├── api-spec/          # openapi.yaml — API contract
│   ├── api-client-react/  # Auto-generated React Query hooks
│   └── api-zod/           # Auto-generated Zod schemas
│
├── scripts/               # Workspace utility scripts
├── start.sh               # Dev startup script (runs both backend + frontend)
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (or use Replit's built-in DB)

### Setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Set the database connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/civicreport"

# 3. Push the database schema
cd database && npx drizzle-kit push

# 4. Start everything (backend on :8080, frontend on :5000)
bash start.sh
```

Then open `http://localhost:5000` in your browser.

### Run individually

```bash
# Backend only (port 8080)
cd backend && PORT=8080 pnpm run dev

# Frontend only (port 5000, proxies /api to :8080)
cd frontend && PORT=5000 API_PORT=8080 pnpm run dev
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/citizen/register` | Register a new citizen |
| POST | `/api/auth/citizen/login` | Citizen login |
| POST | `/api/auth/citizen/guest` | Guest login |
| POST | `/api/auth/government/login` | Government official login |
| GET | `/api/issues` | List all issues (filterable) |
| POST | `/api/issues` | Create a new issue |
| GET | `/api/issues/:id` | Get a single issue with timeline |
| PATCH | `/api/issues/:id/status` | Update issue status (officials only) |
| POST | `/api/issues/:id/confirm` | Confirm/upvote an issue |
| POST | `/api/issues/:id/comments` | Add a comment |
| GET | `/api/stats/public` | Public dashboard stats |
| GET | `/api/stats/government` | Government dashboard stats |
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/officials` | List government officials |
| GET | `/api/healthz` | Health check |

---

## License

MIT
