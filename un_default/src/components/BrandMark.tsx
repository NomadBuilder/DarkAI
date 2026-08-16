/** Un-Default mark — four defaults + one bar breaking away. */
export function BrandMark({
  className = "",
  title = "Un-Default",
}: {
  className?: string;
  title?: string;
}) {
  const titleId = "brand-mark-title";
  return (
    <svg
      className={className}
      viewBox="0 0 256 256"
      role="img"
      aria-labelledby={titleId}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>{title}</title>
      <rect width="256" height="256" fill="#000000" rx="40" />
      <rect x="48" y="48" width="20" height="160" rx="10" fill="#FFFFFF" />
      <rect x="84" y="48" width="20" height="160" rx="10" fill="#FFFFFF" />
      <rect x="120" y="48" width="20" height="160" rx="10" fill="#FFFFFF" />
      <rect x="156" y="48" width="20" height="160" rx="10" fill="#FFFFFF" />
      <g transform="rotate(16 194 128)">
        <rect x="184" y="48" width="20" height="160" rx="10" fill="#FF6A00" />
      </g>
    </svg>
  );
}
