import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

import {
  CAR_DB,
  CAR_LIST_DISCLAIMER,
  POWERTRAIN_FILTERS,
  PRICE_FILTERS,
  findCarByName,
  type Car,
} from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { Emblem } from "@/components/common/Emblem";

export const Route = createFileRoute("/cars/")({
  head: () => ({
    meta: [
      { title: "차량 둘러보기 · 야차" },
      { name: "description", content: "내 유형에 맞는 차부터 보여드리는 CarBTI 차량 카탈로그." },
    ],
  }),
  component: CarsIndex,
});

function priceBucket(min: number) {
  if (min < 3000) return "low";
  if (min < 5000) return "mid";
  return "high";
}

function CarThumb({ car, badge, accent }: { car: Car; badge?: string; accent?: string }) {
  return (
    <div
      className="relative flex h-24 flex-col items-center justify-center overflow-hidden rounded-xl px-2"
      style={{ backgroundColor: "var(--navy)", color: "var(--ivory)" }}
    >
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "0.25em",
          color: "var(--gold-soft)",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {car.brand}
      </div>
      <div
        className="mt-1 text-center"
        style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.15 }}
      >
        {car.name.replace(car.brand, "").trim() || car.name}
      </div>
      {badge ? (
        <span
          className="absolute left-2 top-2 rounded-full px-1.5 py-0.5"
          style={{
            fontSize: "9px",
            fontWeight: 700,
            backgroundColor: accent ?? "var(--gold)",
            color: "var(--midnight)",
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function CarCard({ car, badge, accent }: { car: Car; badge?: string; accent?: string }) {
  return (
    <Link
      to="/cars/$id"
      params={{ id: car.id }}
      className="block rounded-xl p-2.5 transition active:scale-[0.98]"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)" }}
    >
      <CarThumb car={car} badge={badge} accent={accent} />
      <div
        className="mt-2"
        style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)" }}
      >
        {car.name}
      </div>
      <div className="mt-0.5 flex items-center gap-1">
        <span
          className="rounded-full px-1.5 py-0.5"
          style={{
            fontSize: "9px",
            backgroundColor: "var(--ivory)",
            color: "var(--warm-gray)",
            border: "1px solid var(--hairline)",
          }}
        >
          {car.powertrain}
        </span>
        <span style={{ fontSize: "9px", color: "var(--warm-gray)" }}>{car.segment}</span>
      </div>
      <div className="mt-1" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
        {car.priceRange}
      </div>
    </Link>
  );
}

function CarsIndex() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);
  const [pt, setPt] = useState<string>("all");
  const [pr, setPr] = useState<string>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored && CARBTI_TYPES[stored]) setCode(stored);
  }, []);

  const type = code ? CARBTI_TYPES[code] : null;
  const tiers = code ? TIER_CARS[code] : null;

  const myCars = useMemo<Car[]>(() => {
    if (!type) return [];
    const names = [
      ...type.topCars,
      ...(tiers ? [tiers.stable.car, tiers.standard.car, tiers.dream.car] : []),
    ];
    const seen = new Set<string>();
    const cars: Car[] = [];
    for (const n of names) {
      const c = findCarByName(n);
      if (c && !seen.has(c.id)) {
        seen.add(c.id);
        cars.push(c);
      }
    }
    return cars;
  }, [type, tiers]);

  const filtered = useMemo(() => {
    return CAR_DB.filter((c) => {
      if (pt !== "all" && c.powertrain !== pt) return false;
      if (pr !== "all" && priceBucket(c.priceMinManwon) !== pr) return false;
      return true;
    });
  }, [pt, pr]);

  const typeAccent = type && type.code[2] === "E" ? "var(--teal)" : "var(--copper)";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <header
          className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--hairline)", backgroundColor: "rgba(245,244,240,0.9)" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => window.history.back()}
              className="flex h-7 w-7 items-center justify-center"
              style={{ color: "var(--ink)" }}
            >
              <ArrowLeft size={18} strokeWidth={1.75} />
            </button>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                차량 둘러보기
              </div>
              <div style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
                내 유형에 맞는 차부터 보여드려요
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 필터 */}
          <div className="mb-3 space-y-1.5">
            {[
              { list: POWERTRAIN_FILTERS, value: pt, setter: setPt },
              { list: PRICE_FILTERS, value: pr, setter: setPr },
            ].map((row, idx) => (
              <div key={idx} className="-mx-4 overflow-x-auto px-4">
                <div className="flex gap-1.5">
                  {row.list.map((f) => {
                    const active = row.value === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => row.setter(f.key)}
                        className="whitespace-nowrap rounded-full px-3 py-1 transition active:scale-[0.98]"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: active ? "var(--midnight)" : "var(--surface)",
                          color: active ? "var(--ivory)" : "var(--ink)",
                          border: `1px solid ${active ? "var(--midnight)" : "var(--hairline)"}`,
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 유형 맞춤 or 배너 */}
          {type && myCars.length > 0 ? (
            <section className="mb-4">
              <div className="mb-2 flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <Emblem code={type.code} size={22} />
                  <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                    {type.name}인 당신께
                  </h2>
                </div>
                <Link
                  to="/result/$typeCode"
                  params={{ typeCode: type.code }}
                  style={{ fontSize: "10px", color: "var(--gold)", fontWeight: 700 }}
                >
                  결과 다시 보기 →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {myCars.slice(0, 4).map((c) => (
                  <CarCard key={c.id} car={c} badge={type.code} accent={typeAccent} />
                ))}
              </div>
            </section>
          ) : (
            <button
              type="button"
              onClick={() => void navigate({ to: "/diagnosis/onboarding" })}
              className="mb-4 flex w-full items-center justify-between rounded-xl p-4 text-left transition active:scale-[0.98]"
              style={{
                backgroundColor: "var(--midnight)",
                color: "var(--ivory)",
                boxShadow: "var(--shadow-dark)",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700 }}>
                  1분 진단하면 내 유형 맞춤 추천이 열려요
                </div>
                <div className="mt-0.5" style={{ fontSize: "10px", color: "var(--gold-soft)" }}>
                  지금 카BTI 진단 시작
                </div>
              </div>
              <ChevronRight size={18} color="var(--gold)" />
            </button>
          )}

          {/* 전체 */}
          <section>
            <h2
              className="mb-2 pl-1"
              style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}
            >
              전체 차량 ({filtered.length})
            </h2>
            {filtered.length === 0 ? (
              <div
                className="rounded-xl border border-dashed p-6 text-center"
                style={{ borderColor: "var(--hairline)", color: "var(--warm-gray)", fontSize: "12px" }}
              >
                조건에 맞는 차량이 없어요.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            )}
          </section>

          <p
            className="mt-4 px-1"
            style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}
          >
            {CAR_LIST_DISCLAIMER}
          </p>
        </main>

        <BottomTabBar />
      </div>
    </div>
  );
}
