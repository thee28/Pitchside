import { Link, useParams } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { C, F } from "../theme";

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

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
      <Link to={backTo} style={{ textDecoration: "none", fontFamily: F.sans, fontSize: 12, color: "rgba(250,250,247,0.62)" }}>
        ← {backLabel}
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginTop: 16 }}>
        <span style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(250,250,247,0.18)", color: C.goalpostWhite, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>
          {initials(data.name)}
        </span>
        <div>
          <div style={{ fontFamily: F.display, fontSize: "clamp(28px,5vw,40px)", lineHeight: 1, letterSpacing: "0.03em", color: C.chalk }}>{data.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(250,250,247,0.62)", marginTop: 5 }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>{data.flag}</span>
            <span>{data.teamName}</span>
            <span>·</span>
            <span>{data.pos}</span>
            <span>·</span>
            <span style={{ fontFamily: F.mono }}>#{data.num}</span>
          </div>
        </div>
      </div>
      {data.note && (
        <div style={{ marginTop: 14, display: "inline-block", background: C.chalk, border: `1.5px solid ${C.deepPitch}`, color: C.turfShadow, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "5px 10px" }}>
          {data.note}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginTop: 20 }}>
        {tiles.map(([value, label]) => (
          <div key={label} style={{ background: C.deepPitch, border: "1.5px solid rgba(250,250,247,0.55)", padding: "16px 20px" }}>
            <div style={{ fontFamily: F.display, fontSize: 36, lineHeight: 1, color: C.goalpostWhite }}>{value}</div>
            <div style={{ ...labelStyle, marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20, alignItems: "stretch" }}>
        <div style={{ flex: "1 1 340px", minWidth: 300, ...card }}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>Performance</div>
          {data.bars.map(([label, val, pct]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.goalpostWhite }}>{label}</span>
                <span style={{ fontFamily: F.mono, fontSize: 12, color: "rgba(250,250,247,0.62)" }}>{val}</span>
              </div>
              <div style={{ height: 5, background: "rgba(250,250,247,0.18)" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: pct < 50 ? C.gold : C.goalpostWhite,
                    transformOrigin: "left",
                    animation: "psBar 600ms ease-out",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: "1 1 340px", minWidth: 300, ...card }}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>Tournament form · match ratings</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 130, padding: "0 6px" }}>
            {data.form.map((f) => (
              <div key={f.opp} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: "rgba(250,250,247,0.62)" }}>{f.rating.toFixed(1)}</span>
                <div
                  style={{
                    width: 26,
                    height: Math.round((f.rating / 10) * 84),
                    background: f.rating >= 7.5 ? C.goalpostWhite : C.gold,
                    transformOrigin: "bottom",
                    animation: "psBarV 600ms ease-out",
                  }}
                />
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.04em", color: "rgba(250,250,247,0.62)" }}>{f.opp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
