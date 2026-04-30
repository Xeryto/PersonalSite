import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SubItUp Sync — Chrome Extension",
  description:
    "Sync your SubItUp work schedule to Google Calendar or Apple Calendar automatically. No copy-pasting required.",
  openGraph: {
    title: "SubItUp Sync — Chrome Extension",
    description:
      "Sync your SubItUp work schedule to Google Calendar or Apple Calendar automatically.",
    type: "website",
  },
};

const CWS_URL =
  "https://chromewebstore.google.com/detail/subitup-sync/idkjlkkompfclfnampbhlcjbefefkepn";

export default function SubItUpSyncPage() {
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
        <a href="https://www.daniel-igoshin.com" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          ← daniel-igoshin.com
        </a>
        <Link href="/subitup-sync/privacy" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Privacy Policy
        </Link>
      </nav>

      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)" }}>

        {/* Hero */}
        <section style={{ marginBottom: "var(--space-3xl)" }}>
          <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--accent-1)", marginBottom: "var(--space-sm)", display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "var(--accent-1)" }} />
            Chrome Extension
          </p>
          <h1 style={{ fontSize: "var(--text-4xl)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "var(--space-md)" }}>
            SubItUp Sync
          </h1>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: "600px", marginBottom: "var(--space-lg)" }}>
            Automatically sync your <strong style={{ color: "var(--text)" }}>SubItUp work schedule</strong> to Google Calendar or Apple Calendar — no copy-pasting required.
          </p>
          <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
            <a href={CWS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              Install from Chrome Web Store
            </a>
            <a href="https://github.com/Xeryto/subitupExtension" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              View Source
            </a>
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: "var(--space-3xl)" }}>
          <p className="section__label">Features</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-md)" }}>
            {[
              { title: "Google Calendar", desc: "One-click OAuth sign-in. Syncs to a dedicated “SubItUp Shifts” calendar." },
              { title: "Apple Calendar", desc: "Connects via iCloud CalDAV using an app-specific password." },
              { title: "ICS Export", desc: "Download a .ics file and import to any calendar app — no account needed." },
              { title: "Auto-sync", desc: "Enable auto-sync to push new shifts every time you open your schedule." },
            ].map((f) => (
              <div key={f.title} style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-md)",
              }}>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Setup */}
        <section style={{ marginBottom: "var(--space-3xl)" }}>
          <p className="section__label">Setup</p>

          <div style={{ marginBottom: "var(--space-lg)" }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-sm)" }}>Google Calendar</h2>
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                "Open the extension popup — click the toolbar icon or the floating button on any SubItUp page.",
                "Make sure Google is selected at the top.",
                "Click Sign in with Google.",
                "Approve the calendar permission. The extension only creates and manages its own “SubItUp Shifts” calendar.",
              ].map((step, i) => (
                <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "2rem", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--accent-1)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-sm)" }}>Apple Calendar</h2>
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                "Select Apple at the top of the popup.",
                <>Generate an app-specific password at <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-1)" }}>appleid.apple.com</a> → Sign In and Security → App-Specific Passwords. Your regular Apple ID password won&apos;t work.</>,
                "Enter your Apple ID email and the app-specific password, then click Connect Apple Calendar.",
                "The extension validates your credentials by connecting to iCloud CalDAV.",
              ].map((step, i) => (
                <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "2rem", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--accent-1)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* How to use */}
        <section style={{ marginBottom: "var(--space-3xl)" }}>
          <p className="section__label">Usage</p>
          <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              "Navigate to your SubItUp schedule — the extension reads your shifts as the page loads.",
              "Open the popup — click the toolbar icon or the floating calendar button.",
              "Select shifts — all shifts are checked by default; uncheck any you don't want.",
              "Click Sync — shifts are added to a calendar called “SubItUp Shifts”.",
            ].map((step, i) => (
              <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, paddingLeft: "2rem", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: "var(--accent-1)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Permissions */}
        <section style={{ marginBottom: "var(--space-3xl)" }}>
          <p className="section__label">Permissions</p>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Permission</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Why it&apos;s needed</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["identity", "Signs you in to Google using Chrome's built-in OAuth"],
                  ["storage", "Saves settings, shift data, and sync history locally on your device"],
                  ["webRequest", "Monitors SubItUp page loads to detect when new schedule data is available"],
                  ["subitup.com", "Reads your schedule data from SubItUp pages"],
                  ["googleapis.com", "Creates and manages events in Google Calendar"],
                  ["caldav.icloud.com", "Creates and manages events in Apple Calendar via iCloud"],
                ].map(([perm, reason], i) => (
                  <tr key={i} style={{ borderBottom: i < 5 ? "1px solid var(--border)" : undefined }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--accent-1)", whiteSpace: "nowrap" }}>{perm}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Privacy callout */}
        <section>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hover)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-sm)",
          }}>
            <div>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "0.25rem" }}>Your data stays on your device</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>No backend, no accounts, no third-party sharing.</p>
            </div>
            <Link href="/subitup-sync/privacy" className="btn btn--ghost">
              Read Privacy Policy →
            </Link>
          </div>
        </section>

      </main>

      <footer style={{ textAlign: "center", padding: "var(--space-lg) var(--space-md)", borderTop: "1px solid var(--border)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
        SubItUp Sync by <a href="https://www.daniel-igoshin.com" style={{ color: "var(--accent-1)" }}>Daniel Igoshin</a>
        {" · "}
        <Link href="/subitup-sync/privacy" style={{ color: "var(--text-muted)" }}>Privacy Policy</Link>
      </footer>

    </div>
  );
}
