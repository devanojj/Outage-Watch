# Outage Watch

A self-hosted uptime and latency monitor for a list of URLs. Fully local —
no cloud services, no Docker, no auth.

- `backend/` — FastAPI + SQLAlchemy + SQLite + APScheduler
- `frontend/` — React (Vite) + Recharts

## How it works

Every 90 seconds, the backend checks every registered target concurrently
(a slow or failing target never delays the others) and records a ping:

- **down** — the request timed out, failed to connect, or returned a
  non-2xx response
- **degraded** — a 2xx response that took longer than 1000ms
- **up** — a 2xx response at or under 1000ms

This logic lives in [`backend/status_logic.py`](backend/status_logic.py) as
a pure function with no DB/framework dependencies, and all database access
is isolated in [`backend/crud.py`](backend/crud.py) — route handlers and the
scheduler never touch SQLAlchemy sessions directly. That boundary is there
so the app can later be ported to Azure Functions + Cosmos DB without
touching the core logic.

## Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. A `outage_watch.db` SQLite file is
created automatically on first run.

Run the unit tests for the status logic:

```bash
pytest tests/
```

### API

| Method | Path                          | Description                                  |
|--------|-------------------------------|-----------------------------------------------|
| POST   | `/targets`                    | Create a target — body `{url, name}`          |
| GET    | `/targets`                    | List targets with their latest ping embedded  |
| GET    | `/targets/{id}/history?hours=24` | Ping history for a target in the window    |
| DELETE | `/targets/{id}`                | Delete a target and its ping history         |

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and talks to the backend at
`http://127.0.0.1:8000` (see `frontend/src/api.js`). The dashboard polls
`GET /targets` every 45 seconds.

## What's intentionally left out

No auth/accounts, no configurable thresholds or ping intervals (hardcoded:
90s interval, 5s timeout, 1000ms degraded threshold), no
notifications/alerts, no Docker, no multi-region checks.
