import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { BUDGET_TIERS, type CarbtiType } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";
import { findCarByName } from "@/lib/car-db";

const BUDGET_STORAGE_KEY = "carbti:budget";

export function BudgetTiers({
  type,
  onCtaClick,
}: {
  type: CarbtiType;
  onCtaClick: () => void;
}) {
  const [budget, setBudget] = useState<number>(50);
  const [unlocked, setUnlocked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(BUDGET_STORAGE_KEY);
    if (raw) {
      const v = Number(raw);
      if (Number.isFinite(v) && v >= 20 && v <= 100) {
        setBudget(v);
        setUnlocked(true);
      }
    }
  }, []);

  const handleChange = (v: number) => {
    setBudget(v);
    setUnlocked(true);
    try {
      sessionStorage.setItem(BUDGET_STORAGE_KEY, String(v));
    } catch {
      /* ignore */
    }
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
      monthly: t?.monthly ? `${t.monthly} (예시)` : "",
      carId,
    };
  });

  const budgetLabel = budget >= 100 ? "100만원+" : `${budget}만원`;

  return (
    <section className="mb-3 rounded-2xl bg-slate-50 p-4">
      <div
        className="mb-2 uppercase text-slate-500"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        내 예산으로 가능한 선택지
      </div>

      {/* 슬라이더 */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-slate-600" style={{ fontSize: "12px" }}>
            월 납입, 어느 정도 생각하세요?
          </span>
          <span
            className="font-medium text-brand-primary"
            style={{ fontSize: "13px" }}
          >
            월 {budgetLabel}
          </span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={5}
          value={budget}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full accent-brand-primary"
          aria-label="월 예산"
        />
        <div
          className="mt-1 flex justify-between text-slate-400"
          style={{ fontSize: "10px" }}
        >
          <span>20만원</span>
          <span>100만원+</span>
        </div>
      </div>

      {unlocked && (
        <div
          className="mb-2 text-slate-500"
          style={{ fontSize: "11px", lineHeight: 1.4 }}
        >
          말씀해주신 월 {budgetLabel} 기준의 예산 구간이에요. 차량 매칭은 마이데이터를 연결하면 내 조건 기준으로 정교해져요.
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => (
          <div
            key={c.key}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="font-medium text-slate-900" style={{ fontSize: "12px" }}>
              {c.name}
            </div>
            <div
              className="mt-0.5 text-slate-500"
              style={{ fontSize: "10px", lineHeight: 1.4 }}
            >
              {c.tagline}
            </div>

            {unlocked ? (
              <div className="mt-3">
                <div
                  className="font-medium text-brand-primary"
                  style={{ fontSize: "11px" }}
                >
                  월 ~{c.band}만원대
                </div>
                <div
                  className="mt-2 font-medium text-slate-900"
                  style={{ fontSize: "12px", lineHeight: 1.4 }}
                >
                  {c.carName}
                </div>
                <div className="mt-1 text-slate-500" style={{ fontSize: "10px" }}>
                  {c.method}
                </div>
                <div
                  className="mt-1 text-slate-500"
                  style={{ fontSize: "10px" }}
                >
                  {c.monthly}
                </div>
                {c.carId && (
                  <Link
                    to="/compare"
                    search={{ car: c.carId }}
                    className="mt-2 inline-block text-brand-primary"
                    style={{ fontSize: "10px" }}
                  >
                    3방식 비교 →
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div
                  className="mt-3 select-none"
                  style={{ filter: "blur(6px)", pointerEvents: "none" }}
                  aria-hidden
                >
                  <div className="h-10 rounded-md bg-slate-200" />
                  <div className="mt-1.5 h-2 w-3/4 rounded bg-slate-200" />
                  <div className="mt-1 h-2 w-1/2 rounded bg-slate-200" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                  <span style={{ fontSize: "14px" }}>🔒</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!unlocked && (
        <p
          className="mt-3 text-center text-slate-500"
          style={{ fontSize: "11px", lineHeight: 1.5 }}
        >
          슬라이더를 움직이면 예산 기준으로 3장이 열려요
        </p>
      )}

      <button
        type="button"
        onClick={onCtaClick}
        className="mt-3 w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
        style={{ fontSize: "13px" }}
      >
        실제 소득·신용 기준으로 더 정확하게 — 마이데이터 연결
      </button>
    </section>
  );
}