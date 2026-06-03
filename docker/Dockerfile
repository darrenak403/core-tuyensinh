# Use Bun's official image (latest)
FROM oven/bun:alpine AS base

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production --ignore-scripts

COPY . .

RUN bun build src/index.ts --outdir ./dist --target bun

ENV PORT=2222
EXPOSE 2222

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:2222/health || exit 1

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
