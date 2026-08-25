from datetime import datetime

from pydantic import BaseModel, AnyHttpUrl, ConfigDict


class TargetCreate(BaseModel):
    url: AnyHttpUrl
    name: str


class PingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    status: str
    latency_ms: float | None
    http_status_code: int | None


class LatestPing(BaseModel):
    status: str
    latency_ms: float | None
    http_status_code: int | None
    timestamp: datetime


class TargetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    name: str
    created_at: datetime
    latest_ping: LatestPing | None = None
