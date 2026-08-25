"""All database access lives here. Route handlers and the scheduler call
into this module only — no raw SQL or Session usage anywhere else.
"""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

import models


def create_target(db: Session, url: str, name: str) -> models.Target:
    target = models.Target(url=url, name=name)
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


def get_targets(db: Session) -> list[models.Target]:
    return db.query(models.Target).order_by(models.Target.created_at.asc()).all()


def get_target(db: Session, target_id: int) -> models.Target | None:
    return db.query(models.Target).filter(models.Target.id == target_id).first()


def delete_target(db: Session, target_id: int) -> bool:
    target = get_target(db, target_id)
    if target is None:
        return False
    db.delete(target)
    db.commit()
    return True


def save_ping(
    db: Session,
    target_id: int,
    status: str,
    latency_ms: float | None,
    http_status_code: int | None,
) -> models.Ping:
    ping = models.Ping(
        target_id=target_id,
        status=status,
        latency_ms=latency_ms,
        http_status_code=http_status_code,
    )
    db.add(ping)
    db.commit()
    db.refresh(ping)
    return ping


def get_latest_ping(db: Session, target_id: int) -> models.Ping | None:
    return (
        db.query(models.Ping)
        .filter(models.Ping.target_id == target_id)
        .order_by(models.Ping.timestamp.desc())
        .first()
    )


def get_history(db: Session, target_id: int, hours: int = 24) -> list[models.Ping]:
    since = datetime.utcnow() - timedelta(hours=hours)
    return (
        db.query(models.Ping)
        .filter(models.Ping.target_id == target_id, models.Ping.timestamp >= since)
        .order_by(models.Ping.timestamp.asc())
        .all()
    )
