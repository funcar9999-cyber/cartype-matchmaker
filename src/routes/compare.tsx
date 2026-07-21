import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  CAR_DB,
  CAR_LEGAL_DISCLAIMER,
  COMPARE_LEGAL_NOTE,
  COMPARE_ROWS,
  findCarByName,
  type Car,
} from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";
import { QuoteCalculator } from "@/components/quote-calculator";

type CompareSearch = { car?: string };

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>): CompareSearch => ({
    car: typeof search.car === "string" ? search.car : undefined,
  }),
  head: () => ({
    meta: [
      { title: "3방식 비교 · CarBTI" },
      { name: "description", content: "할부 · 리스 · 렌트, 하나의 차량으로 세 가지 방식을 한 번에 비교하세요." },
    ],
  }),
  component: ComparePage,
});

const DEFAULT_CAR_ID = "sorento-hev";
type Method = "installment" | "lease" | "rent";
const METHOD_LABELS: Record<Method, string> = {
  installment: "할부",
  lease: "리스",
  rent: "장기렌트",
};

function pickDefaultCar(code: string | null): Car {
  if (code && TIER_CARS[code]) {
    const c = findCarByName(TIER_CARS[code].standard.car);
    if (c) return c;
  }
  return CAR_DB.find((c) => c.id === DEFAULT_CAR_ID) ?? CAR_DB[0];
}

function ComparePage() {
  const { car: carParam } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("installment");
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored && CARBTI_TYPES[stored]) setCode(stored);
  }, []);

  const car =
    (carParam && CAR_DB.find((c) => c.id === carParam)) || pickDefaultCar(code);
  const type = code ? CARBTI_TYPES[code] : null;

  const bestKey: Method =
    type?.bestPayment.method === "리스"
      ? "lease"
      : type?.bestPayment.method === "장기렌트"
        ? "rent"
        : "installment";
  const sectionLabel = {
    fontSize: "10.5px",
    letterSpacing: "0.25em",
    color: "var(--warm-gray)",
    fontWeight: 700,
  } as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--hairline)", backgroundColor: "rgba(245,244,240,0.9)" }}
        >
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
            className="flex h-7 w-7 items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>3방식 비교</div>
          <span className="w-7" />
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 데모 배지 */}
          <div
            className="mb-3 inline-block rounded-full px-3 py-1"
            style={{
              fontSize: "10.5px",
              color: "var(--gold)",
              fontWeight: 700,
              border: "1px solid var(--gold)",
              letterSpacing: "0.05em",
            }}
          >
            DEMO · 통상 조건 시뮬레이션
          </div>

          {/* 선택 차량 카드 */}
          <section
            className="mb-4 rounded-2xl p-3"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--hairline)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-16 w-24 flex-shrink-0 flex-col items-center justify-center rounded-lg px-1 text-center"
                style={{ backgroundColor: "var(--navy)", color: "var(--ivory)" }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    letterSpacing: "0.2em",
                    color: "var(--gold-soft)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {car.brand}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, lineHeight: 1.1 }}>
                  {car.name.replace(car.brand, "").trim() || car.name}
                </div>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
                  {car.segment} · {car.powertrain}
                </div>
                <div
                  className="mt-0.5"
                  style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}
                >
                  {car.name}
                </div>
                <div className="mt-0.5" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
                  {car.priceRange}
                </div>
              </div>
              <Link to="/cars" style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700 }}>
                변경 →
              </Link>
            </div>
          </section>

          {/* 실시간 견적 계산기 (폴백: 통상 월납입 예시 3카드) */}
          <QuoteCalculator
            key={car.id}
            carId={car.id}
            fallback={
              <>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(METHOD_LABELS) as Method[]).map((m) => {
                    const isBest = type ? bestKey === m : false;
                    return (
                      <div
                        key={m}
                        className="relative rounded-xl p-3 text-center"
                        style={{
                          backgroundColor: isBest ? "var(--navy)" : "var(--surface)",
                          border: `1px solid ${isBest ? "var(--navy)" : "var(--hairline)"}`,
                          color: isBest ? "var(--ivory)" : "var(--ink)",
                          minHeight: 84,
                        }}
                      >
                        {isBest && (
                          <span
                            className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5"
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              backgroundColor: "var(--gold)",
                              color: "var(--midnight)",
                            }}
                          >
                            내 유형 최적
                          </span>
                        )}
                        <div
                          style={{
                            fontSize: "10px",
                            letterSpacing: "0.15em",
                            color: isBest ? "var(--gold-soft)" : "var(--warm-gray)",
                            fontWeight: 700,
                          }}
                        >
                          {METHOD_LABELS[m]} <span style={{ opacity: 0.8 }}>(예시)</span>
                        </div>
                        <div
                          className="mt-1.5"
                          style={{ fontSize: "13px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
                        >
                          {car.monthlyDemo[m]}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p
                  className="mt-2 px-1"
                  style={{ fontSize: "10px", lineHeight: 1.5, color: "var(--warm-gray)" }}
                >
                  {COMPARE_LEGAL_NOTE}
                </p>
              </>
            }
          />

          {/* 구조 비교 — 방식별 탭 */}
          <section className="mb-4">
            <div className="mb-2 pl-1" style={sectionLabel}>구조 비교</div>
            <div className="mb-2 flex gap-1.5">
              {(Object.keys(METHOD_LABELS) as Method[]).map((m) => {
                const active = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className="flex-1 rounded-full px-3 py-1.5 transition active:scale-[0.98]"
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 700,
                      backgroundColor: active ? "var(--midnight)" : "var(--surface)",
                      color: active ? "var(--ivory)" : "var(--ink)",
                      border: `1px solid ${active ? "var(--midnight)" : "var(--hairline)"}`,
                    }}
                  >
                    {METHOD_LABELS[m]}
                  </button>
                );
              })}
            </div>
            <div
              className="overflow-hidden rounded-2xl"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)" }}
            >
              {COMPARE_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[92px_1fr] items-start gap-3 px-4 py-3"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10.5px",
                      color: "var(--warm-gray)",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {row.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--ink)", lineHeight: 1.5 }}>
                    {row[method]}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {type && (
            <div
              className="mb-3 rounded-xl px-3 py-3"
              style={{
                fontSize: "12px",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--hairline)",
                color: "var(--ink)",
              }}
            >
              <span style={{ fontWeight: 700 }}>{type.name} 유형</span>은 통상{" "}
              <span style={{ fontWeight: 700, color: "var(--gold)" }}>
                {type.bestPayment.method}
              </span>
              가 잘 맞아요
              <Link
                to="/result/$typeCode"
                params={{ typeCode: type.code }}
                className="ml-2 underline underline-offset-2"
                style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700 }}
              >
                결과 보기
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => void navigate({ to: "/mydata/intro" })}
            className="w-full rounded-xl py-3.5 transition active:scale-[0.98]"
            style={{
              backgroundColor: "var(--midnight)",
              color: "var(--ivory)",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "var(--shadow-dark)",
            }}
          >
            내 신용 기준으로 정확히 비교하기
          </button>
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="mt-2 w-full rounded-xl py-3 text-center transition active:scale-[0.98]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--hairline)",
              color: "var(--ink)",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            상담사에게 실제 견적 받기
          </button>
          <p
            className="mt-1.5 text-center"
            style={{ fontSize: "10.5px", color: "var(--warm-gray)" }}
          >
            이 조건 그대로 상담하시면 견적이 빨라져요
          </p>

          <p className="mt-4 px-1" style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}>
            {CAR_LEGAL_DISCLAIMER}
          </p>
        </main>

        <BottomTabBar />
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{ defaultCarName: `${car.brand} ${car.name}`, source: "compare" }}
        />
      </div>
    </div>
  );
}
