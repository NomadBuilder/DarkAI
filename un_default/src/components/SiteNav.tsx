"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  CHROME_STORE_URL,
  CLI_DOCS_URL,
  GITHUB_ACTION_URL,
} from "@/lib/links";

export function SiteNav({
  active,
}: {
  active?: "home" | "swap" | "dogwhistles" | "rules" | "sources" | "agents";
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
        Un-Default
      </Link>

      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm justify-end">
        <NavLink href="/" active={active === "home"} accent="var(--ochre)">
          Review
        </NavLink>
        <NavLink href="/swap" active={active === "swap"} accent="var(--leaf)">
          Swap
        </NavLink>
        <NavLink
          href="/dogwhistles"
          active={active === "dogwhistles"}
          accent="var(--indigo)"
        >
          Dogwhistles
        </NavLink>
        <NavLink
          href="/for-agents"
          active={active === "agents"}
          accent="var(--coral)"
        >
          Agents
        </NavLink>
        <InstallMenu />
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

function InstallMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative ml-1 sm:ml-2" ref={rootRef}>
      <button
        type="button"
        className="install-cta"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        Install
        <span className="install-cta-chevron" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="install-menu"
          aria-label="Install Un-Default"
        >
          <Link
            role="menuitem"
            href="/for-agents"
            className="install-menu-item"
            onClick={() => setOpen(false)}
          >
            <span className="install-menu-title">Claude / Cursor</span>
            <span className="install-menu-desc">
              <code>npx -y anti-default init</code> · MCP paste
            </span>
          </Link>
          <a
            role="menuitem"
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="install-menu-item"
            onClick={() => setOpen(false)}
          >
            <span className="install-menu-title">Chrome extension</span>
            <span className="install-menu-desc">
              Highlights on any live page
            </span>
          </a>
          <a
            role="menuitem"
            href={CLI_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="install-menu-item"
            onClick={() => setOpen(false)}
          >
            <span className="install-menu-title">CLI</span>
            <span className="install-menu-desc">
              <code>npx -y anti-default .</code>
            </span>
          </a>
          <a
            role="menuitem"
            href={GITHUB_ACTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="install-menu-item"
            onClick={() => setOpen(false)}
          >
            <span className="install-menu-title">GitHub Action</span>
            <span className="install-menu-desc">Fail PRs · checklist comment</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}

/** Five equal threads — visual reminder that inclusion is plural */
export function InclusiveBand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inclusive-band ${className}`}
      role="img"
      aria-label="A band of five colors standing for many communities"
    >
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
