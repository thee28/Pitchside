import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../api";
import { ErrorBox, Loading, PageShell } from "../components/Page";
import { C, F } from "../theme";

function TeamCard({ card }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const champ = card.isChampion;
  const clickable = card.hasProfile;

  return (
    <button
      onClick={() => clickable && navigate(`/teams/${card.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "left",
        background: champ ? C.gold : C.deepPitch,
        border: `1.5px solid ${
          champ
            ? hover
              ? C.turfShadow
              : C.chalk
            : hover && clickable
              ? C.chalk
              : "rgba(250,250,247,0.55)"
        }`,
        padding: 20,
        cursor: clickable ? "pointer" : "default",
        fontFamily: F.sans,
        transition: "border-color 150ms",
      }}
    >
      <span style={{ fontSize: 34, lineHeight: 1 }}>{card.flag}</span>
      <span style={{ fontFamily: F.display, fontSize: 24, letterSpacing: "0.04em", color: C.chalk, marginTop: 10 }}>
        {card.name.toUpperCase()}
      </span>
      <span style={{ fontSize: 11, color: champ ? "rgba(250,250,247,0.85)" : "rgba(250,250,247,0.62)", marginTop: 2 }}>
        {card.sub}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: clickable ? (champ ? C.chalk : C.goalpostWhite) : "rgba(250,250,247,0.55)",
          marginTop: 14,
        }}
      >
        {clickable ? "SCOUT REPORT →" : "FULL REPORT SOON"}
      </span>
    </button>
  );
}

export default function Teams() {
  const { data, loading, error } = useFetch("/api/teams");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <PageShell label="Teams index">
      <div style={{ fontSize: 20, fontWeight: 500, color: C.chalk }}>Teams</div>
      <div style={{ fontSize: 13, color: "rgba(250,250,247,0.62)", margin: "4px 0 22px" }}>
        Scout reports on how the contenders played.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {data.cards.map((card) => (
          <TeamCard key={card.id} card={card} />
        ))}
      </div>
    </PageShell>
  );
}
