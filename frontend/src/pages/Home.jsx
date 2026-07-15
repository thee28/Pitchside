import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { C, F } from "../theme";

const SPECIAL_FATES = new Set(["World Champions", "Runners-up", "Third place", "Fourth place"]);
const GROUPS = "ABCDEFGHIJKL".split("");

const dotColor = (q) =>
  q === "q" ? C.goalpostWhite : q === "t" ? "rgba(250,250,247,0.55)" : "rgba(28,26,22,0.4)";

const labelStyle = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(250,250,247,0.62)",
};

const card = {
  background: C.deepPitch,
  border: "1.5px solid rgba(250,250,247,0.55)",
  padding: "20px 22px",
};

function Hero({ hero }) {
  const s = hero.stats || {};
  const scorers = hero.scorers || { home: [], away: [] };
  return (
    <div style={{ background: C.chalk, border: `1.5px solid ${C.deepPitch}`, padding: "28px 32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.deepPitch }}>FULL TIME</span>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(46,66,40,0.62)" }}>
          WORLD CUP FINAL{s.venueLong ? ` · ${s.venueLong}` : ""}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: F.mono, fontSize: 13, color: C.turfShadow }}>{hero.dateLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(20px,5vw,56px)", flexWrap: "wrap", padding: "26px 0 6px" }}>
        <Link to="/teams/fra" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>{hero.home.flag}</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: C.turfShadow }}>{hero.home.name.toUpperCase()}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: C.chalk, padding: "3px 8px", backgroundColor: C.gold }}>WORLD CHAMPIONS</span>
        </Link>
        <div style={{ fontFamily: F.display, fontSize: "clamp(48px,8vw,64px)", lineHeight: 1, color: C.turfShadow, letterSpacing: "0.05em" }}>
          {hero.homeScore} – {hero.awayScore}
        </div>
        <Link to="/teams/arg" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 44, lineHeight: 1 }}>{hero.away.flag}</span>
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(46,66,40,0.6)" }}>{hero.away.name.toUpperCase()}</span>
          <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.14em", color: "rgba(46,66,40,0.55)" }}>RUNNERS-UP</span>
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "start", paddingBottom: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "rgba(46,66,40,0.62)" }}>
          {scorers.home.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, lineHeight: 1, color: "rgba(46,66,40,0.62)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "rgba(46,66,40,0.62)", textAlign: "right" }}>
          {scorers.away.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </div>
      {s.possession && (
        <div style={{ borderTop: "1px solid rgba(46,66,40,0.2)", paddingTop: 16, display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "2 1 260px", minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(46,66,40,0.62)", marginBottom: 6 }}>
              <span>{s.possession[0]}%</span>
              <span>POSSESSION</span>
              <span>{s.possession[1]}%</span>
            </div>
            <div style={{ display: "flex", gap: 2, height: 5 }}>
              <div style={{ width: `${s.possession[0]}%`, background: s.colors[0] }} />
              <div style={{ width: `${s.possession[1]}%`, background: s.colors[1] }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              ["SHOTS", s.shots],
              ["ON TARGET", s.onTarget],
              ["XG", s.xg],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(46,66,40,0.62)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: F.mono, fontSize: 13, color: C.turfShadow }}>{val}</div>
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
  const cell = { fontFamily: F.mono, fontSize: 12, color: "rgba(250,250,247,0.62)", textAlign: "center" };
  const grid = { display: "grid", gridTemplateColumns: "1fr repeat(6, minmax(28px, 40px))", gap: "0 4px", alignItems: "center" };

  return (
    <div style={{ flex: "2 1 460px", minWidth: 320, display: "flex", flexDirection: "column", ...card }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={labelStyle}>Final group standings</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {GROUPS.map((l) => (
            <button
              key={l}
              onClick={() => setGroup(l)}
              style={{
                background: group === l ? C.goalpostWhite : "none",
                color: group === l ? C.turfShadow : "rgba(250,250,247,0.6)",
                border: "none",
                cursor: "pointer",
                fontFamily: F.sans,
                fontSize: 11,
                fontWeight: 500,
                width: 22,
                height: 22,
                padding: 0,
                lineHeight: "22px",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={grid}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(250,250,247,0.62)", padding: "6px 0" }}>TEAM</div>
        {["P", "W", "D", "L", "GD", "PTS"].map((h) => (
          <div key={h} style={{ fontSize: 10, fontWeight: 500, color: "rgba(250,250,247,0.62)", textAlign: "center" }}>{h}</div>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.code} style={{ ...grid, borderTop: "0.5px solid rgba(250,250,247,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", fontSize: 12, color: C.goalpostWhite }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotColor(r.q), flex: "0 0 auto" }} />
            <span style={{ fontSize: 15, lineHeight: 1 }}>{r.flag}</span>
            <span style={{ fontWeight: 500 }}>{r.name}</span>
          </div>
          <div style={cell}>{r.p}</div>
          <div style={cell}>{r.w}</div>
          <div style={cell}>{r.d}</div>
          <div style={cell}>{r.l}</div>
          <div style={cell}>{r.gd}</div>
          <div style={{ ...cell, fontWeight: 500, color: C.chalk }}>{r.pts}</div>
        </div>
      ))}
      <div style={{ marginTop: 22, paddingTop: 16, borderTop: "0.5px solid rgba(250,250,247,0.25)" }}>
        <div style={labelStyle}>Knockout run</div>
        {runs.map((k) => (
          <div key={k.code} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: "0.5px solid rgba(250,250,247,0.15)" }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>{k.flag}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.goalpostWhite }}>{k.name}</span>
            <span style={{ flex: 1, borderBottom: "1px dotted rgba(250,250,247,0.3)", margin: "0 4px" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: SPECIAL_FATES.has(k.fate) ? 700 : 500,
                color: k.code === "FRA" ? C.gold : SPECIAL_FATES.has(k.fate) ? C.chalk : "rgba(250,250,247,0.62)",
              }}
            >
              {k.fate}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: "auto", paddingTop: 16, fontSize: 10, color: "rgba(250,250,247,0.62)" }}>
        {[
          ["Advanced", C.goalpostWhite],
          ["Best third", "rgba(250,250,247,0.55)"],
          ["Eliminated", "rgba(28,26,22,0.4)"],
        ].map(([label, color]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function KnockoutResults({ koResults }) {
  const navigate = useNavigate();
  return (
    <div style={{ flex: "1 1 300px", minWidth: 280, ...card }}>
      <div style={{ ...labelStyle, marginBottom: 6 }}>Knockout results</div>
      {koResults.map((u) => (
        <div key={u.teams} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: "0.5px solid rgba(250,250,247,0.25)" }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{u.fa}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.goalpostWhite }}>{u.teams}</span>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{u.fb}</span>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.04em", color: C.goalpostWhite, background: "rgba(250,250,247,0.16)", padding: "2px 6px" }}>{u.stage}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "rgba(250,250,247,0.62)", textAlign: "right" }}>{u.when}</span>
        </div>
      ))}
      <button
        onClick={() => navigate("/bracket")}
        style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: F.sans, fontSize: 12, fontWeight: 500, color: C.goalpostWhite }}
      >
        View full bracket →
      </button>
    </div>
  );
}

export default function Home() {
  const { data, loading, error } = useFetch("/api/home");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Home / Final result">
      <Hero hero={data.hero} />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20, alignItems: "stretch" }}>
        <Standings groups={data.groups} />
        <KnockoutResults koResults={data.koResults} />
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}>
        {data.tourStats.map((t) => (
          <div key={t.label} style={{ flex: "1 1 200px", minWidth: 180, background: C.deepPitch, border: "1.5px solid rgba(250,250,247,0.55)", padding: "18px 22px" }}>
            <div style={{ fontFamily: F.display, fontSize: 36, lineHeight: 1, color: C.goalpostWhite }}>{t.value}</div>
            <div style={{ ...labelStyle, marginTop: 6 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
