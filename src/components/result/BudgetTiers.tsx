import { useEffect, useMemo, useState } from "react";

import { CAR_DB, findCarByName, type Car } from "@/lib/car-db";
import { BUDGET_TIERS, type CarbtiType } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";

type MethodKey = "installment" | "lease" | "rent";

function methodKey(method: string): MethodKey {
  if (method === "리스") return "lease";
  if (method === "장기렌트") return "rent";
  return "installment"; // 할부 / 현금+할부
}

function methodLabel(k: MethodKey): string {
  return k === "lease" ? "리스" : k === "rent" ? "장기렌트" : "할부";
}

function parseMonthly(demo: string): number | null {
  const m = demo.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function monthlyBand(v: number): string {
  return `월 ${v}만원대 (예시)`;
}

// 파워트레인 매칭: E → 전기, G → 가솔린·하이브리드
function powertrainOk(car: Car, axis: "E" | "G"): boolean {
  if (axis === "E") return car.powertrain === "전기";
  return car.powertrain === "가솔린" || car.powertrain === "하이브리드";
}

// 1축 매칭: C → 경형/소형/준중형, W → 그 외
function purposeOk(car: Car, axis: "C" | "W"): boolean {
  const city = ["경형", "소형", "준중형"] as const;
  const isCity = (city as readonly string[]).includes(car.segment);
  return axis === "C" ? isCity : !isCity;
}

function pickCarForBand(
  type: CarbtiType,
  bandManwon: number,
  mKey: MethodKey,
): Car | null {
  const pt = type.code[2] as "E" | "G";
  const pp = type.code[0] as "C" | "W";
  const pool = CAR_DB.filter(
    (c) => powertrainOk(c, pt) && purposeOk(c, pp),
  );
  const scored = pool
    .map((c) => {
      const v = parseMonthly(c.monthlyDemo[mKey]);
      return v == null ? null : { car: c, diff: Math.abs(v - bandManwon) };
    })
    .filter((x): x is { car: Car; diff: number } => x !== null)
    .sort((a, b) => a.diff - b.diff);
  return scored[0]?.car ?? null;
}

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

  const mKey = methodKey(type.bestPayment.method);
  const bands = useMemo(
    () => ({
      stable: Math.round(budget * 0.7),
      standard: budget,
      dream: Math.round(budget * 1.35),
    }),
    [budget],
  );

  const fallback = TIER_CARS[type.code];

  const cards = BUDGET_TIERS.map((tier) => {
    const band = bands[tier.key];
    const picked = pickCarForBand(type, band, mKey);
    const fallbackCarName = fallback ? fallback[tier.key].car : null;
    const carName = picked
      ? `${picked.brand} ${picked.name}`
      : fallbackCarName ?? "-";
    // 폴백 시에도 CAR_DB에서 데모 값을 찾아 밴드에 맞춘 형식으로 노출
    const monthly =
      picked
        ? monthlyBand(parseMonthly(picked.monthlyDemo[mKey]) ?? band)
        : (() => {
            const c = fallbackCarName ? findCarByName(fallbackCarName) : null;
            const v = c ? parseMonthly(c.monthlyDemo[mKey]) : null;
            return monthlyBand(v ?? band);
          })();
    return {
      key: tier.key,
      name: tier.name,
      tagline: tier.tagline,
      carName,
      monthly,
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
          말씀해주신 월 {budgetLabel} 기준 (예시)
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
                  className="font-medium text-slate-900"
                  style={{ fontSize: "12px", lineHeight: 1.4 }}
                >
                  {c.carName}
                </div>
                <div className="mt-1 text-slate-500" style={{ fontSize: "10px" }}>
                  {methodLabel(mKey)}
                </div>
                <div
                  className="mt-1 font-medium text-brand-primary"
                  style={{ fontSize: "11px" }}
                >
                  {c.monthly}
                </div>
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