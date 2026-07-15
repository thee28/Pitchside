import { Link, useLocation, useNavigate } from "react-router-dom";
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
    <header
      className="ps-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "var(--turf-shadow)",
        borderBottom: "2px solid var(--chalk-70)",
      }}
    >
      <div className="ps-header-inner">
        <Link to="/" viewTransition style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", textDecoration: "none" }}>
          <img src={logo} alt="" style={{ height: 30, width: "auto", display: "block" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-sm)", letterSpacing: "0.04em", color: "var(--goalpost)" }}>
            PITCHSIDE
          </span>
        </Link>
        <nav aria-label="Primary" className="ps-nav">
          {LINKS.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              viewTransition
              className="ps-nav-link"
              aria-current={active === path ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        {hero && (
          <button className="ps-scorepill ps-light" onClick={() => navigate("/bracket", { viewTransition: true })}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>{hero.home.flag}</span>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.02em" }}>
              {hero.home.code} {hero.homeScore}–{hero.awayScore} {hero.away.code}
            </span>
            <span className="ps-scorepill-meta" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-60)" }}>
              FT · FINAL
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
