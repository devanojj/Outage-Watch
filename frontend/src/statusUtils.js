export function computeUptimePercent(pings) {
  if (!pings || pings.length === 0) return null;
  const upCount = pings.filter((p) => p.status !== "down").length;
  return (upCount / pings.length) * 100;
}

// Bucket ping history into a fixed number of equal-width time slots so the
// timeline strip stays readable regardless of how many pings landed in the
// window. Each slot takes the worst status observed in it.
const SEVERITY = { down: 2, degraded: 1, up: 0 };

export function bucketizeStatuses(pings, hours = 24, bucketCount = 48) {
  const now = Date.now();
  const windowMs = hours * 60 * 60 * 1000;
  const start = now - windowMs;
  const bucketMs = windowMs / bucketCount;

  const buckets = Array.from({ length: bucketCount }, () => null);

  for (const ping of pings || []) {
    const t = new Date(ping.timestamp).getTime();
    let idx = Math.floor((t - start) / bucketMs);
    if (idx < 0) idx = 0;
    if (idx >= bucketCount) idx = bucketCount - 1;

    const current = buckets[idx];
    if (current === null || SEVERITY[ping.status] > SEVERITY[current]) {
      buckets[idx] = ping.status;
    }
  }

  return buckets;
}
