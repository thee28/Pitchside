import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";

const KINDS = {
  def: {
    className: "ps-card",
    win: "var(--chalk)",
    lose: "var(--chalk-60)",
    winScore: "var(--chalk)",
    loseScore: "var(--chalk-45)",
    note: "var(--chalk-border)",
    noteWeight: 500,
  },
  champ: {
    className: "ps-card--gold",
    win: "var(--chalk)",
    lose: "var(--chalk-70)",
    winScore: "var(--chalk)",
    loseScore: "var(--chalk-70)",
    note: "var(--chalk)",
    noteWeight: 700,
  },
  third: {
    className: "ps-card--light ps-light",
    win: "var(--ink)",
    lose: "var(--ink-45)",
    winScore: "var(--ink)",
    loseScore: "var(--ink-45)",
    note: "var(--pitch-deep)",
    noteWeight: 700,
  },
};

function MatchCard({ m }) {
  const k = KINDS[m.kind] || KINDS.def;
  const teamStyle = (win) => ({ fontSize: "var(--text-sm)", fontWeight: win ? 700 : 500, color: win ? k.win : k.lose });
  const scoreStyle = (win) => ({ fontFamily: "var(--font-display)", fontSize: 17, lineHeight: 1, color: win ? k.winScore : k.loseScore });
  const aWin = m.winner === "a";
  return (
    <div className={k.className} style={{ padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "2px 0" }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{m.fa}</span>
        <span style={teamStyle(aWin)}>{m.ca}</span>
        <span style={{ flex: 1 }} />
        <span style={scoreStyle(aWin)}>{m.sa}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "2px 0" }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{m.fb}</span>
        <span style={teamStyle(!aWin)}>{m.cb}</span>
        <span style={{ flex: 1 }} />
        <span style={scoreStyle(!aWin)}>{m.sb}</span>
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: 9.5, fontWeight: k.noteWeight, letterSpacing: "0.05em", color: k.note }}>{m.note}</span>
      </div>
    </div>
  );
}

export default function Bracket() {
  const { data, loading, error } = useFetch("/api/bracket");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Knockout bracket">
      <h1 className="ps-title">KNOCKOUT BRACKET</h1>
      <p className="ps-subtitle" style={{ marginBottom: "var(--sp-5)" }}>
        Every knockout result, from the Round of 32 to France’s title in East Rutherford on July 19.
      </p>
      <div style={{ overflowX: "auto", paddingBottom: "var(--sp-3)" }}>
        <div style={{ display: "flex", gap: 22, minWidth: 1080 }}>
          {data.cols.map((col) => (
            <div key={col.title} style={{ flex: "1 1 0", display: "flex", flexDirection: "column" }}>
              <h2 className="ps-label">{col.title}</h2>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--chalk-60)", margin: "2px 0 var(--sp-3)" }}>{col.sub}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "var(--sp-2)", minHeight: 1150 }}>
                {col.matches.map((m) => (
                  <MatchCard key={`${m.ca}-${m.cb}`} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
