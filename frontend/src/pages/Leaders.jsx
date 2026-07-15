import { useNavigate } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { initials } from "../theme";

const MEDALS = ["var(--gold)", "var(--silver)", "var(--bronze)"];

function Podium({ p, medal }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/players/${p.id}`, { viewTransition: true })}
      className="ps-card-btn"
      style={{
        background: medal,
        border: "var(--border-card) solid var(--chalk-70)",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-lg)", lineHeight: 1, color: "var(--chalk-60)" }}>{p.rank}</span>
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
        {initials(p.name)}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--text-base)", fontWeight: 500, color: "var(--chalk)" }}>{p.name}</span>
        <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--chalk-60)", marginTop: 1 }}>
          {p.flag} {p.teamName}
        </span>
      </span>
      <span style={{ textAlign: "right" }}>
        <span className="ps-display" style={{ display: "block", fontSize: "var(--display-lg)" }}>{p.goals}</span>
        <span style={{ display: "block", fontSize: "var(--text-2xs)", letterSpacing: "0.06em", color: "var(--chalk-60)" }}>GOALS</span>
      </span>
    </button>
  );
}

const boardGrid = { display: "grid", gridTemplateColumns: "28px 1fr repeat(3, minmax(40px, 56px))", gap: "0 8px", alignItems: "center" };

function BoardRow({ r }) {
  const navigate = useNavigate();
  return (
    <button className="ps-row-btn" onClick={() => navigate(`/players/${r.id}`, { viewTransition: true })} style={{ ...boardGrid, padding: "9px 0" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--chalk-60)" }}>{r.rank}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>{r.flag}</span>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--goalpost)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {r.name}
        </span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--chalk-60)", whiteSpace: "nowrap" }}>{r.teamName}</span>
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--chalk)", textAlign: "center" }}>{r.goals}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--chalk-60)", textAlign: "center" }}>{r.assists}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--chalk-60)", textAlign: "center" }}>{r.mins}′</span>
    </button>
  );
}

export default function Leaders() {
  const { data, loading, error } = useFetch("/api/leaders");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Stats leaders">
      <h1 className="ps-title">GOLDEN BOOT</h1>
      <p className="ps-subtitle" style={{ marginBottom: "var(--sp-5)" }}>
        104 matches played. Mbappé’s nine goals take the boot.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
        {data.board.slice(0, 3).map((p, i) => (
          <Podium key={p.id} p={p} medal={MEDALS[i]} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap", alignItems: "stretch" }}>
        <section className="ps-card" style={{ flex: "2 1 460px", minWidth: 320, padding: "8px 22px 16px" }}>
          <div style={{ ...boardGrid, padding: "10px 0 6px" }}>
            <div className="ps-th">#</div>
            <div className="ps-th">PLAYER</div>
            {["G", "A", "MINS"].map((h) => (
              <div key={h} className="ps-th" style={{ textAlign: "center" }}>{h}</div>
            ))}
          </div>
          {data.board.map((r) => (
            <BoardRow key={r.id} r={r} />
          ))}
        </section>
        <div style={{ flex: "1 1 280px", minWidth: 260, display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
          <section className="ps-card" style={{ flex: 1 }}>
            <h2 className="ps-label" style={{ marginBottom: 6 }}>Most assists</h2>
            {data.assists.map((a) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 0", borderBottom: "0.5px solid var(--chalk-rule)" }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{a.flag}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--goalpost)" }}>{a.name}</span>
                <span style={{ flex: 1 }} />
                <span className="ps-display" style={{ fontSize: "var(--display-sm)" }}>{a.n}</span>
              </div>
            ))}
          </section>
          <section className="ps-card--light ps-light" style={{ flex: 1, padding: "var(--sp-5) 22px" }}>
            <h2 className="ps-label ps-label--ink" style={{ fontSize: "var(--text-2xs)", letterSpacing: "0.08em" }}>Tournament awards</h2>
            {data.awards.map((aw) => (
              <div key={aw.award} style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", padding: "10px 0", borderBottom: "1px solid var(--ink-rule)" }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{aw.flag}</span>
                <span>
                  <span style={{ display: "block", fontSize: "var(--text-md)", fontWeight: 700, color: "var(--ink)" }}>{aw.name}</span>
                  <span style={{ display: "block", fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-60)", marginTop: 1 }}>
                    {aw.award}
                  </span>
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-60)" }}>{aw.detail}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
