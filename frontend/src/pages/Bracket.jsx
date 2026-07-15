import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { C, F } from "../theme";

const KINDS = {
  def: {
    card: { background: C.deepPitch, border: "1.5px solid rgba(250,250,247,0.55)", padding: "10px 12px" },
    win: C.chalk,
    lose: "rgba(250,250,247,0.6)",
    winScore: C.chalk,
    loseScore: "rgba(250,250,247,0.45)",
    note: "rgba(250,250,247,0.55)",
    noteWeight: 500,
  },
  champ: {
    card: { background: C.gold, border: `1.5px solid ${C.chalk}`, padding: "10px 12px" },
    win: C.chalk,
    lose: "rgba(250,250,247,0.78)",
    winScore: C.chalk,
    loseScore: "rgba(250,250,247,0.7)",
    note: C.chalk,
    noteWeight: 700,
  },
  third: {
    card: { background: C.chalk, border: `1.5px solid ${C.deepPitch}`, padding: "10px 12px" },
    win: C.turfShadow,
    lose: "rgba(46,66,40,0.55)",
    winScore: C.turfShadow,
    loseScore: "rgba(46,66,40,0.5)",
    note: C.deepPitch,
    noteWeight: 700,
  },
};

function MatchCard({ m }) {
  const k = KINDS[m.kind] || KINDS.def;
  const teamStyle = (win) => ({ fontSize: 12, fontWeight: win ? 700 : 500, color: win ? k.win : k.lose });
  const scoreStyle = (win) => ({ fontFamily: F.display, fontSize: 17, lineHeight: 1, color: win ? k.winScore : k.loseScore });
  const aWin = m.winner === "a";
  return (
    <div style={k.card}>
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
      <div style={{ fontSize: 20, fontWeight: 500, color: C.chalk }}>Knockout bracket</div>
      <div style={{ fontSize: 13, color: "rgba(250,250,247,0.62)", margin: "4px 0 20px" }}>
        Every knockout result, from the Round of 32 to France’s title in East Rutherford on July 19.
      </div>
      <div style={{ overflowX: "auto", paddingBottom: 12 }}>
        <div style={{ display: "flex", gap: 22, minWidth: 1080 }}>
          {data.cols.map((col) => (
            <div key={col.title} style={{ flex: "1 1 0", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(250,250,247,0.62)" }}>{col.title}</div>
              <div style={{ fontSize: 10, color: "rgba(250,250,247,0.6)", margin: "2px 0 12px" }}>{col.sub}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 8, minHeight: 1150 }}>
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
