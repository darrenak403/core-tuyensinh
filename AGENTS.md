# AGENTS.md

## Dev commands (Task — local only)
- `task setup` / `task dev` / `task test` / `task fix`
- `task services:up` — Postgres dev :1111
- `task db:setup` — schema + seed
- Env: `docker/.env`

## Production (VPS)
Dokploy + Docker image from Docker Hub. No Taskfile. See `docker/docker-compose.prod.yml`, `docker/README.md`.

## Stack
Bun, Hono, PostgreSQL (Bun SQL), Zod, Biome.

## Layout
`src/routes` → `handlers` → `services`. SQL in `src/database/`.
