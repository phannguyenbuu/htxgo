#!/usr/bin/env bash
set -euo pipefail

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="postgres"
PGPASSWORD="myPass"
DB_NAME="htxgo"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/init_htxgo_db.sql"

export PGPASSWORD

echo "[1/3] Checking PostgreSQL connection..."
psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d postgres -c "SELECT version();" >/dev/null

echo "[2/3] Creating database ${DB_NAME} if missing..."
DB_EXISTS=$(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [[ "${DB_EXISTS}" != "1" ]]; then
  psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"
  echo "Database ${DB_NAME} created."
else
  echo "Database ${DB_NAME} already exists."
fi

echo "[3/3] Applying schema + seed..."
psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${DB_NAME}" -f "${SQL_FILE}"

echo "Done."
echo "Admin login: admin / admin123"
echo "Driver login: driver01 / driver123"
