import { C, F } from "../theme";

export function PageShell({ children, label }) {
  return (
    <div data-screen-label={label} style={{ position: "relative", maxWidth: 1160, margin: "0 auto", padding: "24px 24px 56px" }}>
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <PageShell>
      <div style={{ fontFamily: F.mono, fontSize: 13, color: "rgba(250,250,247,0.62)", padding: "48px 0" }}>Loading…</div>
    </PageShell>
  );
}

export function ErrorBox({ error }) {
  const notFound = error?.message === "404";
  return (
    <PageShell>
      <div style={{ background: C.chalk, border: `1.5px solid ${C.deepPitch}`, padding: "28px 32px", color: C.turfShadow }}>
        <div style={{ fontFamily: F.display, fontSize: 28, letterSpacing: "0.04em" }}>
          {notFound ? "NOT FOUND" : "SOMETHING WENT WRONG"}
        </div>
        <div style={{ fontSize: 13, color: "rgba(46,66,40,0.62)", marginTop: 6 }}>
          {notFound ? "That page doesn't exist." : "Couldn't reach the Pitchside API."}
        </div>
      </div>
    </PageShell>
  );
}
