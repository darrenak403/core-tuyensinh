# AGENTS.md

## Dev commands (Task — local only)
- `task setup` → lần đầu | `task up` + `task dev` → hằng ngày
- `task db` / `task test` / `task fix` / `task down`
- Env: `docker/.env`

## Production (VPS)
Dokploy + Docker image from Docker Hub. No Taskfile. See `docker/docker-compose.prod.yml`, `docker/README.md`.

## Stack
Bun, Hono, PostgreSQL (Bun SQL), Zod, Biome.

## Layout
`src/routes` → `handlers` → `services`. SQL in `src/database/`.
