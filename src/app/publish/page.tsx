"use client";

import { useState } from "react";

export default function PublishPage() {
  const [status, setStatus] = useState("Idle");
  const [busy, setBusy] = useState(false);

  async function publish() {
    setBusy(true);
    setStatus("Publishing...");
    try {
      const response = await fetch("/api/publish", { method: "POST" });
      const text = await response.text();
      setStatus(text);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ fontFamily: "monospace", margin: "4rem auto", maxWidth: 720 }}>
      <h1>Publish Portfolio Updates</h1>
      <p>
        This local-only action builds the site, commits CMS content/assets, and pushes to GitHub.
        GitHub Pages deploys the live site after the push.
      </p>
      <button disabled={busy} onClick={publish} style={{ font: "inherit", padding: "0.75rem 1rem" }}>
        {busy ? "Publishing..." : "Publish live"}
      </button>
      <pre style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>{status}</pre>
    </main>
  );
}
