import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getHistory } from "../api";
import { computeUptimePercent } from "../statusUtils";
import Timeline from "./Timeline";

export default function TargetDetail({ target, onBack }) {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setHistory(null);
    getHistory(target.id, 24)
      .then((pings) => {
        if (!cancelled) setHistory(pings);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [target.id]);

  const chartData = (history || []).map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    latency: p.latency_ms,
  }));

  const uptime = computeUptimePercent(history);

  return (
    <div className="target-detail">
      <button type="button" className="back-btn" onClick={onBack}>
        ← Back to dashboard
      </button>

      <h2>{target.name}</h2>
      <div className="target-url">{target.url}</div>

      {error && <p className="error-text">{error}</p>}

      {history === null && !error && <p>Loading history...</p>}

      {history !== null && history.length === 0 && (
        <p className="empty-text">No pings recorded yet for this target.</p>
      )}

      {history !== null && history.length > 0 && (
        <>
          <div className="detail-summary">
            <div className="stat">
              <span className="stat-label">24h uptime</span>
              <span className="stat-value">
                {uptime != null ? `${uptime.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Pings (24h)</span>
              <span className="stat-value">{history.length}</span>
            </div>
          </div>

          <h4>Latency (last 24h)</h4>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={30} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{ value: "ms", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#4f8cff"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h4>Status timeline (last 24h)</h4>
          <Timeline pings={history} hours={24} />
        </>
      )}
    </div>
  );
}
