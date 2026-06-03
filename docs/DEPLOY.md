# Quy trình deploy: GitHub → Docker Hub → Dokploy (VPS)

## Tổng quan

```mermaid
flowchart LR
  dev[Push main / tag v*] --> gh[GitHub Actions]
  gh --> test[bun test]
  test --> build[Build docker/Dockerfile]
  build --> hub[Docker Hub]
  hub --> dok[Dokploy VPS]
  dok --> api[Container API]
  dok --> db[(PostgreSQL Dokploy)]
```

| Bước | Nơi chạy | Việc cần làm |
|------|-----------|--------------|
| 1 | GitHub | CI test + build + `docker push` |
| 2 | Docker Hub | Lưu image `/<user>/fpt-admission-api` |
| 3 | Dokploy | Pull image, inject **env**, expose domain |
| 4 | VPS | Chạy container API + DB (tách service) |

**Không** commit `docker/.env` production lên repo. Biến nhạy cảm chỉ khai báo trên **Dokploy → Environment**.

---

## 1. GitHub Actions

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

- **PR**: chỉ chạy test
- **Push `main`**: test → push image tag `latest` + `main` + `sha`
- **Tag `v*`**: thêm tag semver (`v1.2.3` → `1.2.3`, `1.2`)

### Secrets (Settings → Secrets and variables → Actions)

| Secret | Mô tả |
|--------|--------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Access token ([Docker Hub Security](https://hub.docker.com/settings/security)) |

Image push: `DOCKER_USERNAME/fpt-admission-api`

---

## 2. Docker Hub

Sau push `main`, kiểm tra:

```
docker pull <DOCKER_USERNAME>/fpt-admission-api:latest
```

Tag theo version (khuyến nghị production):

```bash
git tag v1.0.0
git push origin v1.0.0
```

Dokploy có thể pin `fpt-admission-api:1.0.0` thay vì `latest`.

---

## 3. Dokploy trên VPS

### 3.1 PostgreSQL (service Database)

Tạo **PostgreSQL** trên Dokploy (hoặc DB có sẵn):

| Thiết lập | Gợi ý |
|-----------|--------|
| Port nội bộ | `1111` (khớp convention repo) hoặc `5432` |
| Database | `fpt_admission_prod` |
| User / password | Mạnh, lưu trên Dokploy |

**Lần đầu** chạy schema/seed (từ máy có `psql` hoặc terminal Dokploy):

```bash
# DATABASE_URL trỏ tới DB Dokploy (host = tên service nội bộ Dokploy)
export DATABASE_URL=postgresql://USER:PASS@postgres-host:1111/fpt_admission_prod
./scripts/db-init.sh
./scripts/db-seed.sh
```

Host `postgres-host` lấy từ Dokploy (tên service DB trong cùng project/network).

### 3.2 Application (Docker image)

| Trường | Giá trị |
|--------|---------|
| **Source** | Docker Hub |
| **Image** | `<DOCKER_USERNAME>/fpt-admission-api:latest` |
| **Port container** | `3000` |
| **Port public** | `3000` (hoặc để Dokploy proxy 80/443) |

**Build**: tắt — không build trên VPS, chỉ **pull** image.

**Auto deploy** (tùy chọn): bật webhook/registry watch khi image `latest` cập nhật trên Docker Hub.

### 3.3 Environment variables (Dokploy UI)

Bắt buộc cho container API:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

JWT_SECRET=<chuỗi-ngẫu-nhiên-≥32-ký-tự>

CORS_ORIGINS=https://your-frontend.com,https://admin.your-domain.com

DATABASE_URL=postgresql://USER:PASSWORD@<postgres-service-host>:1111/fpt_admission_prod
```

| Biến | Ghi chú |
|------|---------|
| `DATABASE_URL` | Host = **tên service Postgres** trong Dokploy (không phải `localhost` từ trong container API) |
| `JWT_SECRET` | Khác dev, không chia sẻ |
| `CORS_ORIGINS` | Domain frontend thật, phân cách bằng dấu phẩy |

Tham chiếu compose: [`docker/docker-compose.dokploy.yml`](../docker/docker-compose.dokploy.yml)

### 3.4 Domain & HTTPS

Trên Dokploy gán domain cho app → Dokploy/Traefik xử lý SSL. API public: `https://api.your-domain.com`.

Health check path: `/health`

---

## 4. Kiểm tra sau deploy

```bash
curl -sf https://api.your-domain.com/health
curl -sf https://api.your-domain.com/docs
```

---

## 5. VPS không dùng Task

Trên server chỉ cần **Docker** + **Dokploy** (pull image, redeploy). `Taskfile.yml` dành cho dev trên máy local.

Compose prod tham chiếu: [`docker/docker-compose.prod.yml`](../docker/docker-compose.prod.yml)

---

## Checklist nhanh

- [ ] GitHub secrets `DOCKER_USERNAME`, `DOCKER_PASSWORD`
- [ ] Push `main` → image có trên Docker Hub
- [ ] Dokploy: Postgres + init DB
- [ ] Dokploy: App pull image, env đủ 5 biến bắt buộc
- [ ] Domain + HTTPS
- [ ] `/health` OK
