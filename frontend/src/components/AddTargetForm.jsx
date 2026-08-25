import { useState } from "react";
import { createTarget } from "../api";

export default function AddTargetForm({ onCreated }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createTarget(name.trim(), url.trim());
      setName("");
      setUrl("");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-target-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name (e.g. My API)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add target"}
      </button>
      {error && <span className="form-error">{error}</span>}
    </form>
  );
}
