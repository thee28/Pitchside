export default function Flag({ code, size = 16, className, style }) {
  if (!code) return null;
  const dims = size == null ? null : { width: size * (4 / 3), height: size };
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      {...dims}
      loading="lazy"
      className={className}
      style={{
        ...dims,
        objectFit: "cover",
        borderRadius: 2,
        boxShadow: "0 0 0 1px var(--chalk-rule)",
        flex: "0 0 auto",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}
