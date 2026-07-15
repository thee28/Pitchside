// Design tokens live in index.css as CSS custom properties.
// These JS mirrors exist for inline styles and SVG attributes.
export const C = {
  pitch: "var(--pitch)",
  pitchStripe: "var(--pitch-stripe)",
  deepPitch: "var(--pitch-deep)",
  darkPitch: "var(--pitch-dark)",
  turfShadow: "var(--turf-shadow)",
  stadiumShadow: "var(--stadium-shadow)",
  chalk: "var(--chalk)",
  goalpostWhite: "var(--goalpost)",
  gold: "var(--gold)",
  silver: "var(--silver)",
  bronze: "var(--bronze)",
  // alpha ramps
  chalk85: "var(--chalk-85)",
  chalk70: "var(--chalk-70)",
  chalk60: "var(--chalk-60)",
  chalk45: "var(--chalk-45)",
  chalkBorder: "var(--chalk-border)",
  chalkRule: "var(--chalk-rule)",
  chalkRuleSoft: "var(--chalk-rule-soft)",
  chalkFill: "var(--chalk-fill)",
  chalkWash: "var(--chalk-wash)",
  ink: "var(--ink)",
  ink60: "var(--ink-60)",
  ink45: "var(--ink-45)",
  inkRule: "var(--ink-rule)",
  elimDot: "var(--elim-dot)",
};

export const F = {
  display: "var(--font-display)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};

export const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
