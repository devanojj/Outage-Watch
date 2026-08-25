import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import { deleteTarget, getHistory } from "../api";
import { computeUptimePercent } from "../statusUtils";

export default function TargetCard({ target, refreshToken, onSelect, onDeleted }) {
  const [uptime, setUptime] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHistory(target.id, 24)
      .then((pings) => {
        if (!cancelled) setUptime(computeUptimePercent(pings));
      })
      .catch(() => {
        if (!cancelled) setUptime(null);
      });
    return () => {
      cancelled = true;
    };
  }, [target.id, refreshToken]);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteTarget(target.id);
      onDeleted();
    } catch (err) {
      setDeleting(false);
      setConfirmingDelete(false);
      alert(`Failed to delete: ${err.message}`);
    }
  }

  const ping = target.latest_ping;

  return (
    <div className="target-card" onClick={() => onSelect(target.id)}>
      <div className="target-card-header">
        <h3>{target.name}</h3>
        <StatusBadge status={ping?.status} />
      </div>
      <div className="target-url">{target.url}</div>
      <div className="target-stats">
        <div className="stat">
          <span className="stat-label">Latency</span>
          <span className="stat-value">
            {ping?.latency_ms != null ? `${Math.round(ping.latency_ms)} ms` : "—"}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">24h uptime</span>
          <span className="stat-value">
            {uptime != null ? `${uptime.toFixed(1)}%` : "—"}
          </span>
        </div>
      </div>
      <button
        type="button"
        className={`delete-btn ${confirmingDelete ? "confirm" : ""}`}
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "Deleting..." : confirmingDelete ? "Confirm delete?" : "Delete"}
      </button>
    </div>
  );
}
