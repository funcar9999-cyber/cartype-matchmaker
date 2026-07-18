import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { CarbtiType } from "@/lib/carbti-types";
import { findCarByName } from "@/lib/car-db";

export function RecommendedCars({ type }: { type: CarbtiType }) {
  const isE = type.code[2] === "E";
  const accent = isE ? "var(--teal)" : "var(--copper)";

  return (
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
      <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--hairline)" }}>
        <p style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.75, lineHeight: 1.6 }}>
          {type.bestPayment.reason}
        </p>
      </div>
    </section>
  );
}
