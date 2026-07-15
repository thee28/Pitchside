import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";

const SPECIAL_FATES = new Set(["World Champions", "Runners-up", "Third place", "Fourth place"]);
const GROUPS = "ABCDEFGHIJKL".split("");

const dotColor = (q) => (q === "q" ? "var(--goalpost)" : q === "t" ? "var(--chalk-border)" : "var(--elim-dot)");

function Hero({ hero }) {
  const s = hero.stats || {};
  const scorers = hero.scorers || { home: [], away: [] };
  return (
    <div className="ps-card--light ps-light" style={{ padding: "28px 32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "0.1em", color: "var(--pitch-deep)" }}>FULL TIME</span>
        <span className="ps-label ps-label--ink">
          WORLD CUP FINAL{s.venueLong ? ` · ${s.venueLong}` : ""}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink)" }}>{hero.dateLabel}</span>
      </div>
      <div className="ps-hero-teams">
        <Link to="/teams/fra" viewTransition style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)" }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>{hero.home.flag}</span>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink)" }}>{hero.home.name.toUpperCase()}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "var(--chalk)", padding: "3px 8px", backgroundColor: "var(--gold)" }}>
            WORLD CHAMPIONS
          </span>
        </Link>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,64px)", lineHeight: 1, color: "var(--ink)", letterSpacing: "0.05em" }}>
          {hero.homeScore} – {hero.awayScore}
        </div>
        <Link to="/teams/arg" viewTransition style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)" }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>{hero.away.flag}</span>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, letterSpacing: "0.06em", color: "var(--ink-60)" }}>{hero.away.name.toUpperCase()}</span>
          <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", color: "var(--ink-45)" }}>RUNNERS-UP</span>
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "var(--sp-6)", alignItems: "start", paddingBottom: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "var(--text-sm)", color: "var(--ink-60)" }}>
          {scorers.home.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <span />
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "var(--text-sm)", color: "var(--ink-60)", textAlign: "right" }}>
          {scorers.away.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </div>
      {s.possession && (
        <div style={{ borderTop: "1px solid var(--ink-rule)", paddingTop: "var(--sp-4)", display: "flex", gap: "var(--sp-8)", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "2 1 260px", minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.06em", color: "var(--ink-60)", marginBottom: 6 }}>
              <span>{s.possession[0]}%</span>
              <span>POSSESSION</span>
              <span>{s.possession[1]}%</span>
            </div>
            <div style={{ display: "flex", gap: 2, height: 5 }}>
              <div style={{ width: `${s.possession[0]}%`, background: s.colors[0], transformOrigin: "left", animation: "psBar var(--dur-slow) var(--ease-out)" }} />
              <div style={{ width: `${s.possession[1]}%`, background: s.colors[1], transformOrigin: "right", animation: "psBar var(--dur-slow) var(--ease-out)" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              ["SHOTS", s.shots],
              ["ON TARGET", s.onTarget],
              ["XG", s.xg],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.06em", color: "var(--ink-60)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink)" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Standings({ groups }) {
  const [group, setGroup] = useState("I");
  const rows = groups[group] || [];
  const runs = rows.filter((r) => r.fate);
  const cell = { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--chalk-60)", textAlign: "center" };
  const grid = { display: "grid", gridTemplateColumns: "1fr repeat(6, minmax(28px, 40px))", gap: "0 4px", alignItems: "center" };

  return (
    <section className="ps-card" style={{ flex: "2 1 460px", minWidth: 320, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-4)", flexWrap: "wrap", marginBottom: 14 }}>
        <h2 className="ps-label">Final group standings</h2>
        <div style={{ flex: 1 }} />
        <div role="group" aria-label="Select group" style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {GROUPS.map((l) => (
            <button key={l} className="ps-pill" aria-pressed={group === l} onClick={() => setGroup(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={grid}>
        <div className="ps-th" style={{ padding: "6px 0" }}>TEAM</div>
        {["P", "W", "D", "L", "GD", "PTS"].map((h) => (
          <div key={h} className="ps-th" style={{ textAlign: "center" }}>{h}</div>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.code} style={{ ...grid, borderTop: "0.5px solid var(--chalk-rule)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "9px 0", fontSize: "var(--text-sm)", color: "var(--goalpost)" }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotColor(r.q), flex: "0 0 auto" }} />
            <span style={{ fontSize: 15, lineHeight: 1 }}>{r.flag}</span>
            <span style={{ fontWeight: 500 }}>{r.name}</span>
          </div>
          <div style={cell}>{r.p}</div>
          <div style={cell}>{r.w}</div>
          <div style={cell}>{r.d}</div>
          <div style={cell}>{r.l}</div>
          <div style={cell}>{r.gd}</div>
          <div style={{ ...cell, fontWeight: 500, color: "var(--chalk)" }}>{r.pts}</div>
        </div>
      ))}
      <div style={{ marginTop: 22, paddingTop: "var(--sp-4)", borderTop: "0.5px solid var(--chalk-rule)" }}>
        <h2 className="ps-label">Knockout run</h2>
        {runs.map((k) => (
          <div key={k.code} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "11px 0", borderBottom: "0.5px solid var(--chalk-rule-soft)" }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>{k.flag}</span>
            <span style={{ fontSize: "var(--text-md)", fontWeight: 500, color: "var(--goalpost)" }}>{k.name}</span>
            <span style={{ flex: 1, borderBottom: "1px dotted var(--chalk-rule)", margin: "0 4px" }} />
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: SPECIAL_FATES.has(k.fate) ? 700 : 500,
                color: k.code === "FRA" ? "var(--gold)" : SPECIAL_FATES.has(k.fate) ? "var(--chalk)" : "var(--chalk-60)",
              }}
            >
              {k.fate}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: "auto", paddingTop: "var(--sp-4)", fontSize: "var(--text-2xs)", color: "var(--chalk-60)" }}>
        {[
          ["Advanced", "var(--goalpost)"],
          ["Best third", "var(--chalk-border)"],
          ["Eliminated", "var(--elim-dot)"],
        ].map(([label, color]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function KnockoutResults({ koResults }) {
  const navigate = useNavigate();
  return (
    <section className="ps-card" style={{ flex: "1 1 300px", minWidth: 280 }}>
      <h2 className="ps-label" style={{ marginBottom: 6 }}>Knockout results</h2>
      {koResults.map((u) => (
        <div key={u.teams} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "11px 0", borderBottom: "0.5px solid var(--chalk-rule)" }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{u.fa}</span>
          <span style={{ fontSize: "var(--text-md)", fontWeight: 500, color: "var(--goalpost)" }}>{u.teams}</span>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{u.fb}</span>
          <span style={{ fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.04em", color: "var(--goalpost)", background: "var(--chalk-fill)", padding: "2px 6px" }}>
            {u.stage}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--chalk-60)", textAlign: "right" }}>{u.when}</span>
        </div>
      ))}
      <button className="ps-link" onClick={() => navigate("/bracket", { viewTransition: true })} style={{ marginTop: 14 }}>
        View full bracket <span className="ps-link-arrow">→</span>
      </button>
    </section>
  );
}

export default function Home() {
  const { data, loading, error } = useFetch("/api/home");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Home / Final result">
      <Hero hero={data.hero} />
      <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", marginTop: "var(--sp-5)", alignItems: "stretch" }}>
        <Standings groups={data.groups} />
        <KnockoutResults koResults={data.koResults} />
      </div>
      <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", marginTop: "var(--sp-5)" }}>
        {data.tourStats.map((t) => (
          <div key={t.label} className="ps-card" style={{ flex: "1 1 200px", minWidth: 180, padding: "18px 22px" }}>
            <div className="ps-display" style={{ fontSize: "var(--display-lg)" }}>{t.value}</div>
            <div className="ps-label" style={{ marginTop: 6 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
