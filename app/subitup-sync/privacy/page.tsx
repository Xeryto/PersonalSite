import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata: Metadata = {
  title: "Privacy Policy — SubItUp Sync",
  description: "Privacy policy for the SubItUp Sync Chrome extension.",
};

const PRIVACY_MD_URL = "https://raw.githubusercontent.com/Xeryto/subitupExtension/master/PRIVACY.md";

async function getPrivacyMarkdown(): Promise<string> {
  try {
    const res = await fetch(PRIVACY_MD_URL, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.text();
  } catch {
    const fallbackPath = path.join(process.cwd(), "app/subitup-sync/privacy/PRIVACY.fallback.md");
    return readFile(fallbackPath, "utf8");
  }
}

export default async function PrivacyPage() {
  const markdown = await getPrivacyMarkdown();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}>

      {/* Nav */}
      <nav style={{
        padding: "1.25rem clamp(1.5rem, 4vw, 3rem)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/subitup-sync" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          ← SubItUp Sync
        </Link>
        <a href="https://www.daniel-igoshin.com" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          daniel-igoshin.com
        </a>
      </nav>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {markdown}
        </ReactMarkdown>
      </main>

      <footer style={{ textAlign: "center", padding: "var(--space-lg) var(--space-md)", borderTop: "1px solid var(--border)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
        SubItUp Sync by <a href="https://www.daniel-igoshin.com" style={{ color: "var(--accent-1)" }}>Daniel Igoshin</a>
        {" · "}
        <Link href="/subitup-sync" style={{ color: "var(--text-muted)" }}>Extension Page</Link>
      </footer>

    </div>
  );
}

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "var(--space-sm)", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "var(--space-sm)" }}>
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-1)" }}>
      {children}
    </a>
  ),
  strong: ({ children }) => <strong style={{ color: "var(--text)" }}>{children}</strong>,
  code: ({ children }) => (
    <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em", color: "var(--accent-1)" }}>
      {children}
    </code>
  ),
  ul: ({ children }) => (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "var(--space-sm)" }}>
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "1.25rem", position: "relative" }}>
      <span style={{ position: "absolute", left: 0, color: "var(--accent-1)" }}>→</span>
      {children}
    </li>
  ),
  hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "var(--space-xl) 0" }} />,
  table: ({ children }) => (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "var(--space-sm)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
    </div>
  ),
  tr: ({ children }) => <tr style={{ borderBottom: "1px solid var(--border)" }}>{children}</tr>,
  th: ({ children }) => (
    <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
      {children}
    </td>
  ),
};
