import { Link } from "@tanstack/react-router";

import type { CarbtiType } from "@/lib/carbti-types";
import { circled } from "@/lib/carbti-types";
import { findCarByName } from "@/lib/car-db";

export function RecommendedCars({ type }: { type: CarbtiType }) {
  return (
    <section className="mb-3 rounded-2xl bg-slate-50 p-4">
      <div
        className="mb-1 uppercase text-slate-500"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        {type.name}의 대표 차량
      </div>
      <div className="mb-3 font-medium" style={{ fontSize: "13px" }}>
        {type.tagline}
      </div>

      <ul>
        {type.topCars.slice(0, 2).map((model, idx) => {
          const car = findCarByName(model);
          const rowClass =
            "flex items-center justify-between py-2 " +
            (idx < 1 ? "border-b border-slate-200" : "");
          const inner = (
            <>
              <span style={{ fontSize: "12px" }}>
                <span className="text-slate-400">{circled(idx + 1)}</span>{" "}
                {model}
              </span>
              {car && (
                <span
                  className="text-brand-primary"
                  style={{ fontSize: "11px" }}
                >
                  &gt; 자세히
                </span>
              )}
            </>
          );
          if (car) {
            return (
              <li key={model} className={rowClass}>
                <Link
                  to="/cars/$id"
                  params={{ id: car.id }}
                  className="flex w-full items-center justify-between"
                >
                  {inner}
                </Link>
              </li>
            );
          }
          return (
            <li key={model} className={rowClass}>
              {inner}
            </li>
          );
        })}
      </ul>

      <div
        className="mt-3 mb-2 uppercase text-slate-500"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        최적 결제 방식
      </div>
      <div
        className="rounded-lg border border-slate-200 bg-white px-3 py-2"
        style={{ fontSize: "11px" }}
      >
        <div className="font-medium text-slate-900">
          {type.bestPayment.method}
        </div>
        <p className="mt-1 text-slate-500" style={{ lineHeight: 1.5 }}>
          {type.bestPayment.reason}
        </p>
      </div>
    </section>
  );
}