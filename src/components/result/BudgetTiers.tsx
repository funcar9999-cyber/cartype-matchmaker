import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { BUDGET_TIERS, type CarbtiType } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";
import { findCarByName } from "@/lib/car-db";
import { useMyCarbti } from "@/hooks/use-my-carbti";

function formatWon(manwon: number) {
  const won = manwon * 10000;
  return won.toLocaleString("ko-KR");
}

export function BudgetTiers({
  type,
  onCtaClick,
}: {
  type: CarbtiType;
  onCtaClick: () => void;
}) {
  const { budgetManwon, precision, setBudget: persistBudget } = useMyCarbti();
  const precisionBudget = precision.monthly_budget ?? null;
  const initial = budgetManwon ?? precisionBudget ?? 70;
  const [budget, setBudget] = useState<number>(initial);
  const [unlocked, setUnlocked] = useState<boolean>(budgetManwon != null || precisionBudget != null);

  const handleChange = (v: number) => {
    setBudget(v);
    setUnlocked(true);
    persistBudget(v);
  };

  const bands = useMemo(
    () => ({
      stable: Math.round(budget * 0.7),
      standard: budget,
      dream: Math.round(budget * 1.35),
    }),
    [budget],
  );

  const tiers = TIER_CARS[type.code];
  const cards = BUDGET_TIERS.map((tier) => {
    const t = tiers ? tiers[tier.key] : null;
    const carId = t ? findCarByName(t.car)?.id : undefined;
    return {
      key: tier.key,
      name: tier.name,
      tagline: tier.tagline,
      band: bands[tier.key],
      carName: t?.car ?? "-",
      method: t?.method ?? "",
      monthly: t?.monthly ?? "",
      carId,
    };
  });

  const budgetLabel = budget >= 100 ? "100만원+" : `${budget}만원`;

  return (
    <section className="mb-4">
      <div
        className="mb-3 pl-1"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        예산 설계
      </div>

      {/* 슬라이더 카드 */}
      <div
        className="mb-3 rounded-2xl p-5"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-card)" }}
      >
        <div style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
          월 납입, 어느 정도 생각하세요?
        </div>
        <div
          className="mt-1 mb-3"
          style={{
            fontSize: "34px",
            fontWeight: 800,
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {formatWon(budget)}<span style={{ fontSize: "18px", color: "var(--warm-gray)", fontWeight: 500 }}>원 / 월</span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={5}
          value={budget}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "var(--teal)" }}
          aria-label="월 예산"
        />
        <div className="mt-1 flex justify-between" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
          <span>20만원</span>
          <span>{budgetLabel}</span>
          <span>100만원+</span>
        </div>
      </div>

      {/* 티어 3카드 */}
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => {
          const isStandard = c.key === "standard";
          const bg = isStandard ? "var(--navy)" : "var(--surface)";
          const fg = isStandard ? "var(--ivory)" : "var(--ink)";
          const subFg = isStandard ? "rgba(245,244,240,0.65)" : "var(--warm-gray)";
          return (
            <div
              key={c.key}
              className="relative overflow-hidden rounded-2xl p-3"
              style={{
                backgroundColor: bg,
                color: fg,
                border: isStandard ? "none" : "1px solid var(--hairline)",
                boxShadow: isStandard ? "var(--shadow-dark)" : "var(--shadow-card)",
              }}
            >
              {isStandard && (
                <span
                  className="absolute right-2 top-2 rounded-full px-2 py-0.5"
                  style={{
                    fontSize: "9px",
                    color: "var(--midnight)",
                    backgroundColor: "var(--gold)",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                  }}
                >
                  적정
                </span>
              )}
              <div style={{ fontSize: "12px", fontWeight: 700 }}>{c.name}</div>
              <div className="mt-0.5" style={{ fontSize: "10px", color: subFg, lineHeight: 1.4 }}>
                {c.tagline}
              </div>
              {unlocked ? (
                <div className="mt-3">
                  <div style={{ fontSize: "11px", color: subFg, fontVariantNumeric: "tabular-nums" }}>
                    월 ~{c.band}만원
                  </div>
                  <div className="mt-2" style={{ fontSize: "12px", fontWeight: 700, lineHeight: 1.4 }}>
                    {c.carName}
                  </div>
                  <div className="mt-1" style={{ fontSize: "10px", color: subFg }}>
                    {c.method}
                  </div>
                  <div style={{ fontSize: "10px", color: subFg }}>
                    {c.monthly && `${c.monthly} (예시)`}
                  </div>
                  {c.carId && (
                    <Link
                      to="/compare"
                      search={{ car: c.carId }}
                      className="mt-2 inline-flex items-center gap-0.5"
                      style={{ fontSize: "10px", color: isStandard ? "var(--gold)" : "var(--teal)", fontWeight: 700 }}
                    >
                      3방식 비교 →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="mt-3 select-none" aria-hidden style={{ filter: "blur(6px)", pointerEvents: "none" }}>
                  <div className="h-8 rounded" style={{ backgroundColor: isStandard ? "rgba(245,244,240,0.15)" : "var(--hairline)" }} />
                  <div className="mt-1.5 h-2 w-3/4 rounded" style={{ backgroundColor: isStandard ? "rgba(245,244,240,0.15)" : "var(--hairline)" }} />
                  <div className="mt-1 h-2 w-1/2 rounded" style={{ backgroundColor: isStandard ? "rgba(245,244,240,0.15)" : "var(--hairline)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!unlocked && (
        <p className="mt-3 text-center" style={{ fontSize: "11px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
          슬라이더를 움직이면 예산 기준으로 3장이 열려요
        </p>
      )}

      <button
        type="button"
        onClick={onCtaClick}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98]"
        style={{ backgroundColor: "var(--midnight)", color: "var(--ivory)", fontSize: "13px" }}
      >
        내 소득·신용 기준 정밀 분석
        <ArrowRight size={15} color="var(--gold)" />
      </button>
    </section>
  );
}
