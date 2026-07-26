import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useFetch } from "../api";

// Rating pill colour tiers, tuned for the cream card background.
function ratingStyle(r) {
  const base = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    padding: "2px 7px",
    minWidth: 34,
    textAlign: "center",
    lineHeight: 1.4,
  };
  if (r == null) return { ...base, color: "var(--ink-45)", background: "var(--ink-fill)" };
  if (r >= 8) return { ...base, color: "var(--chalk)", background: "var(--gold)" };
  if (r >= 7) return { ...base, color: "var(--chalk)", background: "var(--pitch-deep)" };
  return { ...base, color: "var(--ink-60)", background: "var(--ink-fill)" };
}

function PlayerRow({ p }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", padding: "6px 0", borderTop: "0.5px solid var(--ink-rule)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--ink-45)", width: 20, textAlign: "right", flex: "0 0 auto" }}>
        {p.num ?? "–"}
      </span>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: p.sub ? 400 : 500, color: p.sub ? "var(--ink-60)" : "var(--ink)" }}>
        {p.name}
      </span>
      {p.goals > 0 && (
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--ink-60)" }}>⚽{p.goals > 1 ? `×${p.goals}` : ""}</span>
      )}
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink-45)", flex: "0 0 auto" }}>{p.pos}</span>
      <span style={ratingStyle(p.rating)}>{p.rating != null ? p.rating.toFixed(1) : "–"}</span>
    </div>
  );
}

function LineupColumn({ team, players }) {
  const starters = players.filter((p) => !p.sub);
  const subs = players.filter((p) => p.sub);
  return (
    <div style={{ flex: "1 1 260px", minWidth: 240 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: 4 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{team.flag}</span>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.05em", color: "var(--ink)" }}>{team.name.toUpperCase()}</span>
      </div>
      {starters.map((p) => (
        <PlayerRow key={`${p.num}-${p.name}`} p={p} />
      ))}
      {subs.length > 0 && (
        <>
          <div className="ps-label ps-label--ink" style={{ marginTop: "var(--sp-3)", marginBottom: 2 }}>Substitutes</div>
          {subs.map((p) => (
            <PlayerRow key={`${p.num}-${p.name}`} p={p} />
          ))}
        </>
      )}
    </div>
  );
}

function Detail({ d }) {
  const homeWin = d.winner === d.home.code;
  const awayWin = d.winner === d.away.code;
  const s = d.stats || null;
  const scorers = d.scorers || { home: [], away: [] };
  const teamNameStyle = (win) => ({
    fontSize: "var(--text-sm)",
    fontWeight: win ? 700 : 500,
    letterSpacing: "0.06em",
    color: win ? "var(--ink)" : "var(--ink-60)",
  });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap", paddingRight: 32 }}>
        <span className="ps-label ps-label--ink">
          {d.stage}
          {d.venue ? ` · ${d.venue}` : ""}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink)" }}>{d.dateLabel}</span>
      </div>

      <div className="ps-hero-teams" style={{ marginTop: "var(--sp-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)" }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>{d.home.flag}</span>
          <span style={teamNameStyle(homeWin)}>{d.home.name.toUpperCase()}</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,7vw,56px)", lineHeight: 1, color: "var(--ink)", letterSpacing: "0.05em" }}>
            {d.homeScore} – {d.awayScore}
          </div>
          {d.note && (
            <div style={{ fontSize: "var(--text-2xs)", fontWeight: 600, letterSpacing: "0.08em", color: "var(--ink-60)", marginTop: 6 }}>
              {d.note.toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-2)" }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>{d.away.flag}</span>
          <span style={teamNameStyle(awayWin)}>{d.away.name.toUpperCase()}</span>
        </div>
      </div>

      {(scorers.home.length > 0 || scorers.away.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "var(--sp-6)", alignItems: "start", marginTop: "var(--sp-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "var(--text-sm)", color: "var(--ink-60)" }}>
            {scorers.home.map((g) => <span key={g}>{g}</span>)}
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-45)" }}>⚽</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "var(--text-sm)", color: "var(--ink-60)", textAlign: "right" }}>
            {scorers.away.map((g) => <span key={g}>{g}</span>)}
          </div>
        </div>
      )}

      {s && s.possession && (
        <div style={{ borderTop: "1px solid var(--ink-rule)", marginTop: "var(--sp-4)", paddingTop: "var(--sp-4)", display: "flex", gap: "var(--sp-8)", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "2 1 240px", minWidth: 200 }}>
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
            {[["SHOTS", s.shots], ["ON TARGET", s.onTarget], ["XG", s.xg]].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: "var(--text-2xs)", fontWeight: 500, letterSpacing: "0.06em", color: "var(--ink-60)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", color: "var(--ink)" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {d.lineups && (
        <div style={{ marginTop: "var(--sp-5)", borderTop: "1px solid var(--ink-rule)", paddingTop: "var(--sp-4)" }}>
          <h3 className="ps-label ps-label--ink" style={{ marginBottom: "var(--sp-3)" }}>Line-ups &amp; ratings</h3>
          <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap" }}>
            <LineupColumn team={d.home} players={d.lineups.home} />
            <LineupColumn team={d.away} players={d.lineups.away} />
          </div>
        </div>
      )}
    </>
  );
}

export default function MatchModal({ matchId, onClose }) {
  const { data, loading, error } = useFetch(`/api/matches/${matchId}`);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="ps-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Match detail"
    >
      <div className="ps-modal ps-card--light ps-light" onClick={(e) => e.stopPropagation()}>
        <button className="ps-modal-close" onClick={onClose} aria-label="Close">×</button>
        {loading && <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-60)" }}>Loading…</div>}
        {error && <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-60)" }}>Couldn’t load this match.</div>}
        {data && <Detail d={data} />}
      </div>
    </div>,
    document.body,
  );
}
