# Docker

**Taskfile** = dev local only. **VPS** = Dokploy + image Docker Hub (không chạy `task` trên server).

## Dev

```bash
cp docker/.env.example docker/.env
task services:up    # Postgres :1111
task dev            # API :2222 trên host
```

| Service | URL |
|---------|-----|
| API | http://localhost:2222 |
| PostgreSQL | localhost:1111 |

## Prod (Dokploy)

1. GitHub push `main` → image `{DOCKER_USERNAME}/fpt-admission-api:latest`
2. Dokploy: compose file **`docker/docker-compose.prod.yml`**
3. Env trên Dokploy UI (không commit `docker/.env`):

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
```

Registry credentials Dokploy: `DOCKER_USERNAME` + `DOCKER_PASSWORD`.

## Files

| File | Mục đích |
|------|----------|
| `Dockerfile` | Build image API (Bun) |
| `docker-compose.dev.yml` | Postgres dev |
| `docker-compose.prod.yml` | API + Postgres prod |
| `.env.example` | Mẫu biến (dev copy → `.env`) |
