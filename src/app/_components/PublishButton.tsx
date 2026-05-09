"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "publishing" | "ok" | "error";

export default function PublishButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND === "local");
  }, []);

  if (!show) return null;

  async function publish() {
    setStatus("publishing");
    setMessage("Publishing…");
    try {
      const res = await fetch("/api/publish", { method: "POST" });
      const text = await res.text();
      setStatus(res.ok ? "ok" : "error");
      setMessage(text.trim() || (res.ok ? "Published." : "Publish failed."));
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Publish failed.");
    }
  }

  const color =
    status === "ok" ? "#16a34a" : status === "error" ? "#dc2626" : "#9333ea";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "flex-end",
        gap: 6,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <button
        onClick={publish}
        disabled={status === "publishing"}
        style={{
          background: color,
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: status === "publishing" ? "wait" : "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          opacity: status === "publishing" ? 0.7 : 1,
        }}
        title="Build, commit CMS content, and push to GitHub"
      >
        {status === "publishing" ? "Publishing…" : "Publish live"}
      </button>
      {message && status !== "idle" && (
        <pre
          style={{
            maxWidth: 360,
            maxHeight: 180,
            overflow: "auto",
            margin: 0,
            padding: "6px 10px",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            fontSize: 11,
            borderRadius: 6,
            whiteSpace: "pre-wrap",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {message}
        </pre>
      )}
    </div>
  );
}
