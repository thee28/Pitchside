import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { C, F } from "../theme";

const MEDALS = [C.gold, "#A9AFA6", "#BC8A62"];

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Podium({ p, medal }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => navigate(`/players/${p.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: medal,
        border: `1.5px solid ${hover ? C.chalk : "rgba(250,250,247,0.7)"}`,
        padding: "18px 20px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: F.sans,
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "border-color 150ms",
      }}
    >
      <span style={{ fontFamily: F.display, fontSize: 36, lineHeight: 1, color: "rgba(250,250,247,0.6)" }}>{p.rank}</span>
      <span style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(250,250,247,0.18)", color: C.goalpostWhite, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
        {initials(p.name)}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.chalk }}>{p.name}</span>
        <span style={{ display: "block", fontSize: 11, color: "rgba(250,250,247,0.62)", marginTop: 1 }}>
          {p.flag} {p.teamName}
        </span>
      </span>
      <span style={{ textAlign: "right" }}>
        <span style={{ display: "block", fontFamily: F.display, fontSize: 36, lineHeight: 1, color: C.goalpostWhite }}>{p.goals}</span>
        <span style={{ display: "block", fontSize: 10, letterSpacing: "0.06em", color: "rgba(250,250,247,0.62)" }}>GOALS</span>
      </span>
    </button>
  );
}

function BoardRow({ r }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => navigate(`/players/${r.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr repeat(3, minmax(40px, 56px))",
        gap: "0 8px",
        alignItems: "center",
        width: "100%",
        background: hover ? "rgba(250,250,247,0.12)" : "none",
        border: "none",
        borderTop: "0.5px solid rgba(250,250,247,0.25)",
        padding: "9px 0",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: F.sans,
        transition: "background 150ms",
      }}
    >
      <span style={{ fontFamily: F.mono, fontSize: 12, color: "rgba(250,250,247,0.62)" }}>{r.rank}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>{r.flag}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.goalpostWhite, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
        <span style={{ fontSize: 11, color: "rgba(250,250,247,0.6)", whiteSpace: "nowrap" }}>{r.teamName}</span>
      </span>
      <span style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 500, color: C.chalk, textAlign: "center" }}>{r.goals}</span>
      <span style={{ fontFamily: F.mono, fontSize: 12, color: "rgba(250,250,247,0.62)", textAlign: "center" }}>{r.assists}</span>
      <span style={{ fontFamily: F.mono, fontSize: 12, color: "rgba(250,250,247,0.62)", textAlign: "center" }}>{r.mins}′</span>
    </button>
  );
}

export default function Leaders() {
  const { data, loading, error } = useFetch("/api/leaders");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Stats leaders">
      <div style={{ fontSize: 20, fontWeight: 500, color: C.chalk }}>Golden Boot (Top scorer)</div>
      <div style={{ fontSize: 13, color: "rgba(250,250,247,0.62)", margin: "4px 0 20px" }}>
        104 matches played. Mbappé’s nine goals take the boot.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        {data.board.slice(0, 3).map((p, i) => (
          <Podium key={p.id} p={p} medal={MEDALS[i]} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>
        <div style={{ flex: "2 1 460px", minWidth: 320, background: C.deepPitch, border: "1.5px solid rgba(250,250,247,0.55)", padding: "8px 22px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr repeat(3, minmax(40px, 56px))", gap: "0 8px", alignItems: "center", padding: "10px 0 6px" }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(250,250,247,0.62)" }}>#</div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", color: "rgba(250,250,247,0.62)" }}>PLAYER</div>
            {["G", "A", "MINS"].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 500, color: "rgba(250,250,247,0.62)", textAlign: "center" }}>{h}</div>
            ))}
          </div>
          {data.board.map((r) => (
            <BoardRow key={r.id} r={r} />
          ))}
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 260, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ flex: 1, background: C.deepPitch, border: "1.5px solid rgba(250,250,247,0.55)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(250,250,247,0.62)", marginBottom: 6 }}>Most assists</div>
            {data.assists.map((a) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 0", borderBottom: "0.5px solid rgba(250,250,247,0.25)" }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{a.flag}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.goalpostWhite }}>{a.name}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: F.display, fontSize: 22, lineHeight: 1, color: C.goalpostWhite }}>{a.n}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, background: C.chalk, border: `1.5px solid ${C.deepPitch}`, padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", color: "rgba(46,66,40,0.62)" }}>TOURNAMENT AWARDS</div>
            {data.awards.map((aw) => (
              <div key={aw.award} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(46,66,40,0.15)" }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{aw.flag}</span>
                <span>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.turfShadow }}>{aw.name}</span>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(46,66,40,0.62)", marginTop: 1 }}>{aw.award}</span>
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "rgba(46,66,40,0.6)" }}>{aw.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
