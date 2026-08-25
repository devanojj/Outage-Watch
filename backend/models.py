import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship

from database import Base


class PingStatus(str, enum.Enum):
    up = "up"
    degraded = "degraded"
    down = "down"


class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    pings = relationship(
        "Ping", back_populates="target", cascade="all, delete-orphan"
    )


class Ping(Base):
    __tablename__ = "pings"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(Enum(PingStatus), nullable=False)
    latency_ms = Column(Float, nullable=True)
    http_status_code = Column(Integer, nullable=True)

    target = relationship("Target", back_populates="pings")
