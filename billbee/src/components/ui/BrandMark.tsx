export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z"
        fill="var(--color-accent)"
        fillOpacity="0.18"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      <path
        d="M12 7 L17 9.5 L17 14.5 L12 17 L7 14.5 L7 9.5 Z"
        fill="var(--color-accent)"
      />
    </svg>
  )
}
