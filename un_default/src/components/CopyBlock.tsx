"use client";

import { useState } from "react";
import { trackEvent, type TelemetryEvent } from "@/lib/telemetry";

export function CopyBlock({
  label,
  text,
  language = "text",
  track,
}: {
  label: string;
  text: string;
  language?: string;
  /** Optional install-intent event when the user copies. */
  track?: TelemetryEvent;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (track) trackEvent(track);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="copy-block">
      <div className="copy-block-bar">
        <span className="copy-block-label">{label}</span>
        <button type="button" className="copy-block-btn" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="copy-block-pre">
        <code data-language={language}>{text.trimEnd()}</code>
      </pre>
    </div>
  );
}
