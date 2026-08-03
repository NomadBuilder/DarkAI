/**
 * Privacy policy for the Anti-Default Chrome extension and web app.
 * Hosted at /privacy so the Chrome Web Store can link to a stable public URL.
 */
export default function PrivacyContent() {
  return (
    <article className="prose-privacy grid gap-8 max-w-3xl text-[var(--ink)]">
      <div className="grid gap-3">
        <p className="text-sm text-[var(--ink-soft)]">
          Last updated: August 2, 2026
        </p>
        <p className="text-lg text-[var(--ink-soft)] leading-relaxed">
          Anti-Default helps people notice default-heavy language. This policy
          explains what the <strong>browser extension</strong> and the{" "}
          <strong>web app at darkai.ca/anti-default</strong> do — and do not —
          collect.
        </p>
      </div>

      <section className="grid gap-3">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Browser extension
        </h2>
        <ul className="grid gap-2 text-[var(--ink-soft)] leading-relaxed list-disc pl-5">
          <li>
            Matching runs <strong>entirely on your device</strong> using a
            bundled rule list. There is <strong>no AI / LLM API call</strong>.
          </li>
          <li>
            The extension does <strong>not</strong> collect, sell, or share
            browsing history, page content, or personal information with us.
          </li>
          <li>
            The only setting stored is whether highlights are on or off, via
            Chrome’s <code>storage.sync</code> (stays in your Google account /
            browser sync if you use it).
          </li>
          <li>
            Optional links in the UI open the public Anti-Default site
            (https://darkai.ca/anti-default/) in a normal browser tab. Those
            visits are ordinary website traffic.
          </li>
          <li>
            We do not use advertising SDKs, analytics SDKs, or remote code in
            the extension package.
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Web app (darkai.ca/anti-default)
        </h2>
        <ul className="grid gap-2 text-[var(--ink-soft)] leading-relaxed list-disc pl-5">
          <li>
            Language analysis of pasted text and of scraped public pages runs
            in your browser from published rules.
          </li>
          <li>
            If you review a URL, our server may fetch that public page (and
            optionally a few related same-site pages) so the text can be shown
            to you. We do not use that fetch to build marketing profiles.
          </li>
          <li>
            Rule preferences and “ignored match” choices may be saved in your
            browser’s local storage only.
          </li>
          <li>
            Standard web server logs (IP, time, path) may be retained briefly
            for security and reliability on the host platform.
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Children
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          The extension is not directed at children under 13. We do not
          knowingly collect personal information from children.
        </p>
      </section>

      <section className="grid gap-3">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Changes
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          If this policy changes in a material way, we will update the date
          above on this page.
        </p>
      </section>

      <section className="grid gap-3">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Contact
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          Questions about privacy or the extension: open an issue on{" "}
          <a
            href="https://github.com/NomadBuilder/DarkAI/issues"
            className="text-[var(--teal-deep)] underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/NomadBuilder/DarkAI
          </a>{" "}
          or use the contact options on{" "}
          <a
            href="https://darkai.ca"
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            darkai.ca
          </a>
          .
        </p>
      </section>
    </article>
  );
}
