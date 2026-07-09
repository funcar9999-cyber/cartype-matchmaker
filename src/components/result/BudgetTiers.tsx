import {
  BUDGET_TIERS,
  BUDGET_LOCK_COPY,
  BUDGET_CTA_LABEL,
} from "@/lib/carbti-types";

export function BudgetTiers({ onCtaClick }: { onCtaClick: () => void }) {
  return (
    <section className="mb-3 rounded-2xl bg-slate-50 p-4">
      <div
        className="mb-3 uppercase text-slate-500"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        내 예산으로 가능한 선택지
      </div>

      <div className="grid grid-cols-3 gap-2">
        {BUDGET_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
          >
            <div
              className="font-medium text-slate-900"
              style={{ fontSize: "12px" }}
            >
              {tier.name}
            </div>
            <div
              className="mt-0.5 text-slate-500"
              style={{ fontSize: "10px", lineHeight: 1.4 }}
            >
              {tier.tagline}
            </div>

            {/* 잠긴 더미 차량 영역 */}
            <div
              className="mt-3 select-none"
              style={{ filter: "blur(6px)", pointerEvents: "none" }}
              aria-hidden
            >
              <div className="h-10 rounded-md bg-slate-200" />
              <div className="mt-1.5 h-2 w-3/4 rounded bg-slate-200" />
              <div className="mt-1 h-2 w-1/2 rounded bg-slate-200" />
            </div>

            {/* 자물쇠 오버레이 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
              <span style={{ fontSize: "14px" }}>🔒</span>
            </div>
          </div>
        ))}
      </div>

      <p
        className="mt-3 text-center text-slate-500"
        style={{ fontSize: "11px", lineHeight: 1.5 }}
      >
        {BUDGET_LOCK_COPY}
      </p>

      <button
        type="button"
        onClick={onCtaClick}
        className="mt-3 w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
        style={{ fontSize: "13px" }}
      >
        🔒 {BUDGET_CTA_LABEL}
      </button>
    </section>
  );
}