import type { CarbtiType } from "@/lib/carbti-types";
import { formatTypeCode } from "@/lib/carbti-types";

export function TypeHeroCard({ type }: { type: CarbtiType }) {
  return (
    <section
      className="mb-4 rounded-2xl p-6 text-center text-white shadow-[0_16px_40px_-16px_rgba(15,127,255,0.55)]"
      style={{
        background: "linear-gradient(160deg, #0F7FFF 0%, #6B47FF 100%)",
      }}
    >
      <div
        className="mb-2 uppercase"
        style={{ fontSize: "10px", opacity: 0.8, letterSpacing: "0.15em" }}
      >
        YOUR CARBTI
      </div>
      <div
        className="mb-1 font-medium"
        style={{ fontSize: "34px", letterSpacing: "0.15em" }}
      >
        {formatTypeCode(type.code)}
      </div>
      <div className="mb-3">
        <span
          className="inline-block rounded-lg px-2 py-1"
          style={{
            fontSize: "10px",
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          {type.powertrainBadge}
        </span>
      </div>
      <h1 className="mb-2 font-medium" style={{ fontSize: "18px" }}>
        {type.name}
      </h1>
      <p
        className="mb-3"
        style={{ fontSize: "12px", opacity: 0.9, lineHeight: 1.5 }}
      >
        {type.description}
      </p>
      <div className="flex justify-center">
        <span
          className="inline-flex items-center gap-1 rounded-full px-4 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <span style={{ fontSize: "11px" }}>전체 상위 </span>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            {type.rarityPercent}%
          </span>
          <span style={{ fontSize: "11px" }}> 희소 유형</span>
        </span>
      </div>
    </section>
  );
}