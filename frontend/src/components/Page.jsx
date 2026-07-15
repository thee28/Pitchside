export function PageShell({ children, label }) {
  return (
    <div data-screen-label={label} className="ps-page">
      {children}
    </div>
  );
}

// Skeleton mirrors the common page shape (title, subtitle, card band)
// so content lands without a layout jump.
export function Loading() {
  return (
    <PageShell>
      <div role="status" aria-label="Loading" className="ps-loading-reveal">
        <div className="ps-skeleton" style={{ width: 220, height: 28 }} />
        <div className="ps-skeleton" style={{ width: 320, height: 14, marginTop: 12 }} />
        <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", marginTop: "var(--sp-5)" }}>
          <div className="ps-skeleton" style={{ flex: "2 1 460px", minWidth: 320, height: 420 }} />
          <div className="ps-skeleton" style={{ flex: "1 1 300px", minWidth: 280, height: 420 }} />
        </div>
      </div>
    </PageShell>
  );
}

export function ErrorBox({ error }) {
  const notFound = error?.message === "404";
  return (
    <PageShell>
      <div className="ps-card--light ps-light" style={{ padding: "28px 32px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-md)", lineHeight: 1, letterSpacing: "0.04em" }}>
          {notFound ? "NOT FOUND" : "SOMETHING WENT WRONG"}
        </div>
        <div style={{ fontSize: "var(--text-md)", color: "var(--ink-60)", marginTop: 6 }}>
          {notFound ? "That page doesn't exist." : "Couldn't reach the Pitchside API."}
        </div>
        {!notFound && (
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "var(--sp-4)",
              background: "var(--ink)",
              color: "var(--chalk)",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            RETRY
          </button>
        )}
      </div>
    </PageShell>
  );
}
