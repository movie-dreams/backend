#!/bin/sh
set -eu

DB_HOST="${DB_HOST:-postgres-cine-prod}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-db_cine}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/app/migrations}"

export PGPASSWORD="$DB_PASSWORD"

psql_base() {
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

echo "migrate: waiting for database ${DB_HOST}:${DB_PORT}/${DB_NAME}..."
i=0
until psql_base -c 'SELECT 1' >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "migrate: database not ready after 60 attempts" >&2
    exit 1
  fi
  sleep 2
done
echo "migrate: database is ready"

psql_base <<'SQL'
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

is_applied() {
  migration_id="$1"
  count="$(psql_base -tAc "SELECT count(*) FROM public.schema_migrations WHERE id = '${migration_id}'")"
  [ "$count" = "1" ]
}

schema_exists() {
  count="$(psql_base -tAc "SELECT count(*) FROM information_schema.schemata WHERE schema_name = 'seguridad'")"
  [ "$count" = "1" ]
}

mark_applied() {
  migration_id="$1"
  psql_base -c "INSERT INTO public.schema_migrations (id) VALUES ('${migration_id}') ON CONFLICT (id) DO NOTHING;" >/dev/null
}

for file in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
  migration_id="$(basename "$file")"

  if is_applied "$migration_id"; then
    echo "migrate: skip ${migration_id} (already applied)"
    continue
  fi

  # Existing volumes already have the physical schema: stamp baseline without re-running.
  if [ "$migration_id" = "000_baseline_schema.sql" ] && schema_exists; then
    echo "migrate: stamp ${migration_id} (schema already present)"
    mark_applied "$migration_id"
    continue
  fi

  echo "migrate: apply ${migration_id}"
  psql_base -f "$file"
  mark_applied "$migration_id"
  echo "migrate: done ${migration_id}"
done

echo "migrate: all migrations applied"
