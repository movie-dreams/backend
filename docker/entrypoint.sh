#!/bin/sh
set -eu

echo "entrypoint: running database migrations"
/app/docker/migrate.sh

echo "entrypoint: starting API"
exec node dist/main.js
