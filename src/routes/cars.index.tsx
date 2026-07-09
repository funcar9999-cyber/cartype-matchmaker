import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

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

export const Route = createFileRoute("/cars")({
  head: () => ({
    meta: [
      { title: "차량 둘러보기 · CarBTI" },
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

function CarThumb({ car, badge }: { car: Car; badge?: string }) {
  return (
    <div
      className={`relative flex h-24 items-center justify-center rounded-xl bg-gradient-to-br ${car.gradient}`}
    >
      <span style={{ fontSize: "32px" }}>{car.emoji}</span>
      {badge ? (
        <span
          className="absolute left-2 top-2 rounded-full bg-white/85 px-1.5 py-0.5 font-medium text-slate-700"
          style={{ fontSize: "9px" }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function CarCard({ car, badge }: { car: Car; badge?: string }) {
  return (
    <Link
      to="/cars/$id"
      params={{ id: car.id }}
      className="block rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-accent"
    >
      <CarThumb car={car} badge={badge} />
      <div className="mt-2 font-medium text-slate-900" style={{ fontSize: "12px" }}>
        {car.name}
      </div>
      <div className="mt-0.5 flex items-center gap-1">
        <span
          className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-600"
          style={{ fontSize: "9px" }}
        >
          {car.powertrain}
        </span>
        <span className="text-slate-500" style={{ fontSize: "9px" }}>
          {car.segment}
        </span>
      </div>
      <div className="mt-1 text-slate-500" style={{ fontSize: "10px" }}>
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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => window.history.back()}
              className="flex h-7 w-7 items-center justify-center text-foreground"
              style={{ fontSize: "16px" }}
            >
              ←
            </button>
            <div>
              <div className="font-medium" style={{ fontSize: "14px" }}>
                차량 둘러보기
              </div>
              <div className="text-slate-500" style={{ fontSize: "10px" }}>
                내 유형에 맞는 차부터 보여드려요
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 필터 */}
          <div className="mb-3 space-y-1.5">
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex gap-1.5">
                {POWERTRAIN_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setPt(f.key)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1 ${
                      pt === f.key
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-border bg-white text-slate-600"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex gap-1.5">
                {PRICE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setPr(f.key)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1 ${
                      pr === f.key
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-border bg-white text-slate-600"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 유형 맞춤 or 배너 */}
          {type && myCars.length > 0 ? (
            <section className="mb-4">
              <div className="mb-2 flex items-baseline justify-between pl-1">
                <h2 className="font-medium" style={{ fontSize: "13px" }}>
                  {type.name}인 당신께
                </h2>
                <Link
                  to="/result/$typeCode"
                  params={{ typeCode: type.code }}
                  className="text-brand-primary"
                  style={{ fontSize: "10px" }}
                >
                  결과 다시 보기 →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {myCars.slice(0, 4).map((c) => (
                  <CarCard key={c.id} car={c} badge={type.code} />
                ))}
              </div>
            </section>
          ) : (
            <button
              type="button"
              onClick={() => void navigate({ to: "/diagnosis/onboarding" })}
              className="mb-4 block w-full rounded-xl border border-brand-primary/40 bg-brand-primary/5 p-3 text-left"
            >
              <div className="font-medium text-brand-primary" style={{ fontSize: "12px" }}>
                1분 진단하면 내 유형 맞춤 추천이 열려요
              </div>
              <div className="mt-0.5 text-slate-500" style={{ fontSize: "10px" }}>
                지금 카BTI 진단 시작 →
              </div>
            </button>
          )}

          {/* 전체 */}
          <section>
            <h2 className="mb-2 pl-1 font-medium" style={{ fontSize: "13px" }}>
              전체 차량 ({filtered.length})
            </h2>
            {filtered.length === 0 ? (
              <div
                className="rounded-xl border border-dashed border-border p-6 text-center text-slate-500"
                style={{ fontSize: "12px" }}
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
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {CAR_LIST_DISCLAIMER}
          </p>
        </main>

        <BottomTabBar />
      </div>
    </div>
  );
}
