"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

/** Compact home entry that sends people to Swap with a prefilled query. */
export function SwapDoor() {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = phrase.trim();
    if (!q) {
      router.push("/swap/");
      return;
    }
    router.push(`/swap/?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="animate-rise-delay mb-10 max-w-xl grid gap-3"
    >
      <p className="text-sm text-[var(--ink-soft)]">
        Or look up one phrase — no full page needed.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex-1 grid">
          <span className="sr-only">Phrase to look up</span>
          <input
            type="search"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="you guys, chairman, whitelist…"
            className="w-full px-4 py-3 bg-[color-mix(in_oklab,white_72%,transparent)] border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none focus:border-[var(--teal)]"
            style={{ fontFamily: "var(--font-display)" }}
          />
        </label>
        <button
          type="submit"
          className="px-5 py-3 text-sm tracking-wide bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal-deep)] transition-colors whitespace-nowrap"
        >
          Look up
        </button>
      </div>
    </form>
  );
}
