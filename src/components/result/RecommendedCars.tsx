import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { CarbtiType } from "@/lib/carbti-types";
import { circled } from "@/lib/carbti-types";
import { findCarByName } from "@/lib/car-db";
import { REASONS, STABLE_COMPARE, TYPE_REASONS } from "@/lib/payment-reasons";

export function RecommendedCars({ type }: { type: CarbtiType }) {
  const isE = type.code[2] === "E";
  const accent = isE ? "var(--teal)" : "var(--copper)";
  const config = TYPE_REASONS[type.code];
  const firstCar = findCarByName(type.topCars[0]);
  const compareSearch = firstCar ? { car: firstCar.id } : {};

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
      <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--hairline)" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.05em", color: "var(--warm-gray)", fontWeight: 700 }}>
          이 방식이 맞는 이유
        </div>
        {config?.kind === "flex" ? (
          <>
            <ul className="mt-2 space-y-2.5">
              {config.reasons.map((key, i) => (
                <li key={key} className="flex gap-2">
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: "13px", color: accent, fontWeight: 700, lineHeight: 1.55 }}
                  >
                    {circled(i + 1)}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.85, lineHeight: 1.6 }}>
                    {REASONS[key]}
                  </span>
                </li>
              ))}
            </ul>
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
  );
}
