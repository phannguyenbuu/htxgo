# dPaper Backend

## Setup
1. Create DB `dpaper` in PostgreSQL.
2. Copy `.env.example` to `.env` and edit credentials.
3. Install dependencies:
   - `python -m venv .venv`
   - `.venv\Scripts\activate`
   - `pip install -r requirements.txt`
4. Run migrations:
   - `flask db init`
   - `flask db migrate -m "init"`
   - `flask db upgrade`
5. Seed units:
   - `python seed.py`
6. Run server:
   - `python run.py`
   - Live debug (port 8006):
     - Linux/macOS: `APP_HOST=0.0.0.0 APP_PORT=8006 APP_DEBUG=1 python run.py`
     - Windows PowerShell: `$env:APP_HOST='0.0.0.0'; $env:APP_PORT='8006'; $env:APP_DEBUG='1'; python run.py`

## Quick PostgreSQL Init (VPS)
- Script: `backend/scripts/init_htxgo_db.sh`
- SQL: `backend/scripts/init_htxgo_db.sql`
- Default DB connection in script:
  - user: `postgres`
  - password: `myPass`
  - database: `htxgo`

Run on Linux VPS:
- `chmod +x backend/scripts/init_htxgo_db.sh`
- `./backend/scripts/init_htxgo_db.sh`

Seed credentials:
- Admin: `admin / admin123`
- Driver: `driver01 / driver123`

## Auth
- POST `/api/auth/register-admin`
- POST `/api/auth/register-driver`
- POST `/api/auth/login`

## Admin Dashboard (Flask)
- Login page: `/admin/login`
- Dashboard page: `/admin`
- API overview: `/api/admin/overview`
- API dataset: `/api/admin/dataset`

All CRUD endpoints require JWT in `Authorization: Bearer <token>`.
Create/update/delete endpoints require admin role.
