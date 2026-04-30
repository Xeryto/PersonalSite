import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — SubItUp Sync",
  description: "Privacy policy for the SubItUp Sync Chrome extension.",
};

export default function PrivacyPage() {
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

        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--accent-1)", marginBottom: "var(--space-sm)", display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
          <span style={{ display: "inline-block", width: "24px", height: "1px", background: "var(--accent-1)" }} />
          SubItUp Sync
        </p>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2xl)", fontFamily: "var(--font-mono)" }}>
          Last updated: March 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2xl)" }}>

          {/* Summary */}
          <section>
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-hover)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-md)",
            }}>
              <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                SubItUp Sync is a browser extension that syncs your work schedule from SubItUp to your personal calendar.
                It has <strong style={{ color: "var(--text)" }}>no backend server</strong>, creates{" "}
                <strong style={{ color: "var(--text)" }}>no accounts</strong>, and transmits your data{" "}
                <strong style={{ color: "var(--text)" }}>only to Google or Apple</strong> depending on which calendar you connect.
              </p>
            </div>
          </section>

          {/* What data is collected */}
          <Section title="What data is collected">
            <DataBlock title="Shift data">
              Your shift titles, dates, times, and work locations as returned by the SubItUp website when you view your schedule. This data is only ever sent to Google Calendar or Apple Calendar on your behalf.
            </DataBlock>
            <DataBlock title="Google account information">
              If you connect Google Calendar, the extension reads your name, email address, and profile picture from Google&apos;s API to display in the popup. This information is not stored beyond your active browser session.
            </DataBlock>
            <DataBlock title="Apple ID email">
              If you connect Apple Calendar, your Apple ID email is stored locally on your device so the extension can identify your iCloud calendar. It is never sent anywhere except to Apple&apos;s CalDAV servers.
            </DataBlock>
            <DataBlock title="Apple app-specific password">
              Stored locally on your device in Chrome&apos;s local storage. Sent only to <code style={mono}>caldav.icloud.com</code> to authenticate calendar requests. Never logged, transmitted elsewhere, or shared.
            </DataBlock>
          </Section>

          {/* Where data is stored */}
          <Section title="Where data is stored">
            <p style={body}>
              All data is stored <strong style={{ color: "var(--text)" }}>locally on your device</strong> using Chrome&apos;s built-in <code style={mono}>chrome.storage.local</code> API. This includes:
            </p>
            <ul style={{ listStyle: "none", marginTop: "var(--space-sm)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                "Your detected shifts (current view and accumulated sync pool)",
                "Your sync history (which shifts have been synced and their calendar event IDs)",
                "Your settings (timezone, auto-sync preference, active provider)",
                "Your Apple credentials (if connected)",
                "Your Google OAuth token (if connected)",
              ].map((item) => (
                <li key={item} style={{ ...body, paddingLeft: "1.25rem", position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--accent-1)" }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ ...body, marginTop: "var(--space-sm)" }}>
              None of this data is stored on any external server operated by this extension.
            </p>
          </Section>

          {/* How data is used */}
          <Section title="How data is used">
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={th}>Data</th>
                    <th style={th}>Used for</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Shift titles, times, locations", "Creating and updating calendar events in Google or Apple Calendar"],
                    ["Google OAuth token", "Authenticating requests to Google Calendar API"],
                    ["Apple ID email + app-specific password", "Authenticating requests to Apple iCloud CalDAV"],
                    ["Sync records", "Detecting which events to create, update, or skip on the next sync"],
                    ["Settings", "Respecting your timezone and auto-sync preferences"],
                  ].map(([data, use], i, arr) => (
                    <tr key={i} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : undefined }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--text)", fontWeight: 500, verticalAlign: "top" }}>{data}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Third-party services */}
          <Section title="Third-party services">
            <p style={body}>The extension communicates with the following services, and only these:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
              <DataBlock title="SubItUp (subitup.com)">
                The extension reads your schedule data from SubItUp pages. It does not send anything to SubItUp.
              </DataBlock>
              <DataBlock title="Google Calendar API (googleapis.com)">
                If you connect Google Calendar, your shift data is sent to Google to create calendar events. Subject to{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-1)" }}>Google&apos;s Privacy Policy</a>.
              </DataBlock>
              <DataBlock title="Apple iCloud CalDAV (caldav.icloud.com)">
                If you connect Apple Calendar, your shift data is sent to Apple to create calendar events. Subject to{" "}
                <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-1)" }}>Apple&apos;s Privacy Policy</a>.
              </DataBlock>
            </div>
          </Section>

          {/* Data sharing */}
          <Section title="Data sharing">
            <p style={body}>
              This extension does not sell, share, or transmit your data to any third party other than Google or Apple as described above.
            </p>
          </Section>

          {/* Data retention */}
          <Section title="Data retention and deletion">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              <DataBlock title="Shifts and sync records">
                Stored locally until you uninstall the extension. &quot;Clear synced events&quot; in Settings deletes all synced events from your calendar and resets the local sync history.
              </DataBlock>
              <DataBlock title="Apple credentials">
                Deleted when you click &quot;Disconnect&quot; in the Apple auth section.
              </DataBlock>
              <DataBlock title="Google credentials">
                Cleared when you sign out. In Chrome Web Store mode, the OAuth token is managed by Chrome and cleared automatically on sign-out.
              </DataBlock>
            </div>
            <p style={{ ...body, marginTop: "var(--space-sm)" }}>
              You can remove all locally stored data at any time by uninstalling the extension.
            </p>
          </Section>

          {/* Permissions */}
          <Section title="Permissions">
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={th}>Permission</th>
                    <th style={th}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["identity", "Used exclusively to sign in with Google via Chrome's OAuth flow"],
                    ["storage", "Stores data locally on your device only"],
                    ["webRequest", "Detects when SubItUp pages load so shifts can be read; does not modify any requests"],
                  ].map(([perm, purpose], i) => (
                    <tr key={i} style={{ borderBottom: i < 2 ? "1px solid var(--border)" : undefined }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--accent-1)", whiteSpace: "nowrap", verticalAlign: "top" }}>{perm}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <p style={body}>
              This is an open-source personal project by{" "}
              <a href="https://www.daniel-igoshin.com" style={{ color: "var(--accent-1)" }}>Daniel Igoshin</a>.
              For questions or concerns, open an issue in the{" "}
              <a href="https://github.com/Xeryto/subitupExtension" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-1)" }}>
                project repository
              </a>.
            </p>
          </Section>

        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "var(--space-lg) var(--space-md)", borderTop: "1px solid var(--border)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
        SubItUp Sync by <a href="https://www.daniel-igoshin.com" style={{ color: "var(--accent-1)" }}>Daniel Igoshin</a>
        {" · "}
        <Link href="/subitup-sync" style={{ color: "var(--text-muted)" }}>Extension Page</Link>
      </footer>

    </div>
  );
}

const body: React.CSSProperties = {
  fontSize: "var(--text-sm)",
  color: "var(--text-secondary)",
  lineHeight: 1.8,
};

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.9em",
  color: "var(--accent-1)",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  fontSize: "var(--text-xs)",
  fontFamily: "var(--font-mono)",
  color: "var(--text-muted)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "var(--space-sm)", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {children}
      </div>
    </section>
  );
}

function DataBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-sm) var(--space-md)" }}>
      <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>{title}</p>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>{children}</p>
    </div>
  );
}
