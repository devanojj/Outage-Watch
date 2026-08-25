"""Background monitoring: fetch each target concurrently and record a ping.

Kept separate from main.py so the "how we check a target" logic can be
reused verbatim by a future Azure Function timer trigger.
"""

import asyncio
import time

import httpx

import crud
from database import SessionLocal
from status_logic import compute_status

CHECK_TIMEOUT_SECONDS = 5
CHECK_INTERVAL_SECONDS = 90


async def check_target(client: httpx.AsyncClient, target_id: int, url: str) -> None:
    http_status_code: int | None = None
    latency_ms: float | None = None
    error = False

    start = time.monotonic()
    try:
        response = await client.get(
            url, timeout=CHECK_TIMEOUT_SECONDS, follow_redirects=True
        )
        latency_ms = (time.monotonic() - start) * 1000
        http_status_code = response.status_code
    except (httpx.TimeoutException, httpx.ConnectError, httpx.HTTPError):
        error = True

    status = compute_status(http_status_code, latency_ms, error)

    db = SessionLocal()
    try:
        crud.save_ping(
            db,
            target_id=target_id,
            status=status,
            latency_ms=latency_ms,
            http_status_code=http_status_code,
        )
    finally:
        db.close()


async def run_checks() -> None:
    db = SessionLocal()
    try:
        targets = crud.get_targets(db)
    finally:
        db.close()

    if not targets:
        return

    async with httpx.AsyncClient() as client:
        await asyncio.gather(
            *(check_target(client, t.id, t.url) for t in targets),
            return_exceptions=True,
        )
