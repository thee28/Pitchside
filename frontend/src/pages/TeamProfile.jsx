import { Link, useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading } from "../components/Page";
import { initials } from "../theme";

const dotColor = (q) => (q === "q" ? "var(--goalpost)" : q === "t" ? "var(--chalk-border)" : "var(--elim-dot)");

const radarPts = (vals) =>
  vals
    .map((v, i) => {
      const a = ((-90 + i * 60) * Math.PI) / 180;
      const r = (86 * v) / 100;
      return `${(120 + r * Math.cos(a)).toFixed(1)},${(120 + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(" ");

const RADAR_LABELS = [
  { t: "Possession", style: { left: "50%", top: "calc(14.4% - 8px)", transform: "translate(-50%,-100%)" } },
  { t: "Pressing", style: { left: "calc(75.7% + 8px)", top: "32.2%", transform: "translateY(-50%)" } },
  { t: "Agression", style: { left: "calc(75.7% + 8px)", top: "67.8%", transform: "translateY(-50%)" } },
  { t: "Tempo", style: { left: "50%", top: "calc(85.6% + 8px)", transform: "translateX(-50%)" } },
  { t: "Width", style: { right: "calc(75.7% + 8px)", top: "67.8%", transform: "translateY(-50%)" } },
  { t: "Patience", style: { right: "calc(75.7% + 8px)", top: "32.2%", transform: "translateY(-50%)" } },
];

function Radar({ values }) {
  const axes = RADAR_LABELS.map((_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return { x: (120 + 86 * Math.cos(a)).toFixed(1), y: (120 + 86 * Math.sin(a)).toFixed(1) };
  });
  return (
    <div style={{ position: "relative", flex: "0 0 auto", width: 260, maxWidth: "100%", padding: "22px 44px" }}>
      <svg viewBox="24 24 192 192" style={{ width: "100%", display: "block" }}>
        {[100, 66, 33].map((ring, i) => (
          <polygon
            key={ring}
            points={radarPts(Array(6).fill(ring))}
            fill="none"
            stroke="rgba(250,250,247,0.35)"
            strokeWidth={i === 0 ? 0.75 : 0.5}
          />
        ))}
        {axes.map((ax) => (
          <line key={`${ax.x}-${ax.y}`} x1="120" y1="120" x2={ax.x} y2={ax.y} stroke="rgba(250,250,247,0.35)" strokeWidth="0.5" />
        ))}
        <polygon points={radarPts(values)} fill="var(--chalk-wash)" stroke="var(--goalpost)" strokeWidth="1.5" />
      </svg>
      {RADAR_LABELS.map((l) => (
        <span
          key={l.t}
          style={{
            position: "absolute",
            whiteSpace: "nowrap",
            fontSize: "var(--text-2xs)",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--chalk-70)",
            ...l.style,
          }}
        >
          {l.t}
        </span>
      ))}
    </div>
  );
}

const chipStyle = (res) => ({
  fontSize: "var(--text-2xs)",
  fontWeight: 500,
  letterSpacing: "0.04em",
  padding: "2px 7px",
  color: res === "W" ? "var(--win-fg)" : res === "D" ? "var(--draw-fg)" : "var(--loss-fg)",
  background: res === "W" ? "var(--win-bg)" : res === "D" ? "var(--draw-bg)" : "var(--loss-bg)",
});

function KeyPlayer({ player }) {
  const navigate = useNavigate();
  return (
    <button className="ps-card ps-card-btn" onClick={() => navigate(`/players/${player.id}`, { viewTransition: true })} style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "var(--chalk-fill)",
            color: "var(--goalpost)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--text-md)",
            fontWeight: 700,
            flex: "0 0 auto",
          }}
        >
          {initials(player.name)}
        </span>
        <span>
          <span style={{ display: "block", fontSize: "var(--text-base)", fontWeight: 500, color: "var(--chalk)" }}>{player.name}</span>
          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--chalk-60)", marginTop: 1 }}>{player.pos}</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
        {[
          [player.goals, "GOALS"],
          [player.assists, "ASSISTS"],
          [player.rating.toFixed(1), "RATING"],
        ].map(([val, label]) => (
          <span key={label}>
            <span className="ps-display" style={{ display: "block", fontSize: 24 }}>{val}</span>
            <span style={{ display: "block", fontSize: "var(--text-2xs)", letterSpacing: "0.06em", color: "var(--chalk-60)", marginTop: 3 }}>{label}</span>
          </span>
        ))}
      </div>
    </button>
  );
}

export default function TeamProfile() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/api/teams/${id}`);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const champ = data.fate === "World Champions" || data.status?.startsWith("World Champions");
  const ink = champ ? "var(--chalk)" : "var(--ink)";
  const muted = champ ? "var(--chalk-85)" : "var(--ink-60)";

  return (
    <div data-screen-label="Team profile" className="ps-page" style={{ maxWidth: "none", padding: 0 }}>
      <div style={{ background: champ ? "var(--gold)" : "var(--chalk)", borderBottom: `var(--border-card) solid ${champ ? "var(--chalk)" : "var(--pitch-deep)"}` }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "var(--sp-5) var(--sp-6) 26px" }}>
          <Link to="/teams" viewTransition className={champ ? "ps-backlink" : "ps-backlink ps-light"} style={{ color: muted }}>
            <span className="ps-link-arrow">←</span> All teams
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginTop: 14 }}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>{data.flag}</span>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,40px)", lineHeight: 1, letterSpacing: "0.04em", color: ink, fontWeight: 400 }}>
                {data.name.toUpperCase()}
              </h1>
              <div style={{ fontSize: "var(--text-sm)", color: muted, marginTop: 4 }}>{data.sub}</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.08em", color: muted }}>FINAL PLACING</div>
              <div style={{ fontSize: "var(--text-md)", color: muted, marginTop: 3 }}>{data.status}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "22px var(--sp-6) 56px" }}>
        <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", alignItems: "stretch" }}>
          <section className="ps-card" style={{ flex: "1 1 340px", minWidth: 300 }}>
            <h2 className="ps-label">Playing style</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", alignItems: "center", marginTop: "var(--sp-2)" }}>
              <Radar values={data.radar} />
              <div style={{ maxWidth: 520, fontSize: "var(--text-md)", lineHeight: 1.6, color: "var(--goalpost)", textAlign: "center" }}>{data.blurb}</div>
            </div>
          </section>
          <section className="ps-card" style={{ flex: "1 1 340px", minWidth: 300 }}>
            <h2 className="ps-label" style={{ marginBottom: "var(--sp-2)" }}>Group {data.group} · final table</h2>
            {data.groupRows.map((r) => (
              <div key={r.code} style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "9px 0", borderTop: "0.5px solid var(--chalk-rule)", fontSize: "var(--text-sm)", color: "var(--goalpost)" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotColor(r.q), flex: "0 0 auto" }} />
                <span style={{ fontSize: 15, lineHeight: 1 }}>{r.flag}</span>
                <span style={{ fontWeight: 500 }}>{r.name}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--chalk-60)" }}>{r.gd} GD</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--chalk)", whiteSpace: "nowrap", minWidth: 38, textAlign: "right" }}>{r.pts} pts</span>
              </div>
            ))}
            <div style={{ marginTop: "var(--sp-4)" }}>
              <h2 className="ps-label" style={{ marginBottom: "var(--sp-3)" }}>Tournament metrics</h2>
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
                        background: label.includes("conceded") ? "var(--gold)" : "var(--goalpost)",
                        transformOrigin: "left",
                        animation: "psBar var(--dur-slow) var(--ease-out)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="ps-card" style={{ marginTop: "var(--sp-5)" }}>
          <h2 className="ps-label" style={{ marginBottom: "var(--sp-3)" }}>Tournament run</h2>
          <div style={{ display: "flex", gap: "var(--sp-3)", overflowX: "auto", paddingBottom: 6 }}>
            {data.matches.map((m) => (
              <div key={`${m.stage}-${m.oppCode}`} style={{ flex: "0 0 auto", minWidth: 132, background: "var(--pitch-dark)", border: "0.5px solid var(--chalk-rule)", padding: "12px 14px" }}>
                <div className="ps-th">{m.stage}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: "var(--sp-2)" }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{m.oppFlag}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--goalpost)" }}>{m.oppCode}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-2)", marginTop: 6 }}>
                  <span className="ps-display" style={{ fontSize: 24 }}>{m.score}</span>
                  <span style={chipStyle(m.res)}>{m.res}</span>
                </div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--chalk-60)", marginTop: 5 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: "var(--sp-5)" }}>
          <h2 className="ps-label" style={{ marginBottom: "var(--sp-3)" }}>Key players</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
            {data.keyPlayers.map((p) => (
              <KeyPlayer key={p.id} player={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
