import { useNavigate } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";

function TeamCard({ card }) {
  const navigate = useNavigate();
  const champ = card.isChampion;
  const clickable = card.hasProfile;
  const Tag = clickable ? "button" : "div";

  return (
    <Tag
      onClick={clickable ? () => navigate(`/teams/${card.id}`, { viewTransition: true }) : undefined}
      className={[
        champ ? "ps-card--gold" : "ps-card",
        clickable ? "ps-card-btn" : "",
      ].join(" ")}
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", padding: "var(--sp-5)" }}
    >
      <span style={{ fontSize: 34, lineHeight: 1 }}>{card.flag}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: "0.04em", color: "var(--chalk)", marginTop: "var(--sp-3)" }}>
        {card.name.toUpperCase()}
      </span>
      <span style={{ fontSize: "var(--text-xs)", color: champ ? "var(--chalk-85)" : "var(--chalk-60)", marginTop: 2 }}>
        {card.sub}
      </span>
      <span
        style={{
          fontSize: "var(--text-2xs)",
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: clickable ? (champ ? "var(--chalk)" : "var(--goalpost)") : "var(--chalk-border)",
          marginTop: 14,
        }}
      >
        {clickable ? (
          <>
            SCOUT REPORT <span className="ps-link-arrow">→</span>
          </>
        ) : (
          "FULL REPORT SOON"
        )}
      </span>
    </Tag>
  );
}

export default function Teams() {
  const { data, loading, error } = useFetch("/api/teams");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Teams index">
      <h1 className="ps-title">TEAMS</h1>
      <p className="ps-subtitle" style={{ marginBottom: 22 }}>
        Scout reports on how the contenders played.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--sp-4)" }}>
        {data.cards.map((card) => (
          <TeamCard key={card.id} card={card} />
        ))}
      </div>
    </PageShell>
  );
}
