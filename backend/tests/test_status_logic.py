import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from status_logic import compute_status


def test_up_when_fast_2xx():
    assert compute_status(200, 250, error=False) == "up"


def test_up_at_threshold_boundary():
    assert compute_status(200, 1000, error=False) == "up"


def test_degraded_when_slow_2xx():
    assert compute_status(200, 1200, error=False) == "degraded"


def test_down_on_non_2xx():
    assert compute_status(500, 100, error=False) == "down"


def test_down_on_404():
    assert compute_status(404, 50, error=False) == "down"


def test_down_on_error():
    assert compute_status(None, None, error=True) == "down"


def test_down_on_missing_status_code():
    assert compute_status(None, 50, error=False) == "down"
