<div align="center">

# 🏙️ CivicReport

### *Your City. Your Voice. Your Power.*

**A full-stack civic issue reporting platform that bridges citizens and government — making urban accountability transparent, real-time, and community-driven.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📌 The Problem

Every city has broken roads, flooded streets, dead streetlights, and uncollected garbage — but citizens have **no effective channel** to report these problems and hold anyone accountable. Government departments operate in silos. Complaints go into a void. Nothing changes.

There is no single platform where:
- Citizens can report issues with **photo + GPS proof**
- Communities can **validate** each other's reports
- Government officials can **manage, prioritize, and resolve** issues
- Everyone can **track real progress** in real time

---

## ✅ The Solution

**CivicReport** is a two-sided civic platform that connects every citizen directly to their government representative — transparently, in real time.

| Who | What they can do |
|---|---|
| 🧑 **Citizens** | Report issues, upload photos, pin locations, confirm others' reports, comment, subscribe for updates |
| 🏛️ **Government Officials** | View constituency issues, update statuses, post official notes, track SLA deadlines |
| 👥 **Community** | See live issue feeds, a geographic heatmap, authenticity scores, and platform-wide stats — without logging in |

---

## ✨ Key Features

### For Citizens
| Feature | Description |
|---|---|
| 📸 **Photo + GPS Reporting** | Snap a photo, drop a pin, and file a report in under 30 seconds |
| 🔒 **Anonymous Reporting** | Report sensitive issues without revealing your identity |
| 👍 **Community Confirmation** | Confirm issues you've seen yourself — boosts the authenticity score |
| 💬 **Threaded Comments** | Discuss issues with other citizens and officials |
| 🔔 **Real-time Notifications** | Instant bell alerts via SSE when your issue moves forward |
| ⭐ **Reputation System** | Earn reputation points for every confirmed, resolved report |
| 📊 **Personal Dashboard** | See your total reports, pending/in-progress/resolved counts, and impact score |
| 🗺️ **Area Feed** | View all active issues in your state with filters by category, status, and urgency |

### For Government Officials
| Feature | Description |
|---|---|
| 🏛️ **Constituency Dashboard** | All issues filed in your assigned area, filterable and sortable |
| 🔄 **Status Management** | Move issues from Pending → Verified → In Progress → Resolved / Rejected |
| 📝 **Official Notes** | Post structured updates visible to the public |
| ⏰ **SLA Deadlines** | Set and track resolution deadlines; overdue issues are highlighted |
| 📈 **Area Analytics** | Charts for open vs. resolved by category, recent activity timeline |

### Public / Community
| Feature | Description |
|---|---|
| 🔴 **Live Stats Ticker** | Real-time counts of total reported, community-verified, and resolved issues |
| 🗺️ **Issue Heatmap** | Geographic density map — see where your city hurts most |
| 🌐 **Public Feed** | Browse community issues without an account |
| ⭐ **Reviews & Ratings** | Citizens and officials leave 1–5 star reviews about their experience |

---

## 🛠️ Tech Stack

### Frontend — `frontend/`
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | 5.x | Type-safe development |
| **Vite** | 7 | Build tool & dev server |
| **Tailwind CSS** | v4 | Utility-first styling |
| **shadcn/ui + Radix UI** | latest | Accessible component library |
| **TanStack React Query** | v5 | Server-state & data fetching |
| **Wouter** | 3.x | Lightweight client-side routing |
| **React Leaflet** | 4.x | Interactive maps & heatmap |
| **Framer Motion** | 12 | Smooth animations |
| **Lucide React** | latest | Icon library |
| **date-fns** | 4.x | Date formatting |
| **Recharts** | 2.x | Charts & statistics |

### Backend — `backend/`
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **Express** | 5 | HTTP server & REST API |
| **TypeScript** | 5.x | Type-safe server code |
| **Drizzle ORM** | 0.x | Type-safe query builder |
| **HMAC JWT** | custom | Stateless authentication |
| **Pino** | 9.x | Structured JSON logging |
| **SSE** | native | Real-time push notifications |
| **esbuild** | latest | Ultra-fast production bundler |

### Database — `database/`
| Technology | Purpose |
|---|---|
| **PostgreSQL 16** | Primary relational database |
| **Drizzle Kit** | Schema migrations & push |

### Shared Libraries — `lib/`
| Package | Purpose |
|---|---|
| `lib/api-spec/` | OpenAPI 3.1 YAML — single source of truth for the API contract |
| `lib/api-client-react/` | Auto-generated React Query hooks (via Orval) |
| `lib/api-zod/` | Auto-generated Zod validation schemas |

---

## 🗄️ Database Schema

```
citizens          → id, name, email, passwordHash, reputation, city, state
issues            → id, title, description, category, address, city, state, lat, lng,
                    photoUrl, urgent, anonymous, status, confirmations,
                    authenticityScore, reporterId, timeline, notes, createdAt
issue_confirmations → issueId, userId  (composite PK)
issue_subscribers   → issueId, userId  (composite PK)
comments          → id, issueId, authorId, authorName, authorRole, text, upvoteCount
comment_upvotes   → commentId, userId  (composite PK)
notifications     → id, userId, message, type, issueId, read, createdAt
reviews           → id, userId, userName, userRole, rating (1–5), text, createdAt
```

---

## 🗂️ Project Structure

```
CivicReport/
├── frontend/                    # React + Vite web app (port 5000)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx      # Public landing page
│   │   │   ├── Heatmap.tsx      # Geographic issue heatmap
│   │   │   ├── citizen/
│   │   │   │   ├── Auth.tsx     # Register / Login (with city & state)
│   │   │   │   ├── Dashboard.tsx # My Reports / My Area / All India
│   │   │   │   ├── NewIssue.tsx  # Report form with GPS + photo
│   │   │   │   ├── IssueDetail.tsx
│   │   │   │   └── Notifications.tsx
│   │   │   └── gov/
│   │   │       ├── Login.tsx
│   │   │       └── Dashboard.tsx
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── layout/          # Navbar, Layout
│   │   ├── lib/                 # auth helper, query client
│   │   └── hooks/               # SSE notification stream
│   └── vite.config.ts
│
├── backend/                     # Express REST API (port 8080)
│   ├── src/
│   │   ├── routes/              # auth, issues, stats, notifications,
│   │   │                        # officials, reviews
│   │   └── lib/                 # auth (HMAC JWT), store (DB), SSE, logger
│   └── build.mjs
│
├── database/                    # Drizzle ORM schema + config
│   └── src/schema/index.ts
│
├── lib/
│   ├── api-spec/                # openapi.yaml
│   ├── api-client-react/        # Generated React Query hooks
│   └── api-zod/                 # Generated Zod schemas
│
├── start.sh                     # Dev startup (backend + frontend)
└── pnpm-workspace.yaml
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** database (or use Replit's built-in DB)

### 1. Clone & Install

```bash
git clone https://github.com/code-with-bindu/Civic-Report.git
cd Civic-Report
pnpm install
```

### 2. Configure Environment

```bash
# Required
export DATABASE_URL="postgresql://user:password@localhost:5432/civicreport"
export SESSION_SECRET="your-super-secret-key-min-32-chars"
```

### 3. Push Database Schema

```bash
cd database
npx drizzle-kit push
cd ..
```

### 4. Start the Application

```bash
bash start.sh
```

Open **http://localhost:5000** — backend runs on `:8080`, frontend on `:5000`.

### Run Services Individually

```bash
# Backend only
cd backend && pnpm run dev   # http://localhost:8080

# Frontend only
cd frontend && pnpm run dev  # http://localhost:5000
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/citizen/register` | — | Register citizen (name, email, password, city?, state?) |
| `POST` | `/api/auth/citizen/login` | — | Citizen login |
| `POST` | `/api/auth/citizen/guest` | — | Guest session |
| `POST` | `/api/auth/government/login` | — | Official login (name + officialId) |
| `GET` | `/api/auth/me` | ✅ | Get current user |

### Issues
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/issues` | — | List issues (`scope`, `state`, `city`, `category`, `status`) |
| `POST` | `/api/issues` | ✅ | Create a new issue |
| `GET` | `/api/issues/:id` | — | Issue detail with timeline & comments |
| `PATCH` | `/api/issues/:id/status` | 🏛️ | Update status + optional note/deadline |
| `POST` | `/api/issues/:id/confirm` | ✅ | Confirm / toggle confirmation |
| `POST` | `/api/issues/:id/subscribe` | ✅ | Subscribe for updates |
| `POST` | `/api/issues/:id/note` | 🏛️ | Add official note |
| `POST` | `/api/issues/:id/comments` | ✅ | Post a comment |
| `POST` | `/api/issues/:id/comments/:cid/upvote` | ✅ | Upvote a comment |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reviews` | — | List all reviews |
| `POST` | `/api/reviews` | ✅ | Submit a review (rating 1–5 + text) |

### Stats & Public
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stats/public` | — | Total reported, verified, resolved |
| `GET` | `/api/stats/government` | 🏛️ | Constituency stats + charts |
| `GET` | `/api/officials` | — | List all government officials |
| `GET` | `/api/notifications` | ✅ | User notification list |
| `GET` | `/api/notifications/stream` | ✅ | SSE stream for real-time alerts |
| `PATCH` | `/api/notifications/:id/read` | ✅ | Mark notification read |
| `GET` | `/api/healthz` | — | Health check |

> **Auth key:** ✅ = citizen session required · 🏛️ = government official only

---

## 🔐 Authentication

CivicReport uses a **custom HMAC-SHA256 JWT** (no third-party library).

- **Token format:** `base64url(payload).base64url(HMAC-SHA256(payload, SESSION_SECRET))`
- **Storage:** `localStorage` key `civic_auth` on the frontend
- **Header:** `Authorization: Bearer <token>`
- **Roles:** `citizen` | `guest` | `government`
- Guest sessions are ephemeral; citizens and officials have persistent accounts

---

## 🔄 How It Works

```
Citizen reports issue (photo + GPS)
         │
         ▼
Community confirms → Authenticity Score rises
         │
         ▼
Issue routed to MLA's constituency dashboard
         │
         ▼
Official updates status (In Progress → Resolved)
         │
         ▼
Citizen gets real-time SSE notification ✓
```

---

## 🤝 Government Officials (Demo Accounts)

Login at `/gov/login` using **Name + Official ID**:

| Official | Constituency | State | Official ID |
|---|---|---|---|
| Arvind Kejriwal | New Delhi | Delhi | `MLA-ND-001` |
| Bhagwant Mann | Dhuri | Punjab | `MLA-DR-012` |
| Mamata Banerjee | Bhabanipur | West Bengal | `MLA-BH-006` |
| M. K. Stalin | Kolathur | Tamil Nadu | `MLA-KL-007` |
| Yogi Adityanath | Gorakhpur Urban | Uttar Pradesh | `MLA-GK-005` |

---

## 📄 License

MIT © [code-with-bindu](https://github.com/code-with-bindu)

---

<div align="center">

**Built with ❤️ to make cities better — one report at a time.**

[Report Bug](https://github.com/code-with-bindu/Civic-Report/issues) · [Request Feature](https://github.com/code-with-bindu/Civic-Report/issues)

</div>
