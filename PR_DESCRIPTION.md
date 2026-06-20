# Add PostgreSQL, GraphQL, and query optimizations

## Summary

This PR replaces the in-memory task store with **PostgreSQL + Prisma**, adds a **GraphQL API** alongside REST, and applies basic query optimizations (indexes, field selection, pagination, parallel counts).

Both REST and GraphQL use a shared repository layer so CRUD logic is not duplicated.

## Changes

### Database
- Designed `Task` schema with status enum, length constraints, and timestamps
- Added indexes on `status`, `createdAt`, and composite `(status, createdAt)`
- Added Prisma migration and `docker-compose.yml` for local PostgreSQL

### Data layer
- **taskRepository.js** — optimized Prisma queries with `select`, filters, and pagination
- **prisma.js** — singleton client to avoid connection pool issues in dev
- Removed in-memory `taskStore.js`

### GraphQL
- Apollo Server at `/graphql`
- Queries: `tasks`, `task`, `taskCounts`
- Mutations: `createTask`, `updateTask`, `deleteTask`

### REST (updated)
- All CRUD endpoints now use PostgreSQL
- `GET /api/tasks` supports `status`, `limit`, and `offset` query params

### Config
- Added `DATABASE_URL` to `.env.example`
- Added npm scripts: `db:up`, `db:down`, `prisma:migrate`

## Schema

| Column | Type | Notes |
|--------|------|-------|
| id | UUID string | Primary key |
| title | VARCHAR(120) | Required |
| description | VARCHAR(500) | Optional |
| status | enum | pending, in_progress, completed |
| created_at | timestamp | Auto-set |
| updated_at | timestamp | Auto-updated |

## Optimizations

- Indexed filter and sort columns
- `select` only required fields in list queries
- Pagination with default limit 100 (max 200)
- Parallel `countTasks` calls for filter badge counts
- Shared repository for REST + GraphQL

## Setup

```bash
cp .env.example .env
npm install
npm run db:up
npm run prisma:migrate
npm run dev
```

## Test plan

- [ ] Start PostgreSQL with `npm run db:up`
- [ ] Run migrations with `npm run prisma:migrate`
- [ ] Confirm `GET /health` returns ok
- [ ] Create, list, update, and delete tasks via REST
- [ ] Run the same CRUD flow via GraphQL at `/graphql`
- [ ] Verify `taskCounts` returns correct totals
- [ ] Filter tasks by status on REST and GraphQL
- [ ] Restart server and confirm tasks persist

## Notes

- See local `DB_Connect_Features.md` for a full learning guide (not committed)
- REST kept for simple API testing; frontend uses GraphQL
