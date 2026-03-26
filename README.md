# MyKite Fullstack

Career assessment app (Holland RIASEC + Big Five OCEAN) built with Bun monorepo.

## Stack

- Runtime: Bun
- Backend: Hono (`apps/api`)
- Frontend: React + Vite + TanStack Router (`apps/web`)
- Database: PostgreSQL + Drizzle ORM (`packages/database`)
- Shared types/schemas: `packages/shared`

## Monorepo layout

```text
mykite-fullstack/
  apps/
    api/
    web/
  packages/
    database/
    shared/
  data/
    questions/
    careers.json
```

## Prerequisites

- Bun >= 1.3
- PostgreSQL >= 14 (for full DB flow)

Check Bun version:

```bash
bun --version
```

## Quick start (developer)

### 1) Install deps

```bash
bun install
```

### 2) Setup env

```bash
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/mykite
PORT=5006
NODE_ENV=development
VITE_API_URL=http://localhost:5006
```

### 3) Prepare database

Create DB first (example):

```bash
createdb mykite
```

Then run migrations + seed:

```bash
bun run db:generate
bun run db:migrate
bun run db:seed
```

### 4) Run app (API + Web)

```bash
bun run dev
```

Open:

- Web: `http://localhost:5173`
- API: `http://localhost:5006`

## Useful scripts

- `bun run dev` - run API + Web together
- `bun run dev:api` - run only API
- `bun run dev:web` - run only Web
- `bun run build` - build all packages/apps
- `bun run typecheck` - typecheck all workspaces
- `bun run db:generate` - generate Drizzle migration
- `bun run db:migrate` - apply migration
- `bun run db:seed` - seed assessments/questions/careers

## Notes for local development

- API can boot without `DATABASE_URL`, but DB endpoints will fail.
- Frontend proxies `/api` to `http://localhost:5006` in dev.
- Question data is in:
  - `data/questions/holland.json`
  - `data/questions/bigfive.json`

## Deployment (Render)

`render.yaml` is included for one-click-ish setup of:

- `mykite-api` (web service)
- `mykite-web` (static site)
- `mykite-db` (PostgreSQL)

## Troubleshooting

### `DATABASE_URL not set, using mock mode`

Set `.env` correctly and restart dev server.

### Migration command fails

- Verify Postgres is running
- Verify `DATABASE_URL`
- Ensure DB exists (`createdb mykite`)

### Port already in use

Change `PORT` for API or Vite port in `apps/web/vite.config.ts`.
