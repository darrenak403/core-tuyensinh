#!/bin/sh
set -eu

if [ "${SKIP_MIGRATE:-0}" != "1" ]; then
  echo "Running database migration..."
  attempt=0
  max="${MIGRATE_RETRIES:-10}"
  while [ "$attempt" -lt "$max" ]; do
    attempt=$((attempt + 1))
    if bun run src/database/migrate.ts; then
      echo "Migration done."
      break
    fi
    if [ "$attempt" -ge "$max" ]; then
      echo "Migration failed after ${max} attempts."
      exit 1
    fi
    echo "Waiting for Postgres (${attempt}/${max})..."
    sleep 3
  done
else
  echo "SKIP_MIGRATE=1 — skip migration"
fi

exec bun run dist/index.js
