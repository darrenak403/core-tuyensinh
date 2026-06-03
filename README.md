# FPT Admission API (core-tuyensinh)

Backend API tuyển sinh FPT — **Bun** + **Hono** + **PostgreSQL** + TypeScript. Không có frontend trong repo này.

## Repo hoạt động như nào

```text
┌─────────────┐     HTTP      ┌──────────────────────────────────┐
│   Client    │ ────────────► │  Bun.serve (port 2222)           │
│  (web/app)  │               │  Hono app — routes / handlers    │
└─────────────┘               └──────────────┬───────────────────┘
                                             │ Bun.sql
                                             ▼
                              ┌──────────────────────────────────┐
                              │  PostgreSQL (port 1111)          │
                              │  schema + seeds: src/database/   │
                              └──────────────────────────────────┘
```

1. **`src/index.ts`** — khởi động server Bun, đọc `docker/.env` (hoặc env Dokploy).
2. **`src/app.ts`** — middleware (CORS, auth, log), gắn routes.
3. **`src/routes/` → `handlers/` → `services/`** — HTTP → logic → query DB.
4. **`src/database/`** — SQL schema/views/seeds; Postgres dev mount vào `docker-entrypoint-initdb.d`.
5. **`/docs`** — OpenAPI + Scalar UI.

### Môi trường

| Môi trường | API | DB | Cách chạy |
|------------|-----|-----|-----------|
| **Dev** | Host `:2222` | Docker `:1111` | `task up` + `task dev` (không build image) |
| **CI** | Test in-memory | GitHub Actions Postgres `:1111` | `deploy.yml` |
| **Prod** | Container `:2222` | Cùng stack Postgres | GitHub → Docker Hub → **Dokploy** |

### Deploy production

Build/push image **chỉ trên CI** — local không cần `docker build` / `docker push`.

```text
git push main → GitHub Actions (test + docker push)
              → Docker Hub: {DOCKER_USERNAME}/fpt-admission-api:latest
              → Dokploy VPS: docker-compose.prod.yml + env trên UI
```

Secrets GitHub: `DOCKER_USERNAME`, `DOCKER_PASSWORD`.

Chi tiết Docker/Dokploy: [docker/README.md](docker/README.md).

## Yêu cầu

- [Bun](https://bun.sh/)
- [Task](https://taskfile.dev/) — `brew install go-task`
- Docker — cho Postgres dev/prod

## Quick start (dev)

```bash
cp docker/.env.example docker/.env
task setup          # install + postgres container
task dev            # API http://localhost:2222
```

- Docs: http://localhost:2222/docs  
- Health: http://localhost:2222/health  

## Lệnh dev (Task — chỉ máy local)

```bash
# Lần đầu
task setup
task db               # schema + seed (nếu cần)
task dev

# Hằng ngày
task up && task dev

# Khác
task down | task clear | task test | task fix | task db:reset
```

**VPS / production:** không dùng Task — Dokploy pull image + `docker-compose.prod.yml` + env trên UI.

## Cấu trúc thư mục

```text
src/
  index.ts, app.ts          # entry + Hono app
  routes/, handlers/        # HTTP
  services/                 # business + DB
  database/                 # SQL schema & seeds
  config/                   # env, db, logger, auth
docker/
  Dockerfile                # image production (Bun)
  docker-compose.dev.yml    # Postgres dev
  docker-compose.prod.yml   # API + Postgres (Dokploy)
  .env.example              # mẫu env (copy → .env)
src/database/migrate.ts     # migration + seed (task db)
.github/workflows/deploy.yml # CI + push Docker Hub
Taskfile.yml                # lệnh dev (local only)
```

## Env

File **`docker/.env`** (dev, gitignore). Production trên **Dokploy UI** — xem `docker/.env.example`.

## Ghi chú

- **Bun** là runtime bắt buộc (server, test, build, SQL driver) — không gỡ được nếu vẫn dùng stack này.
- Tài liệu nghiệp vụ tham khảo: `docs/fpt_university_2025_reference.md`.
