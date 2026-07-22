import type { CSSProperties } from "react";

type Tone = "ink" | "ivory";

/**
 * ya'cha 워드마크. 어포스트로피만 브랜드 레드(#C13529).
 * tone="ivory"는 어두운 배경, tone="ink"는 밝은 배경에서 사용.
 */
export function Wordmark({
  tone = "ink",
  size = 15,
  className,
  style,
}: {
  tone?: Tone;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const color = tone === "ivory" ? "var(--ivory)" : "var(--ink)";
  return (
    <span
      className={className}
      style={{
        fontFamily:
          "Pretendard, -apple-system, BlinkMacSystemFont, 'Malgun Gothic', sans-serif",
        fontSize: `${size}px`,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "baseline",
        ...style,
      }}
      aria-label="ya'cha"
    >
      <span>ya</span>
      <span style={{ color: "var(--yacha-red)" }}>&#39;</span>
      <span>cha</span>
    </span>
  );
}