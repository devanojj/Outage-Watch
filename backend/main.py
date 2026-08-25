from contextlib import asynccontextmanager
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import models
import schemas
from checker import CHECK_INTERVAL_SECONDS, run_checks
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        run_checks,
        "interval",
        seconds=CHECK_INTERVAL_SECONDS,
        next_run_time=datetime.now(),
        id="run_checks",
    )
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Outage Watch", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_target_out(db: Session, target: models.Target) -> schemas.TargetOut:
    latest = crud.get_latest_ping(db, target.id)
    latest_ping = (
        schemas.LatestPing(
            status=latest.status,
            latency_ms=latest.latency_ms,
            http_status_code=latest.http_status_code,
            timestamp=latest.timestamp,
        )
        if latest is not None
        else None
    )
    return schemas.TargetOut(
        id=target.id,
        url=target.url,
        name=target.name,
        created_at=target.created_at,
        latest_ping=latest_ping,
    )


@app.post("/targets", response_model=schemas.TargetOut)
def create_target(payload: schemas.TargetCreate, db: Session = Depends(get_db)):
    target = crud.create_target(db, url=str(payload.url), name=payload.name)
    return _to_target_out(db, target)


@app.get("/targets", response_model=list[schemas.TargetOut])
def list_targets(db: Session = Depends(get_db)):
    targets = crud.get_targets(db)
    return [_to_target_out(db, t) for t in targets]


@app.get("/targets/{target_id}/history", response_model=list[schemas.PingOut])
def target_history(target_id: int, hours: int = 24, db: Session = Depends(get_db)):
    target = crud.get_target(db, target_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Target not found")
    return crud.get_history(db, target_id, hours=hours)


@app.delete("/targets/{target_id}")
def remove_target(target_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_target(db, target_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Target not found")
    return {"ok": True}
