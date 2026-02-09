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

## Auth
- POST `/api/auth/register-admin`
- POST `/api/auth/register-driver`
- POST `/api/auth/login`

All CRUD endpoints require JWT in `Authorization: Bearer <token>`.
Create/update/delete endpoints require admin role.
