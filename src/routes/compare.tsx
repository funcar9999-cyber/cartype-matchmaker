import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  CAR_DB,
  CAR_LEGAL_DISCLAIMER,
  COMPARE_LEGAL_NOTE,
  COMPARE_ROWS,
  findCarByName,
  type Car,
} from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { KAKAO_CHANNEL_URL, TIER_CARS } from "@/lib/mydata-tiers";
import { BottomTabBar } from "@/components/home/BottomTabBar";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored && CARBTI_TYPES[stored]) setCode(stored);
  }, []);

  const car =
    (carParam && CAR_DB.find((c) => c.id === carParam)) || pickDefaultCar(code);
  const type = code ? CARBTI_TYPES[code] : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
            className="flex h-7 w-7 items-center justify-center text-foreground"
            style={{ fontSize: "16px" }}
          >
            ←
          </button>
          <div className="font-medium" style={{ fontSize: "13px" }}>
            3방식 비교
          </div>
          <span className="w-7" />
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 배지 */}
          <div
            className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-slate-600"
            style={{ fontSize: "11px", lineHeight: 1.5 }}
          >
            월 납입 예시는 통상 조건 기준 시뮬레이션입니다
          </div>

          {/* 선택 차량 카드 */}
          <section className="mb-3 rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${car.gradient}`}
              >
                <span style={{ fontSize: "28px" }}>{car.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="text-slate-500" style={{ fontSize: "10px" }}>
                  {car.brand} · {car.segment} · {car.powertrain}
                </div>
                <div className="mt-0.5 font-medium" style={{ fontSize: "13px" }}>
                  {car.name}
                </div>
                <div className="mt-0.5 text-slate-500" style={{ fontSize: "10px" }}>
                  {car.priceRange}
                </div>
              </div>
              <Link
                to="/cars"
                className="text-brand-primary"
                style={{ fontSize: "11px" }}
              >
                변경 →
              </Link>
            </div>
          </section>

          {/* 월 납입 예시 3카드 */}
          <section className="mb-3">
            <div
              className="mb-2 pl-1 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              월 납입 예시
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(METHOD_LABELS) as Method[]).map((m) => (
                <div
                  key={m}
                  className="rounded-xl border border-border bg-white p-2.5 text-center"
                >
                  <div className="text-slate-500" style={{ fontSize: "10px" }}>
                    {METHOD_LABELS[m]}
                  </div>
                  <div className="mt-1 font-medium text-slate-900" style={{ fontSize: "12px" }}>
                    {car.monthlyDemo[m]}
                  </div>
                </div>
              ))}
            </div>
            <p
              className="mt-2 px-1 text-slate-400"
              style={{ fontSize: "10px", lineHeight: 1.5 }}
            >
              {COMPARE_LEGAL_NOTE}
            </p>
          </section>

          {/* 구조 비교 — 방식별 탭 */}
          <section className="mb-3">
            <div
              className="mb-2 pl-1 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              구조 비교
            </div>
            <div className="mb-2 flex gap-1.5">
              {(Object.keys(METHOD_LABELS) as Method[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex-1 rounded-full border px-3 py-1.5 ${
                    method === m
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-border bg-white text-slate-600"
                  }`}
                  style={{ fontSize: "11px" }}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              {COMPARE_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[92px_1fr] items-start gap-3 px-3 py-2.5 ${
                    i < COMPARE_ROWS.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="text-slate-500" style={{ fontSize: "11px" }}>
                    {row.label}
                  </div>
                  <div className="text-slate-900" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                    {row[method]}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {type && (
            <div
              className="mb-3 rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-3 py-2.5"
              style={{ fontSize: "12px" }}
            >
              <span className="text-slate-900">
                <span className="font-medium">{type.name}</span>은 통상{" "}
                <span className="font-medium text-brand-primary">
                  {type.bestPayment.method}
                </span>
                가 잘 맞아요
              </span>
              <Link
                to="/result/$typeCode"
                params={{ typeCode: type.code }}
                className="ml-1 text-brand-primary underline underline-offset-2"
                style={{ fontSize: "11px" }}
              >
                결과 보기
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => void navigate({ to: "/mydata/intro" })}
            className="w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
            style={{ fontSize: "13px" }}
          >
            내 신용 기준으로 정확히 비교하기
          </button>
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full rounded-xl border border-border bg-white py-3 text-center font-medium text-slate-900"
            style={{ fontSize: "13px" }}
          >
            상담사에게 실제 견적 받기
          </a>

          <p
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {CAR_LEGAL_DISCLAIMER}
          </p>
        </main>

        <BottomTabBar />
      </div>
    </div>
  );
}
