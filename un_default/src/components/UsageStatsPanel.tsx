"use client";

import { useEffect, useState } from "react";
import { LIVE_APP_URL } from "@/lib/links";

type Stats = {
  updatedAt?: string | null;
  totals?: Record<string, number>;
  privacy?: string;
};

const LABELS: Record<string, string> = {
  for_agents_view: "For-agents page views",
  init_copy: "Copied init command",
  marketplace_copy: "Copied marketplace add",
  plugin_install_copy: "Copied plugin install",
  action_run: "GitHub Action runs",
};

export function UsageStatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`${LIVE_APP_URL}/api/stats`, { mode: "cors" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Stats>;
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError("Stats unavailable (API not reachable from this build).");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-[var(--ink-soft)]">{error}</p>;
  }
  if (!stats) {
    return <p className="text-sm text-[var(--ink-soft)]">Loading usage…</p>;
  }

  const totals = stats.totals ?? {};

  return (
    <div className="grid gap-4 max-w-2xl">
      <ul className="grid gap-2 text-[var(--ink-soft)] leading-relaxed">
        {Object.keys(LABELS).map((key) => (
          <li key={key} className="flex justify-between gap-4 border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)] py-2">
            <span>{LABELS[key]}</span>
            <strong className="font-medium text-[var(--ink)] tabular-nums">
              {Number(totals[key] || 0).toLocaleString()}
            </strong>
          </li>
        ))}
      </ul>
      {stats.updatedAt ? (
        <p className="text-xs text-[var(--ink-soft)]">
          Updated {new Date(stats.updatedAt).toLocaleString()}
        </p>
      ) : null}
      <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
        {stats.privacy}
      </p>
      <p className="text-sm text-[var(--ink-soft)]">
        Badge:{" "}
        <a
          className="text-[var(--teal-deep)] underline underline-offset-2"
          href={`${LIVE_APP_URL}/api/badge/action_run.svg`}
        >
          {LIVE_APP_URL}/api/badge/action_run.svg
        </a>
      </p>
    </div>
  );
}
