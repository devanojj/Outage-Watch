import AddTargetForm from "./AddTargetForm";
import TargetCard from "./TargetCard";

export default function Dashboard({ targets, error, refreshToken, onRefresh, onSelect }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Outage Watch</h1>
        <p className="subtitle">Self-hosted uptime and latency monitor</p>
      </header>

      <AddTargetForm onCreated={onRefresh} />

      {error && <p className="error-text">Failed to load targets: {error}</p>}

      {targets === null && !error && <p>Loading targets...</p>}

      {targets !== null && targets.length === 0 && (
        <p className="empty-text">
          No targets yet. Add a URL above to start monitoring it.
        </p>
      )}

      {targets !== null && targets.length > 0 && (
        <div className="target-grid">
          {targets.map((t) => (
            <TargetCard
              key={t.id}
              target={t}
              refreshToken={refreshToken}
              onSelect={onSelect}
              onDeleted={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
