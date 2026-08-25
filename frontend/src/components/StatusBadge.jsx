const LABELS = {
  up: "Up",
  degraded: "Degraded",
  down: "Down",
};

export default function StatusBadge({ status }) {
  const cls = status ? `badge badge-${status}` : "badge badge-unknown";
  const label = status ? LABELS[status] : "No data";
  return <span className={cls}>{label}</span>;
}
