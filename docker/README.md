# Docker

**Taskfile** = dev local only (Postgres + `task dev` trên host). **Không** build/push image Docker trên máy dev — việc đó do GitHub Actions. **VPS** = Dokploy pull image từ Docker Hub.

## Dev

```bash
cp docker/.env.example docker/.env
task setup          # Postgres + migration + seed (lần đầu / sau task clear)
task up             # Postgres :1111 + Adminer :4444
task dev            # API :2222 trên host
task db             # migration (đã chạy thì bỏ qua) + seed (có data thì bỏ qua)
```

| Service    | URL                   |
| ---------- | --------------------- |
| API        | http://localhost:2222 |
| PostgreSQL | localhost:1111        |
| Adminer    | http://localhost:4444 |

**Adminer** — http://localhost:4444 → **PostgreSQL**, Server `postgres:1111` (port **1111**, không 5432), User/Password `postgres`, Database `fpt_admission_dev`.

**Migration** — `bun run src/database/migrate.ts` hoặc `task db`. File SQL trong `src/database/schema/` và `05_views/` được ghi vào bảng `_schema_migrations` (chỉ chạy một lần). Seed trong `src/database/seeds/` chỉ chạy khi bảng `departments` còn trống.

**Xóa sạch dev** — `task clear` (xóa volume `fpt-postgres-data-dev`). Tạo lại: `task setup`.

**Tên Docker (prefix `fpt-`):** container `fpt-postgres-dev`, `fpt-adminer-dev`; volume `fpt-postgres-data-dev`; network `fpt-net-dev`. Prod: `fpt-api-prod`, `fpt-postgres-prod`, …

## Prod (Dokploy) — auto migrate

1. Push `main` → CI push image `{DOCKER_USERNAME}/fpt-admission-api:latest`
2. Dokploy: **`docker/docker-compose.prod.yml`**
3. Redeploy → container `app`: **migrate → API** (entrypoint, không cần code trên VPS)
4. Env Dokploy:

```env
DOCKER_USERNAME=...
APP_TAG=latest
PORT=2222
JWT_SECRET=...
CORS_ORIGINS=https://...
POSTGRES_DB=fpt_admission_prod
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_PORT=1111
ADMINER_PORT=4444
```

Adminer: port **4444** (map domain/reverse proxy trên Dokploy nếu cần). Kết nối DB: Server `postgres`, Port `1111`, DB `POSTGRES_DB`, user/pass Postgres.

Registry credentials Dokploy: `DOCKER_USERNAME` + `DOCKER_PASSWORD`.

## Files

| File                      | Mục đích                      |
| ------------------------- | ----------------------------- |
| `Dockerfile`              | Build image API (Bun)         |
| `docker-compose.dev.yml`  | Postgres + Adminer dev        |
| `docker-compose.prod.yml` | API + Postgres + Adminer prod |
| `.env.example`            | Mẫu biến (dev copy → `.env`)  |
