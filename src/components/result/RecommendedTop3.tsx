import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { MatchTop3Car } from "@/hooks/use-yacha-match";
import { CAR_DB } from "@/lib/car-db";
import { CarImage } from "@/components/common/CarImage";

export function RecommendedTop3({
  items,
  loading,
  typeCode,
}: {
  items: MatchTop3Car[];
  loading: boolean;
  typeCode?: string;
}) {
  const isE = typeCode?.[2] === "E";
  const glow = isE ? "rgba(0,181,181,0.42)" : "rgba(184,115,51,0.42)";
  return (
    <section
      className="mb-4 rounded-2xl p-5"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="mb-1"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        내 차 TOP 3
      </div>
      <div className="mb-4" style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
        정밀 매칭 결과로 뽑은 상위 3대예요
      </div>

      {loading && items.length === 0 ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="rounded-xl p-3 animate-pulse"
              style={{ backgroundColor: "rgba(0,0,0,0.03)", minHeight: 74 }}
            >
              <div className="h-3 w-24 rounded" style={{ backgroundColor: "var(--hairline)" }} />
              <div className="mt-2 h-4 w-40 rounded" style={{ backgroundColor: "var(--hairline)" }} />
              <div className="mt-2 h-2 w-32 rounded" style={{ backgroundColor: "var(--hairline)" }} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 3).map((c, idx) => {
            const chips = (c.chips ?? []).slice(0, 3);
            const dbCar = CAR_DB.find((x) => x.id === c.car_id);
            const showImage = idx < 2;
            const imgCar = dbCar ?? { image_url: undefined, name: c.name, segment: undefined as never };
            return (
              <li key={`${c.car_id}-${idx}`}>
                <Link
                  to="/cars/$id"
                  params={{ id: c.car_id }}
                  className="block rounded-xl p-3 transition active:scale-[0.99]"
                  style={{ backgroundColor: "var(--navy)", color: "var(--ivory)" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.2em",
                        color: "var(--gold)",
                        fontWeight: 700,
                      }}
                    >
                      RANK {idx + 1}
                    </span>
                    <ChevronRight size={14} color="var(--gold)" />
                  </div>
                  {showImage && (
                    <div className="mt-2">
                      <CarImage car={imgCar} height={110} rounded={10} glowColor={glow} />
                    </div>
                  )}
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span style={{ fontSize: "10.5px", opacity: 0.7 }}>{c.brand}</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.3 }}>{c.name}</span>
                  </div>
                  <div
                    className="mt-0.5"
                    style={{ fontSize: "11px", color: "rgba(245,244,240,0.75)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {c.price_range}
                  </div>
                  {chips.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full px-2 py-0.5"
                          style={{
                            fontSize: "10px",
                            backgroundColor: "rgba(245,244,240,0.12)",
                            color: "var(--ivory)",
                            fontWeight: 600,
                          }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p
        className="mt-3"
        style={{ fontSize: "10.5px", color: "var(--warm-gray)", lineHeight: 1.55 }}
      >
        가격은 제조사 공식가 기준 (예시) · 월 납입은 견적 계산기에서 확인하세요
      </p>
    </section>
  );
}