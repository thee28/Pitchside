import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import Flag from "../components/Flag";

const num = (n) => n.toLocaleString("en-US");

function StageChips({ stages }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
      {stages.map((s) => (
        <span
          key={s}
          style={{
            fontSize: "var(--text-2xs)",
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: "var(--goalpost)",
            background: "var(--chalk-fill)",
            border: "0.5px solid var(--chalk-rule)",
            padding: "2px 6px",
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function StadiumCard({ s }) {
  // The venue that staged the final gets the champion treatment used elsewhere.
  const finalHost = s.stages.includes("FINAL");
  const meta = [`Opened ${s.opened}`, s.roof].filter(Boolean).join(" · ");

  return (
    <article
      className={finalHost ? "ps-card--gold" : "ps-card"}
      style={{ display: "flex", flexDirection: "column", padding: "var(--sp-5)" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-3)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.1, letterSpacing: "0.03em", color: "var(--chalk)", margin: 0 }}>
          {s.fifaName.toUpperCase()}
        </h3>
        <span style={{ flex: 1 }} />
        <span className="ps-display" style={{ fontSize: "var(--display-sm)", flex: "0 0 auto" }}>{s.matches}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-3)" }}>
        <span style={{ fontSize: "var(--text-xs)", color: finalHost ? "var(--chalk-85)" : "var(--chalk-60)" }}>
          {s.localName}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.06em", color: "var(--chalk-60)" }}>MATCHES</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-4)", marginTop: 14 }}>
        <div>
          <div className="ps-label" style={{ marginBottom: 2 }}>City</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--goalpost)" }}>
            {s.city}, {s.region}
          </div>
        </div>
        <div>
          <div className="ps-label" style={{ marginBottom: 2 }}>Capacity</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--goalpost)" }}>
            {num(s.capacity)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.04em", color: "var(--chalk-60)", marginTop: 10 }}>
        {meta}
      </div>

      {s.blurb && (
        <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.5, color: finalHost ? "var(--chalk-85)" : "var(--chalk-60)", margin: "12px 0 0" }}>
          {s.blurb}
        </p>
      )}

      <div style={{ marginTop: "auto" }}>
        <StageChips stages={s.stages} />
      </div>
    </article>
  );
}

function CountrySection({ c }) {
  return (
    <section style={{ marginTop: "var(--sp-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap", paddingBottom: 10, borderBottom: "1px solid var(--chalk-rule)" }}>
        <Flag code={c.flag} size={22} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-sm)", letterSpacing: "0.04em", color: "var(--goalpost)", margin: 0 }}>
          {c.country.toUpperCase()}
        </h2>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--chalk-60)" }}>
          {c.venues} {c.venues === 1 ? "venue" : "venues"} · {c.matches} matches · {num(c.capacity)} seats
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-4)", marginTop: "var(--sp-4)" }}>
        {c.stadiums.map((s) => (
          <StadiumCard key={s.id} s={s} />
        ))}
      </div>
    </section>
  );
}

export default function Stadiums() {
  const { data, loading, error } = useFetch("/api/stadiums");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const venues = data.countries.reduce((n, c) => n + c.venues, 0);
  const matches = data.countries.reduce((n, c) => n + c.matches, 0);

  return (
    <PageShell label="Stadiums index">
      <h1 className="ps-title">STADIUMS</h1>
      <p className="ps-subtitle" style={{ marginBottom: 4 }}>
        {venues} venues across three host countries staged the {matches} matches. Names are the
        sponsor-free ones FIFA used during the tournament.
      </p>
      {data.countries.map((c) => (
        <CountrySection key={c.country} c={c} />
      ))}
    </PageShell>
  );
}
