import Link from "next/link";

export function SiteNav({ active }: { active?: "home" | "rules" }) {
  return (
    <nav
      className="relative z-10 flex items-center justify-between gap-4 mb-10"
      aria-label="Primary"
    >
      <Link
        href="/"
        className="nav-quiet text-base tracking-wide text-[var(--ink)] hover:text-[var(--teal-deep)] transition-colors py-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Anti-Default
      </Link>
      <div className="flex items-center gap-1 text-sm">
        <Link
          href="/"
          className={`nav-quiet px-3 py-2 transition-colors ${
            active === "home"
              ? "text-[var(--ink)] border-b-[3px] border-[var(--ochre)]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
          aria-current={active === "home" ? "page" : undefined}
        >
          Review
        </Link>
        <Link
          href="/rules"
          className={`nav-quiet px-3 py-2 transition-colors ${
            active === "rules"
              ? "text-[var(--ink)] border-b-[3px] border-[var(--coral)]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
          aria-current={active === "rules" ? "page" : undefined}
        >
          Rules
        </Link>
      </div>
    </nav>
  );
}

/** Five equal threads — visual reminder that inclusion is plural */
export function InclusiveBand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inclusive-band ${className}`}
      role="img"
      aria-label="A band of five equal colors standing for many communities"
    >
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
