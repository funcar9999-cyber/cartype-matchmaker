import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Product = "lease" | "rent" | "installment";
type Term = 36 | 48 | 60;
type Mileage = 15 | 20;
type Prepay = 0 | 0.1 | 0.2 | 0.3;

type Quote = {
  company: string;
  name: string;
  product: "lease" | "rent";
  monthly: number;
  rate_displayed: number | null;
};

type QuoteResponse = {
  quotes: Quote[];
  best: Quote | null;
  count: number;
  note: string;
};

type Props = {
  carId: string;
  fallback: React.ReactNode;
};

const PRODUCT_TABS: { key: Product; label: string; disabled?: boolean }[] = [
  { key: "lease", label: "리스" },
  { key: "rent", label: "장기렌트" },
  { key: "installment", label: "할부", disabled: true },
];
const TERMS: Term[] = [36, 48, 60];
const MILEAGES: { value: Mileage; label: string }[] = [
  { value: 15, label: "1.5만km" },
  { value: 20, label: "2만km" },
];
const PREPAYS: Prepay[] = [0, 0.1, 0.2, 0.3];

const sectionLabel = {
  fontSize: "10.5px",
  letterSpacing: "0.25em",
  color: "var(--warm-gray)",
  fontWeight: 700,
} as const;

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  format,
}: {
  options: { value: T; label: string; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.value)}
            className="flex-1 rounded-full px-2 py-1.5 transition active:scale-[0.98]"
            style={{
              fontSize: "11.5px",
              fontWeight: 700,
              backgroundColor: active ? "var(--midnight)" : "var(--surface)",
              color: active ? "var(--ivory)" : o.disabled ? "var(--warm-gray)" : "var(--ink)",
              border: `1px solid ${active ? "var(--midnight)" : "var(--hairline)"}`,
              opacity: o.disabled ? 0.55 : 1,
              cursor: o.disabled ? "not-allowed" : "pointer",
            }}
          >
            {o.label ?? (format ? format(o.value) : String(o.value))}
          </button>
        );
      })}
    </div>
  );
}

export function QuoteCalculator({ carId, fallback }: Props) {
  const [product, setProduct] = useState<Product>("lease");
  const [term, setTerm] = useState<Term>(48);
  const [mileage, setMileage] = useState<Mileage>(20);
  const [prepay, setPrepay] = useState<Prepay>(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrored(false);
    void (async () => {
      try {
        const { data: res, error } = await supabase.functions.invoke("quote-calc", {
          body: {
            car_id: carId,
            product: "both",
            term_months: term,
            mileage,
            prepay,
          },
        });
        if (cancelled) return;
        if (error) {
          setErrored(true);
          setData(null);
        } else {
          setData(res as QuoteResponse);
        }
      } catch (e) {
        if (!cancelled) {
          setErrored(true);
          setData(null);
          console.warn("[quote-calc] failed", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [carId, term, mileage, prepay]);

  const activeProduct: "lease" | "rent" | null =
    product === "installment" ? null : product;
  const filtered =
    data && activeProduct
      ? data.quotes.filter((q) => q.product === activeProduct)
      : [];
  const sorted = [...filtered].sort((a, b) => a.monthly - b.monthly);
  const best = sorted[0] ?? null;
  const rest = sorted.slice(1);

  const showFallback = !loading && (errored || (data?.count ?? 0) === 0);

  if (showFallback) {
    return (
      <section className="mb-4">
        <div
          className="mb-2 inline-block rounded-full px-3 py-1"
          style={{
            fontSize: "10.5px",
            color: "var(--warm-gray)",
            fontWeight: 700,
            border: "1px solid var(--hairline)",
            backgroundColor: "var(--surface)",
          }}
        >
          이 차량은 정밀 견적 준비 중이에요 · 아래는 통상 조건 예시입니다
        </div>
        {fallback}
      </section>
    );
  }

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between pl-1">
        <div style={sectionLabel}>실시간 견적 계산기</div>
      </div>

      <div
        className="rounded-2xl p-3.5"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* 상품 */}
        <div className="mb-2 pl-0.5" style={{ ...sectionLabel, fontSize: "9.5px" }}>
          상품
        </div>
        <Segmented
          options={PRODUCT_TABS.map((t) => ({ value: t.key, label: t.label, disabled: t.disabled }))}
          value={product}
          onChange={(v) => setProduct(v)}
        />
        {product === "installment" && (
          <p className="mt-1.5 pl-1" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
            카드사 조건표 반영 준비 중
          </p>
        )}

        {/* 계약기간 */}
        <div className="mt-3 mb-2 pl-0.5" style={{ ...sectionLabel, fontSize: "9.5px" }}>
          계약기간
        </div>
        <Segmented
          options={TERMS.map((t) => ({ value: t, label: `${t}개월` }))}
          value={term}
          onChange={(v) => setTerm(v)}
        />

        {/* 연 주행거리 */}
        <div className="mt-3 mb-2 pl-0.5" style={{ ...sectionLabel, fontSize: "9.5px" }}>
          연 주행거리
        </div>
        <Segmented
          options={MILEAGES.map((m) => ({ value: m.value, label: m.label }))}
          value={mileage}
          onChange={(v) => setMileage(v)}
        />

        {/* 선납금 */}
        <div className="mt-3 mb-2 pl-0.5" style={{ ...sectionLabel, fontSize: "9.5px" }}>
          선납금
        </div>
        <Segmented
          options={PREPAYS.map((p) => ({ value: p, label: `${Math.round(p * 100)}%` }))}
          value={prepay}
          onChange={(v) => setPrepay(v)}
        />

        {/* 결과 */}
        <div
          className="mt-4 rounded-xl p-3.5"
          style={{
            backgroundColor: "var(--midnight)",
            color: "var(--ivory)",
            minHeight: 104,
          }}
        >
          {loading || !data ? (
            <div className="animate-pulse">
              <div className="h-2.5 w-24 rounded" style={{ backgroundColor: "rgba(245,244,240,0.15)" }} />
              <div
                className="mt-2 h-6 w-40 rounded"
                style={{ backgroundColor: "rgba(245,244,240,0.18)" }}
              />
              <div
                className="mt-2 h-2 w-48 rounded"
                style={{ backgroundColor: "rgba(245,244,240,0.12)" }}
              />
            </div>
          ) : best ? (
            <>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  fontWeight: 700,
                  color: "var(--gold-soft)",
                }}
              >
                {product === "lease" ? "리스" : "장기렌트"} · 최저 조건
              </div>
              <div
                className="mt-1.5"
                style={{ fontSize: "22px", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
              >
                월 {best.monthly}만원{" "}
                <span style={{ fontSize: "12px", fontWeight: 600, opacity: 0.75 }}>(예시)</span>
              </div>
              <div className="mt-1" style={{ fontSize: "10.5px", opacity: 0.8, lineHeight: 1.5 }}>
                제휴 {data.count}개사 조건 중 최저 · {data.note}
              </div>
              {product === "lease" && best.rate_displayed != null && (
                <div className="mt-1" style={{ fontSize: "10.5px", color: "var(--gold-soft)", fontWeight: 700 }}>
                  금리 연 {best.rate_displayed}%
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: "12px", opacity: 0.85 }}>
              선택한 조건의 견적이 아직 준비 중이에요
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <ul className="mt-2 divide-y" style={{ borderColor: "var(--hairline)" }}>
            {rest.map((q) => (
              <li
                key={`${q.company}-${q.product}`}
                className="flex items-center justify-between py-2"
              >
                <span style={{ fontSize: "12px", color: "var(--ink)" }}>{q.name}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--ink)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  월 {q.monthly}만원 <span style={{ fontWeight: 500, color: "var(--warm-gray)" }}>(예시)</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}