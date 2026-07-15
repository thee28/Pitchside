import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading } from "../components/Page";
import { C, F } from "../theme";

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
        <polygon points={radarPts(values)} fill="rgba(250,250,247,0.22)" stroke={C.goalpostWhite} strokeWidth="1.5" />
      </svg>
      {RADAR_LABELS.map((l) => (
        <span
          key={l.t}
          style={{
            position: "absolute",
            whiteSpace: "nowrap",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "rgba(250,250,247,0.7)",
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
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.04em",
  padding: "2px 7px",
  color: res === "W" ? "#CFE6BE" : res === "D" ? "#F0D9A0" : "#F2B3A0",
  background:
    res === "W" ? "rgba(207,230,190,0.16)" : res === "D" ? "rgba(240,217,160,0.14)" : "rgba(242,179,160,0.16)",
});

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function KeyPlayer({ player }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => navigate(`/players/${player.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.deepPitch,
        border: `1.5px solid ${hover ? C.chalk : "rgba(250,250,247,0.55)"}`,
        padding: "18px 20px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: F.sans,
        transition: "border-color 150ms",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(250,250,247,0.18)", color: C.goalpostWhite, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
          {initials(player.name)}
        </span>
        <span>
          <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.chalk }}>{player.name}</span>
          <span style={{ display: "block", fontSize: 11, color: "rgba(250,250,247,0.62)", marginTop: 1 }}>{player.pos}</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
        {[
          [player.goals, "GOALS"],
          [player.assists, "ASSISTS"],
          [player.rating.toFixed(1), "RATING"],
        ].map(([val, label]) => (
          <span key={label}>
            <span style={{ display: "block", fontFamily: F.display, fontSize: 24, lineHeight: 1, color: C.goalpostWhite }}>{val}</span>
            <span style={{ display: "block", fontSize: 10, letterSpacing: "0.06em", color: "rgba(250,250,247,0.62)", marginTop: 3 }}>{label}</span>
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
  const ink = champ ? C.chalk : C.turfShadow;
  const muted = champ ? "rgba(250,250,247,0.85)" : "rgba(46,66,40,0.62)";

  return (
    <div data-screen-label="Team profile" style={{ position: "relative" }}>
      <div style={{ background: champ ? C.gold : C.chalk, borderBottom: champ ? `1.5px solid ${C.chalk}` : `1.5px solid ${C.deepPitch}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 24px 26px" }}>
          <Link to="/teams" style={{ textDecoration: "none", fontFamily: F.sans, fontSize: 12, color: muted }}>
            ← All teams
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginTop: 14 }}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>{data.flag}</span>
            <div>
              <div style={{ fontFamily: F.display, fontSize: "clamp(28px,5vw,40px)", lineHeight: 1, letterSpacing: "0.04em", color: ink }}>
                {data.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{data.sub}</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", color: muted }}>FINAL PLACING</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 3 }}>{data.status}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "22px 24px 56px" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>
          <div style={{ flex: "1 1 340px", minWidth: 300, ...card }}>
            <div style={labelStyle}>Playing style</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", marginTop: 8 }}>
              <Radar values={data.radar} />
              <div style={{ maxWidth: 520, fontSize: 13, lineHeight: 1.6, color: C.goalpostWhite, textAlign: "center" }}>{data.blurb}</div>
            </div>
          </div>
          <div style={{ flex: "1 1 340px", minWidth: 300, ...card }}>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Group {data.group} · final table</div>
            {data.groupRows.map((r) => (
              <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderTop: "0.5px solid rgba(250,250,247,0.25)", fontSize: 12, color: C.goalpostWhite }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotColor(r.q), flex: "0 0 auto" }} />
                <span style={{ fontSize: 15, lineHeight: 1 }}>{r.flag}</span>
                <span style={{ fontWeight: 500 }}>{r.name}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: F.mono, color: "rgba(250,250,247,0.62)" }}>{r.gd} GD</span>
                <span style={{ fontFamily: F.mono, fontWeight: 500, color: C.chalk, whiteSpace: "nowrap", minWidth: 38, textAlign: "right" }}>{r.pts} pts</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Tournament metrics</div>
              {data.bars.map(([label, val, pct]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.goalpostWhite }}>{label}</span>
                    <span style={{ fontFamily: F.mono, fontSize: 12, color: "rgba(250,250,247,0.62)" }}>{val}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(250,250,247,0.18)" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: label.includes("conceded") ? C.gold : C.goalpostWhite,
                        transformOrigin: "left",
                        animation: "psBar 600ms ease-out",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, ...card }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Tournament run</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
            {data.matches.map((m) => (
              <div key={`${m.stage}-${m.oppCode}`} style={{ flex: "0 0 auto", minWidth: 132, background: "#3E5A35", border: "0.5px solid rgba(250,250,247,0.25)", padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(250,250,247,0.62)" }}>{m.stage}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{m.oppFlag}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.goalpostWhite }}>{m.oppCode}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: F.display, fontSize: 24, lineHeight: 1, color: C.goalpostWhite }}>{m.score}</span>
                  <span style={chipStyle(m.res)}>{m.res}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(250,250,247,0.62)", marginTop: 5 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Key players</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {data.keyPlayers.map((p) => (
              <KeyPlayer key={p.id} player={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
