import { useCallback, useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import TargetDetail from "./components/TargetDetail";
import { getTargets } from "./api";

const POLL_INTERVAL_MS = 45000;

export default function App() {
  const [targets, setTargets] = useState(null);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const fetchTargets = useCallback(async () => {
    try {
      const data = await getTargets();
      setTargets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshToken((t) => t + 1);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
    const interval = setInterval(fetchTargets, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTargets]);

  const selectedTarget = targets?.find((t) => t.id === selectedId) ?? null;

  function handleSelect(id) {
    setSelectedId(id);
  }

  function handleBack() {
    setSelectedId(null);
  }

  function handleRefresh() {
    return fetchTargets();
  }

  if (selectedTarget) {
    return <TargetDetail target={selectedTarget} onBack={handleBack} />;
  }

  return (
    <Dashboard
      targets={targets}
      error={error}
      refreshToken={refreshToken}
      onRefresh={handleRefresh}
      onSelect={handleSelect}
    />
  );
}
