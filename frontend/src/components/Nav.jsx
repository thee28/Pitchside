import { Link, useLocation, useNavigate } from "react-router-dom";
import { C, F } from "../theme";
import logo from "../assets/logo.png";

const LINKS = [
  ["Groups", "/"],
  ["Teams", "/teams"],
  ["Players", "/leaders"],
  ["Bracket", "/bracket"],
];

function activePath(pathname) {
  if (pathname.startsWith("/teams")) return "/teams";
  if (pathname.startsWith("/players") || pathname.startsWith("/leaders")) return "/leaders";
  if (pathname.startsWith("/bracket")) return "/bracket";
  return "/";
}

export default function Nav({ hero }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = activePath(pathname);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: C.turfShadow, borderBottom: "2px solid rgba(250,250,247,0.7)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", minHeight: 58 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src={logo} alt="" style={{ height: 30, width: "auto", display: "block" }} />
          <span style={{ fontFamily: F.display, fontSize: 22, letterSpacing: "0.04em", color: C.goalpostWhite }}>PITCHSIDE</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {LINKS.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              style={{
                textDecoration: "none",
                fontFamily: F.sans,
                fontSize: 13,
                fontWeight: active === path ? 500 : 400,
                padding: "19px 2px 17px",
                color: active === path ? C.chalk : "rgba(250,250,247,0.6)",
                borderBottom: active === path ? `2px solid ${C.goalpostWhite}` : "2px solid transparent",
                transition: "color 150ms",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {hero && (
          <button
            onClick={() => navigate("/bracket")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: C.chalk, border: `1.5px solid ${C.deepPitch}`, cursor: "pointer", padding: "5px 12px" }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{hero.home.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.turfShadow, letterSpacing: "0.02em" }}>
              {hero.home.code} {hero.homeScore}–{hero.awayScore} {hero.away.code}
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: "rgba(46,66,40,0.62)" }}>FT · FINAL</span>
          </button>
        )}
      </div>
    </div>
  );
}
