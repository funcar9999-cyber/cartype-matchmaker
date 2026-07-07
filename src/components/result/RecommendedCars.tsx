import type { CarbtiType } from "@/lib/carbti-types";
import { circled, formatManwon } from "@/lib/carbti-types";

export function RecommendedCars({ type }: { type: CarbtiType }) {
  return (
    <section className="mb-3 rounded-2xl bg-slate-50 p-4">
      <div
        className="mb-1 uppercase text-slate-500"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        당신에게 어울리는 차 TOP 3
      </div>
      <div className="mb-3 font-medium" style={{ fontSize: "13px" }}>
        {type.subtitle}
      </div>

      <ul>
        {type.recommendedCars.map((car, idx) => (
          <li
            key={car.rank}
            className={
              "flex items-center justify-between py-2 " +
              (idx < type.recommendedCars.length - 1
                ? "border-b border-slate-200"
                : "")
            }
          >
            <span style={{ fontSize: "12px" }}>
              <span className="text-slate-400">{circled(car.rank)}</span>{" "}
              {car.model}
            </span>
            <span style={{ fontSize: "12px" }}>
              {formatManwon(car.priceFrom)}
            </span>
          </li>
        ))}
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
        {type.optimalPayment}
      </div>
    </section>
  );
}