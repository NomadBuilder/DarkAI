import Link from "next/link";

export function SiteNav({
  active,
}: {
  active?: "home" | "rules" | "guide";
}) {
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
        <NavLink href="/" active={active === "home"} accent="var(--ochre)">
          Review
        </NavLink>
        <NavLink href="/rules" active={active === "rules"} accent="var(--coral)">
          Rules
        </NavLink>
        <NavLink href="/guide" active={active === "guide"} accent="var(--indigo)">
          Guide
        </NavLink>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  accent,
  children,
}: {
  href: string;
  active: boolean;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`nav-quiet px-3 py-2 transition-colors ${
        active
          ? "text-[var(--ink)] border-b-[3px]"
          : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
      }`}
      style={active ? { borderBottomColor: accent } : undefined}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
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
