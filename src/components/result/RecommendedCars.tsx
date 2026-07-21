import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { CarbtiType } from "@/lib/carbti-types";
import { circled } from "@/lib/carbti-types";
import { findCarByName } from "@/lib/car-db";
import { REASONS, STABLE_COMPARE, TYPE_REASONS } from "@/lib/payment-reasons";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import type { PrecisionData } from "@/lib/precision";

type SituationReason = { key: string; text: string; removes?: string[] };

function buildSituationReasons(p: PrecisionData): SituationReason[] {
  const list: SituationReason[] = [];
  // 우선순위: ins_penalty > loan_plan > biz_type > swap_cycle
  if (p.ins_penalty === "yes") {
    list.push({
      key: "S_INS",
      text:
        "보험료 할증이 있다고 하셨죠 — 렌트는 렌트사 보험으로 운행해서 내 보험 이력과 무관하고, 사고가 나도 내 보험료가 오르지 않아요. (면책금 등 계약 조건은 있어요)",
      removes: ["R8"],
    });
  }
  if (p.loan_plan === "yes") {
    list.push({
      key: "S_LOAN",
      text:
        "대출 계획이 있다고 하셨죠 — 리스·렌트는 현행 기준 신용정보상 부채로 잡히지 않아요. (은행 자체 심사 기준은 별개예요)",
    });
  }
  if (p.biz_type === "sole" || p.biz_type === "corp") {
    list.push({
      key: "S_BIZ",
      text:
        "사업자라고 하셨죠 — 리스·렌트 이용료는 현행 기준 연 최대 1,500만원 한도로 비용처리가 가능해요. (업무전용보험 등 요건에 따라 달라져요)",
    });
  }
  if (p.swap_cycle === "short") {
    list.push({
      key: "S_SWAP",
      text:
        "3~4년마다 갈아탄다고 하셨죠 — 그 주기에선 중고값 하락을 떠안는 할부보다 리스·렌트 총비용이 낮아지는 구간이에요.",
      removes: ["R4s"],
    });
  }
  return list.slice(0, 2);
}

function hasPrecision(p: PrecisionData): boolean {
  return Boolean(
    p.loan_plan || p.annual_km || p.biz_type || p.ins_penalty || p.passengers || p.body_pref,
  );
}

export function RecommendedCars({ type, personalize = false }: { type: CarbtiType; personalize?: boolean }) {
  const isE = type.code[2] === "E";
  const accent = isE ? "var(--teal)" : "var(--copper)";
  const config = TYPE_REASONS[type.code];
  const firstCar = findCarByName(type.topCars[0]);
  const compareSearch = firstCar ? { car: firstCar.id } : {};
  const { precision } = useMyCarbti();
  const situationReasons = personalize ? buildSituationReasons(precision) : [];
  const removedKeys = new Set(situationReasons.flatMap((s) => s.removes ?? []));
  const showKmHint = personalize && precision.annual_km === "high";
  const showLockCard = personalize && !hasPrecision(precision);

  return (
    <>
    <section
      className="mb-4 rounded-2xl p-5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="mb-1"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        대표 차량
      </div>
      <div className="mb-4" style={{ fontSize: "13px", color: "var(--ink)", fontWeight: 500, lineHeight: 1.5 }}>
        {type.tagline}
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {type.topCars.slice(0, 2).map((model, idx) => {
          const car = findCarByName(model);
          const content = (
            <div
              className="rounded-xl p-3 h-full flex flex-col justify-between"
              style={{ backgroundColor: "var(--navy)", color: "var(--ivory)", minHeight: 96 }}
            >
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--gold)", fontWeight: 700 }}>
                RANK {idx + 1}
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.3 }}>{model}</span>
                {car && <ChevronRight size={14} color="var(--gold)" />}
              </div>
            </div>
          );
          return car ? (
            <li key={model}>
              <Link to="/cars/$id" params={{ id: car.id }} className="block active:scale-[0.98] transition">
                {content}
              </Link>
            </li>
          ) : (
            <li key={model}>{content}</li>
          );
        })}
      </ul>

      <div
        className="mt-5 mb-1"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        최적 금융 구조
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: accent, letterSpacing: "-0.01em" }}>
        {type.bestPayment.method}
      </div>
      <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--hairline)" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.05em", color: "var(--warm-gray)", fontWeight: 700 }}>
          이 방식이 맞는 이유
        </div>
        {config?.kind === "flex" ? (
          <>
            {(() => {
              const situationItems = situationReasons.map((s) => ({ key: s.key, text: s.text }));
              const baseItems = config.reasons
                .filter((k) => !removedKeys.has(k))
                .map((k) => ({ key: k, text: REASONS[k] }));
              const merged = [...situationItems, ...baseItems].slice(0, 4);
              return (
                <ul className="mt-2 space-y-2.5">
                  {merged.map((item, i) => (
                    <li key={item.key} className="flex gap-2">
                      <span
                        className="flex-shrink-0"
                        style={{ fontSize: "13px", color: accent, fontWeight: 700, lineHeight: 1.55 }}
                      >
                        {circled(i + 1)}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.85, lineHeight: 1.6 }}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            })()}
            {showKmHint && (
              <p className="mt-2" style={{ fontSize: "11px", color: "var(--warm-gray)", lineHeight: 1.55 }}>
                연 2만km 이상이면 약정 주행거리를 넉넉히 잡는 게 중요해요 — 견적에서 주행 옵션을 2만km로 확인하세요.
              </p>
            )}
            {config.footnote && (
              <p
                className="mt-3 rounded-lg px-3 py-2"
                style={{
                  fontSize: "11px",
                  lineHeight: 1.55,
                  color: "var(--warm-gray)",
                  backgroundColor: "rgba(0,0,0,0.03)",
                }}
              >
                ※ {REASONS[config.footnote]}
              </p>
            )}
          </>
        ) : (
          <p className="mt-2" style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.85, lineHeight: 1.6 }}>
            {type.bestPayment.reason}
          </p>
        )}

        {config?.kind === "stable" && (
          <div
            className="mt-4 rounded-xl p-3"
            style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
          >
            <div
              className="mb-2"
              style={{ fontSize: "11.5px", color: "var(--ink)", fontWeight: 700, lineHeight: 1.5 }}
            >
              {STABLE_COMPARE.title}
            </div>
            <ul className="space-y-2">
              {situationReasons.map((s) => (
                <li key={s.key} className="flex gap-2">
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: "11px", color: "var(--warm-gray)", lineHeight: 1.6 }}
                  >
                    •
                  </span>
                  <span style={{ fontSize: "11.5px", color: "var(--ink)", opacity: 0.85, lineHeight: 1.6 }}>
                    {s.text}
                  </span>
                </li>
              ))}
              {STABLE_COMPARE.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: "11px", color: "var(--warm-gray)", lineHeight: 1.6 }}
                  >
                    •
                  </span>
                  <span style={{ fontSize: "11.5px", color: "var(--ink)", opacity: 0.8, lineHeight: 1.6 }}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
            {showKmHint && (
              <p className="mt-2" style={{ fontSize: "10.5px", color: "var(--warm-gray)", lineHeight: 1.55 }}>
                연 2만km 이상이면 약정 주행거리를 넉넉히 잡는 게 중요해요 — 견적에서 주행 옵션을 2만km로 확인하세요.
              </p>
            )}
            <p
              className="mt-2"
              style={{ fontSize: "10.5px", color: "var(--warm-gray)", lineHeight: 1.55 }}
            >
              {STABLE_COMPARE.footnote}
            </p>
          </div>
        )}

        <Link
          to="/compare"
          search={compareSearch}
          className="mt-3 inline-flex items-center gap-1"
          style={{ fontSize: "11.5px", color: accent, fontWeight: 700 }}
        >
          할부·리스·렌트, 구조가 어떻게 다른지 보기
          <ChevronRight size={12} />
        </Link>
      </div>
    </section>
    {showLockCard && (
      <section
        className="mb-4 rounded-2xl p-5"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-card)" }}
      >
        <div
          className="mb-2 uppercase"
          style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--warm-gray)" }}
        >
          LOCKED
        </div>
        <div style={{ fontSize: "14px", color: "var(--ink)", fontWeight: 700, lineHeight: 1.4 }}>
          내 상황 기반 정밀 근거
        </div>
        <p className="mt-1.5" style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.55 }}>
          대출 계획·주행거리·사업자 여부까지 반영한 나만의 근거 — 7문항(30초)이면 열려요
        </p>
        <div className="mt-3 select-none" aria-hidden style={{ filter: "blur(6px)", pointerEvents: "none" }}>
          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "var(--hairline)" }} />
          <div className="mt-1.5 h-3 w-2/3 rounded" style={{ backgroundColor: "var(--hairline)" }} />
          <div className="mt-1.5 h-3 w-1/2 rounded" style={{ backgroundColor: "var(--hairline)" }} />
        </div>
        <Link
          to="/diagnosis/precision"
          className="mt-4 flex w-full items-center justify-center rounded-xl py-3 font-medium transition-transform active:scale-[0.98]"
          style={{ backgroundColor: "var(--midnight)", color: "var(--ivory)", fontSize: "13px" }}
        >
          정밀 진단 이어하기
        </Link>
      </section>
    )}
    </>
  );
}
