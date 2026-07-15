import { Link, useParams } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { initials } from "../theme";

export default function Player() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/api/players/${id}`);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const backTo = data.teamId ? `/teams/${data.teamId}` : "/leaders";
  const backLabel = data.teamId ? data.teamName : "Leaders";
  const tiles = [
    [data.goals, "Goals"],
    [data.assists, "Assists"],
    [data.rating.toFixed(1), "Avg rating"],
    [`${data.mins}′`, "Minutes"],
  ];

  return (
    <PageShell label="Player page">
      <Link to={backTo} viewTransition className="ps-backlink">
        <span className="ps-link-arrow">←</span> {backLabel}
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginTop: "var(--sp-4)" }}>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--chalk-fill)",
            color: "var(--goalpost)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {initials(data.name)}
        </span>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,40px)", lineHeight: 1, letterSpacing: "0.03em", color: "var(--chalk)", fontWeight: 400 }}>
            {data.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", fontSize: "var(--text-sm)", color: "var(--chalk-60)", marginTop: 5 }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>{data.flag}</span>
            <span>{data.teamName}</span>
            <span>·</span>
            <span>{data.pos}</span>
            <span>·</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>#{data.num}</span>
          </div>
        </div>
      </div>
      {data.note && (
        <div
          className="ps-card--light"
          style={{ marginTop: 14, display: "inline-block", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.06em", padding: "5px 10px" }}
        >
          {data.note}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--sp-4)", marginTop: "var(--sp-5)" }}>
        {tiles.map(([value, label]) => (
          <div key={label} className="ps-card" style={{ padding: "16px 20px" }}>
            <div className="ps-display" style={{ fontSize: "var(--display-lg)" }}>{value}</div>
            <div className="ps-label" style={{ marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", marginTop: "var(--sp-5)", alignItems: "stretch" }}>
        <section className="ps-card" style={{ flex: "1 1 340px", minWidth: 300 }}>
          <h2 className="ps-label" style={{ marginBottom: 14 }}>Performance</h2>
          {data.bars.map(([label, val, pct]) => (
            <div key={label} style={{ marginBottom: "var(--sp-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", marginBottom: 4 }}>
                <span style={{ color: "var(--goalpost)" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--chalk-60)" }}>{val}</span>
              </div>
              <div style={{ height: 5, background: "var(--chalk-fill)" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: pct < 50 ? "var(--gold)" : "var(--goalpost)",
                    transformOrigin: "left",
                    animation: "psBar var(--dur-slow) var(--ease-out)",
                  }}
                />
              </div>
            </div>
          ))}
        </section>
        <section className="ps-card" style={{ flex: "1 1 340px", minWidth: 300 }}>
          <h2 className="ps-label" style={{ marginBottom: 14 }}>Tournament form · match ratings</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 130, padding: "0 6px" }}>
            {data.form.map((f) => (
              <div key={f.opp} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--chalk-60)" }}>{f.rating.toFixed(1)}</span>
                <div
                  style={{
                    width: 26,
                    height: Math.round((f.rating / 10) * 84),
                    background: f.rating >= 7.5 ? "var(--goalpost)" : "var(--gold)",
                    transformOrigin: "bottom",
                    animation: "psBarV var(--dur-slow) var(--ease-out)",
                  }}
                />
                <span style={{ fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.04em", color: "var(--chalk-60)" }}>{f.opp}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
