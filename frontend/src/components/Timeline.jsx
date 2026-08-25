import { bucketizeStatuses } from "../statusUtils";

export default function Timeline({ pings, hours = 24 }) {
  const buckets = bucketizeStatuses(pings, hours, 48);

  return (
    <div className="timeline">
      {buckets.map((status, i) => (
        <div
          key={i}
          className={`timeline-block timeline-${status || "unknown"}`}
          title={status || "no data"}
        />
      ))}
    </div>
  );
}
