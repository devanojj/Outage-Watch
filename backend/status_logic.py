"""Pure status-calculation logic.

No DB, no framework, no I/O — just data in, status out. This module has no
dependency on SQLAlchemy/FastAPI/httpx so it can be lifted as-is into a
future Azure Functions deployment.
"""

DEGRADED_LATENCY_THRESHOLD_MS = 1000


def compute_status(
    http_status_code: int | None,
    latency_ms: float | None,
    error: bool = False,
) -> str:
    """Determine ping status from a completed (or failed) HTTP check.

    - down: request failed (timeout/connection error) or non-2xx response
    - degraded: 2xx response but latency_ms > 1000
    - up: 2xx response and latency_ms <= 1000
    """
    if error or http_status_code is None:
        return "down"

    if not (200 <= http_status_code < 300):
        return "down"

    if latency_ms is not None and latency_ms > DEGRADED_LATENCY_THRESHOLD_MS:
        return "degraded"

    return "up"
