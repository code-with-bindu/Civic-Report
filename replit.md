# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## CivicReport App

A civic issue reporting web app where citizens report problems, the community confirms them, and government officials (MLAs) resolve them.

- **Frontend**: `artifacts/civicreport/` — React + Vite + Tailwind v4 + shadcn + wouter + tanstack-query + framer-motion + recharts + leaflet
- **Backend**: `artifacts/api-server/` — Express 5 with in-memory store, Bearer token auth, 8 seed issues + 15 MLAs
- **Theming**: Light + dark mode via `src/lib/theme.tsx` (`ThemeProvider`), persisted in localStorage as `civicreport:theme`. Toggle button is in the Navbar (Sun/Moon icon).
- **Landing page**: Horizontal-scrolling sections (categories, live community feed, features, testimonials marquee) using `.scroll-snap-x` and `.no-scrollbar` utilities defined in `index.css`.
- **Citizen pages**: Auth, Dashboard (stats/search/sort/grid-list), NewIssue, IssueDetail (Share/Follow/SLA), Notifications.
- **Government pages**: Dashboard with category filter, sort, SLA column, status pie chart, KPI strip, quick-resolve, CSV export.
- **Auth**: SESSION_SECRET env var required.
