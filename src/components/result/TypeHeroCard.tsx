import type { CarbtiType } from "@/lib/carbti-types";
import { Emblem } from "@/components/common/Emblem";

export function TypeHeroCard({ type }: { type: CarbtiType }) {
  const isE = type.code[2] === "E";
  const powertrainLabel = isE ? "ELECTRIC" : "GASOLINE · HEV";
  const glow = isE ? "var(--gradient-hero)" : "var(--gradient-hero-copper)";

  return (
    <section
      className="mb-4 overflow-hidden rounded-2xl p-6"
      style={{
        background: glow,
        color: "var(--ivory)",
        boxShadow: "var(--shadow-dark)",
      }}
    >
      <div
        className="mb-3"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--gold)", fontWeight: 700 }}
      >
        YOUR CARBTI
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div
            className="mb-2"
            style={{
              fontSize: "clamp(32px, 11vw, 44px)",
              letterSpacing: "8px",
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {type.code}
          </div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--gold-soft)", fontWeight: 700 }}>
            {powertrainLabel}
          </div>
        </div>
        <Emblem code={type.code} size={88} />
      </div>
      <h1 className="mt-4" style={{ fontSize: "20px", fontWeight: 800 }}>
        {type.name}
      </h1>
      <p className="mt-2" style={{ fontSize: "12px", opacity: 0.75, lineHeight: 1.6 }}>
        {type.description}
      </p>
      <div className="mt-4 border-t pt-3" style={{ borderColor: "rgba(201,169,106,0.3)" }}>
        <span style={{ fontSize: "11px", opacity: 0.75 }}>전체의 </span>
        <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--gold)", fontVariantNumeric: "tabular-nums" }}>
          상위 {type.rarityPercent}%
        </span>
        <span style={{ fontSize: "11px", opacity: 0.75 }}>만 가진 유형</span>
      </div>
    </section>
  );
}
