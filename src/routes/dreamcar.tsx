import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Search, Check } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { CAR_DB } from "@/lib/car-db";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { IntentCtaSet } from "@/components/cta/IntentCtaSet";
import { CarImage } from "@/components/common/CarImage";
import { track } from "@/lib/events";
import { CARBTI_TYPES } from "@/lib/carbti-types";

const searchSchema = z.object({
  car: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/dreamcar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "드림카 승인 확인 · 야차" },
      {
        name: "description",
        content: "1분 예상 진단으로 내가 어느 차까지 갈 수 있는지 확인해요.",
      },
      { property: "og:title", content: "드림카 승인 확인 · 야차" },
      {
        property: "og:description",
        content: "1분 예상 진단으로 내가 어느 차까지 갈 수 있는지 확인해요.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DreamcarPage,
});

type Product = "recommend" | "rent" | "lease" | "installment";
type Verdict = "high" | "mid" | "consult";
type ApproveResponse = {
  verdict: Verdict;
  capacity: { rent: number; lease: number; installment: number };
  limits: { rent: number; lease: number; installment: number };
  est_monthly: number | null;
  tips: string[];
  approval_id?: string;
};

const POPULAR_IDS = [
  "tesla-model3",
  "ioniq5",
  "ev6",
  "santafe-hev",
  "sorento-hev",
  "avante",
  "gv70",
  "carnival",
];
const APPROVAL_SESSION_KEY = "yacha:approval";

function fmtManwon(won: number | null | undefined): string {
  if (won == null || !Number.isFinite(won)) return "—";
  const manwon = Math.round(won / 10000);
  if (manwon >= 1000) {
    const baekman = Math.round(manwon / 100) * 100;
    return `약 ${baekman.toLocaleString("ko-KR")}만원대`;
  }
  return `약 ${manwon.toLocaleString("ko-KR")}만원`;
}
function fmtMonthlyManwon(won: number | null | undefined): string {
  if (won == null || !Number.isFinite(won)) return "—";
  return `${Math.round(won / 10000).toLocaleString("ko-KR")}만원`;
}
function fmtMonthlyRoundedTens(won: number | null | undefined): string | null {
  if (won == null || !Number.isFinite(won)) return null;
  const manwon = Math.round(won / 10000);
  const tens = Math.max(10, Math.round(manwon / 10) * 10);
  return `약 ${tens.toLocaleString("ko-KR")}만원대`;
}

function DreamcarPage() {
  const navigate = useNavigate();
  const { car: prefillCarId } = Route.useSearch();
  const { user, code: carbtiCode, refresh } = useMyCarbti();

  // 진입 모드: 차량 프리필(차량 상세 진입) vs 직접 진입(홈/URL)
  const entryMode: "prefill" | "direct" = prefillCarId ? "prefill" : "direct";
  const [step, setStep] = useState<1 | 2 | 3 | "result">(
    entryMode === "direct" ? 2 : 1,
  );

  // Step 1
  const [carId, setCarId] = useState<string | null>(prefillCarId ?? null);
  const [noCar, setNoCar] = useState<boolean>(false);
  const [query, setQuery] = useState("");

  // Step 2
  const [product, setProduct] = useState<Product>("recommend");
  const [term, setTerm] = useState<36 | 48 | 60>(48);
  const [prepayPct, setPrepayPct] = useState<number>(0); // 0..30

  // Step 3
  const [score, setScore] = useState<number>(700);
  const [income, setIncome] = useState<string>("");
  const [debt, setDebt] = useState<string>("");
  const [delinqNow, setDelinqNow] = useState(false);
  const [delinqPast, setDelinqPast] = useState(false);
  const [cardloan, setCardloan] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApproveResponse | null>(null);
  // 결과 화면에서 드림카 판정을 위한 추가 상태
  const [dreamPickCarId, setDreamPickCarId] = useState<string | null>(null);
  const [dreamPickQuery, setDreamPickQuery] = useState("");
  const [dreamPickResult, setDreamPickResult] = useState<ApproveResponse | null>(null);
  const [dreamPickLoading, setDreamPickLoading] = useState(false);

  useEffect(() => {
    if (prefillCarId) {
      setCarId(prefillCarId);
      setNoCar(false);
    }
  }, [prefillCarId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as typeof CAR_DB;
    return CAR_DB.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        (c.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [query]);

  const popular = useMemo(
    () => POPULAR_IDS.map((id) => CAR_DB.find((c) => c.id === id)).filter(Boolean) as typeof CAR_DB,
    [],
  );
  const selectedCar = carId ? CAR_DB.find((c) => c.id === carId) ?? null : null;

  const canNext1 = !!carId || noCar;
  const canSubmit =
    score >= 300 &&
    score <= 1000 &&
    Number(income) > 0 &&
    Number(debt) >= 0;

  const handleBack = () => {
    if (step === 1 || (entryMode === "direct" && step === 2)) {
      void navigate({ to: "/" });
      return;
    }
    if (step === "result") {
      setStep(3);
      return;
    }
    setStep(((step as number) - 1) as 1 | 2 | 3);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const session_id =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("yacha_sid")
          : null;
      const body: Record<string, unknown> = {
        source: "self",
        inputs: {
          score,
          income_year_manwon: Number(income),
          debt_monthly_manwon: Number(debt),
          delinq_now: delinqNow,
          delinq_past: delinqPast,
          cardloan,
        },
        product,
        term_months: term,
        prepay_ratio: prepayPct / 100,
        session_id,
        user_id: sess.session?.user?.id ?? null,
      };
      if (carId && !noCar) body.car_id = carId;

      const { data, error: fnErr } = await supabase.functions.invoke("yacha-approve", { body });
      if (fnErr) throw fnErr;
      const res = data as ApproveResponse;
      setResult(res);
      try {
        sessionStorage.setItem(
          APPROVAL_SESSION_KEY,
          JSON.stringify({
            ...res,
            dream_car: selectedCar
              ? selectedCar.name.startsWith(selectedCar.brand)
                ? selectedCar.name
                : `${selectedCar.brand} ${selectedCar.name}`
              : null,
            saved_at: Date.now(),
          }),
        );
      } catch {
        /* ignore */
      }
      track("dreamcar_submit", {
        verdict: res.verdict,
        product,
        term,
        car_id: carId ?? null,
        entry_mode: entryMode,
      });
      // 로그인 사용자의 approvals 재조회
      void refresh();
      setStep("result");
    } catch (e) {
      console.warn("[yacha-approve]", e);
      setError("일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 결과 화면에서 드림카를 골랐을 때 저장된 진단으로 재판정
  const runDreamPick = async (pickId: string) => {
    setDreamPickLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const session_id =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("yacha_sid")
          : null;
      const body: Record<string, unknown> = {
        source: "self",
        inputs: {
          score,
          income_year_manwon: Number(income),
          debt_monthly_manwon: Number(debt),
          delinq_now: delinqNow,
          delinq_past: delinqPast,
          cardloan,
        },
        product,
        term_months: term,
        prepay_ratio: prepayPct / 100,
        session_id,
        user_id: sess.session?.user?.id ?? null,
        car_id: pickId,
      };
      const { data, error: fnErr } = await supabase.functions.invoke("yacha-approve", { body });
      if (fnErr) throw fnErr;
      setDreamPickResult(data as ApproveResponse);
      track("dreamcar_submit", {
        verdict: (data as ApproveResponse).verdict,
        product,
        term,
        car_id: pickId,
        entry_mode: "direct_result_pick",
      });
    } catch (e) {
      console.warn("[yacha-approve pick]", e);
    } finally {
      setDreamPickLoading(false);
    }
  };

  const dreamPickFiltered = useMemo(() => {
    const q = dreamPickQuery.trim().toLowerCase();
    if (!q) return [] as typeof CAR_DB;
    return CAR_DB.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        (c.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [dreamPickQuery]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <TopBar step={step} onBack={handleBack} entryMode={entryMode} />
        <main className="flex-1 px-4 py-4">
          {step === 1 && (
            <Step1
              carId={carId}
              setCarId={(id) => {
                setCarId(id);
                setNoCar(false);
              }}
              noCar={noCar}
              setNoCar={(v) => {
                setNoCar(v);
                if (v) setCarId(null);
              }}
              query={query}
              setQuery={setQuery}
              filtered={filtered}
              popular={popular}
              onNext={() => setStep(2)}
              canNext={canNext1}
            />
          )}
          {step === 2 && (
            <Step2
              product={product}
              setProduct={setProduct}
              term={term}
              setTerm={setTerm}
              prepayPct={prepayPct}
              setPrepayPct={setPrepayPct}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              score={score}
              setScore={setScore}
              income={income}
              setIncome={setIncome}
              debt={debt}
              setDebt={setDebt}
              delinqNow={delinqNow}
              setDelinqNow={setDelinqNow}
              delinqPast={delinqPast}
              setDelinqPast={setDelinqPast}
              cardloan={cardloan}
              setCardloan={setCardloan}
              submitting={submitting}
              error={error}
              onSubmit={submit}
              canSubmit={canSubmit}
            />
          )}
          {step === "result" && result && (
            <ResultView
              result={result}
              car={selectedCar}
              hasCarbti={!!(carbtiCode && CARBTI_TYPES[carbtiCode])}
              userSignedIn={!!user}
              onGoCars={() => void navigate({ to: "/cars" })}
              showDreamPick={entryMode === "direct" && !carId}
              dreamPickCarId={dreamPickCarId}
              onDreamPick={(id) => {
                setDreamPickCarId(id);
                setDreamPickResult(null);
                if (id) void runDreamPick(id);
              }}
              dreamPickResult={dreamPickResult}
              dreamPickLoading={dreamPickLoading}
              dreamPickQuery={dreamPickQuery}
              setDreamPickQuery={setDreamPickQuery}
              dreamPickFiltered={dreamPickFiltered}
              popular={popular}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ─────────── Top bar ─────────── */

function TopBar({
  step,
  onBack,
  entryMode,
}: {
  step: 1 | 2 | 3 | "result";
  onBack: () => void;
  entryMode: "prefill" | "direct";
}) {
  const label =
    entryMode === "direct"
      ? step === 2
        ? "1 / 2 · 조건"
        : step === 3
          ? "2 / 2 · 1분 예상 진단"
          : "결과"
      : step === 1
        ? "1 / 3 · 드림카 선택"
        : step === 2
          ? "2 / 3 · 조건"
          : step === 3
            ? "3 / 3 · 1분 예상 진단"
            : "결과";
  const pct =
    step === "result"
      ? 100
      : entryMode === "direct"
        ? (((step as number) - 1) / 2) * 100
        : ((step as number) / 3) * 100;

  return (
    <div>
      <div className="flex items-center gap-2 px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex h-8 w-8 items-center justify-center"
          style={{ color: "var(--ink)" }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="flex-1 text-center"
          style={{ fontSize: "11px", color: "var(--warm-gray)", letterSpacing: "0.05em" }}
        >
          {label}
        </div>
        <div className="h-8 w-8" />
      </div>
      <div className="mx-4 h-0.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--hairline)" }}>
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: "var(--midnight)" }}
        />
      </div>
    </div>
  );
}

/* ─────────── Step 1: 드림카 선택 ─────────── */

function Step1({
  carId,
  setCarId,
  noCar,
  setNoCar,
  query,
  setQuery,
  filtered,
  popular,
  onNext,
  canNext,
}: {
  carId: string | null;
  setCarId: (id: string | null) => void;
  noCar: boolean;
  setNoCar: (v: boolean) => void;
  query: string;
  setQuery: (v: string) => void;
  filtered: typeof CAR_DB;
  popular: typeof CAR_DB;
  onNext: () => void;
  canNext: boolean;
}) {
  const selected = carId ? CAR_DB.find((c) => c.id === carId) : null;
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--ink)", lineHeight: 1.25 }}>
        어떤 차, 될지 궁금하세요?
      </h1>
      <p className="mt-1" style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
        차를 골라도, 아직 못 정했어도 괜찮아요.
      </p>

      {selected && (
        <div
          className="mt-4 flex items-center justify-between rounded-xl border p-3"
          style={{
            borderColor: "var(--midnight)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 88, flexShrink: 0 }}>
              <CarImage car={selected} height={52} rounded={8} />
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--gold)", letterSpacing: "0.15em", fontWeight: 700 }}>
                선택됨
              </div>
              <div className="mt-0.5" style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                {selected.brand} {selected.name}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCarId(null)}
            style={{ fontSize: "11px", color: "var(--warm-gray)" }}
          >
            변경
          </button>
        </div>
      )}

      <div
        className="mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5"
        style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}
      >
        <Search size={16} color="var(--warm-gray)" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="브랜드나 차명 검색 (예: 아반떼, EV6)"
          className="w-full bg-transparent outline-none"
          style={{ fontSize: "13px", color: "var(--ink)" }}
        />
      </div>
      {filtered.length > 0 && (
        <div className="mt-2 rounded-xl border" style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}>
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCarId(c.id);
                setQuery("");
              }}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
              style={{ borderTop: "1px solid var(--hairline)", fontSize: "13px", color: "var(--ink)" }}
            >
              <span>
                <span style={{ color: "var(--warm-gray)" }}>{c.brand}</span>{" "}
                <span style={{ fontWeight: 700 }}>{c.name}</span>
              </span>
              <span style={{ fontSize: "10px", color: "var(--warm-gray)" }}>{c.segment}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5" style={{ fontSize: "11px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
        인기 차량
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {popular.map((c) => {
          const active = carId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCarId(c.id)}
              className="rounded-full border px-3 py-1.5 transition active:scale-[0.98]"
              style={{
                fontSize: "12px",
                borderColor: active ? "var(--midnight)" : "var(--hairline)",
                backgroundColor: active ? "var(--midnight)" : "var(--surface)",
                color: active ? "var(--ivory)" : "var(--ink)",
                fontWeight: active ? 700 : 500,
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setNoCar(!noCar)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 transition active:scale-[0.99]"
        style={{
          borderColor: noCar ? "var(--midnight)" : "var(--hairline)",
          backgroundColor: noCar ? "var(--midnight)" : "var(--surface)",
          color: noCar ? "var(--ivory)" : "var(--ink)",
          fontSize: "13px",
          fontWeight: noCar ? 700 : 500,
        }}
      >
        <span>아직 못 정했어요 — 여력만 확인할래요</span>
        {noCar && <Check size={16} />}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="mt-6 w-full rounded-xl py-3.5 transition active:scale-[0.98]"
        style={{
          backgroundColor: canNext ? "var(--midnight)" : "var(--hairline)",
          color: "var(--ivory)",
          fontSize: "14px",
          fontWeight: 700,
          opacity: canNext ? 1 : 0.6,
        }}
      >
        다음
      </button>
    </div>
  );
}

/* ─────────── Step 2: 조건 ─────────── */

const PRODUCTS: { key: Product; label: string; hint: string }[] = [
  { key: "recommend", label: "추천받기", hint: "야차가 최적 방식으로 판단" },
  { key: "rent", label: "장기렌트", hint: "월 부담 최소, 유지비 포함" },
  { key: "lease", label: "리스", hint: "세금·비용처리 유리" },
  { key: "installment", label: "할부", hint: "내 명의로 소유" },
];
const TERMS: (36 | 48 | 60)[] = [36, 48, 60];

function Step2({
  product,
  setProduct,
  term,
  setTerm,
  prepayPct,
  setPrepayPct,
  onNext,
}: {
  product: Product;
  setProduct: (v: Product) => void;
  term: 36 | 48 | 60;
  setTerm: (v: 36 | 48 | 60) => void;
  prepayPct: number;
  setPrepayPct: (v: number) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--ink)", lineHeight: 1.25 }}>
        어떤 조건으로 볼까요?
      </h1>
      <p className="mt-1" style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
        마음에 걸리는 게 있으면 그대로 두세요.
      </p>

      <div className="mt-5" style={{ fontSize: "11px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
        이용 방식
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {PRODUCTS.map((p) => {
          const active = product === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setProduct(p.key)}
              className="rounded-xl border p-3 text-left transition active:scale-[0.98]"
              style={{
                borderColor: active ? "var(--midnight)" : "var(--hairline)",
                backgroundColor: active ? "var(--midnight)" : "var(--surface)",
                color: active ? "var(--ivory)" : "var(--ink)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{p.label}</div>
              <div
                className="mt-1"
                style={{
                  fontSize: "10.5px",
                  color: active ? "rgba(245,244,240,0.75)" : "var(--warm-gray)",
                }}
              >
                {p.hint}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5" style={{ fontSize: "11px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
        기간
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {TERMS.map((t) => {
          const active = term === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className="rounded-xl border py-2.5 transition active:scale-[0.98]"
              style={{
                borderColor: active ? "var(--midnight)" : "var(--hairline)",
                backgroundColor: active ? "var(--midnight)" : "var(--surface)",
                color: active ? "var(--ivory)" : "var(--ink)",
                fontSize: "13px",
                fontWeight: active ? 700 : 500,
              }}
            >
              {t}개월
            </button>
          );
        })}
      </div>

      <div className="mt-5" style={{ fontSize: "11px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
        선납 비율
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[0, 10, 20, 30].map((v) => {
          const active = prepayPct === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setPrepayPct(v)}
              className="rounded-xl border py-2.5 transition active:scale-[0.98]"
              style={{
                borderColor: active ? "var(--midnight)" : "var(--hairline)",
                backgroundColor: active ? "var(--midnight)" : "var(--surface)",
                color: active ? "var(--ivory)" : "var(--ink)",
                fontSize: "13px",
                fontWeight: active ? 700 : 500,
              }}
            >
              {v}%
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-6 w-full rounded-xl py-3.5 transition active:scale-[0.98]"
        style={{
          backgroundColor: "var(--midnight)",
          color: "var(--ivory)",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        다음
      </button>
    </div>
  );
}

/* ─────────── Step 3: 1분 예상 진단 ─────────── */

function Step3({
  score,
  setScore,
  income,
  setIncome,
  debt,
  setDebt,
  delinqNow,
  setDelinqNow,
  delinqPast,
  setDelinqPast,
  cardloan,
  setCardloan,
  submitting,
  error,
  onSubmit,
  canSubmit,
}: {
  score: number;
  setScore: (v: number) => void;
  income: string;
  setIncome: (v: string) => void;
  debt: string;
  setDebt: (v: string) => void;
  delinqNow: boolean;
  setDelinqNow: (v: boolean) => void;
  delinqPast: boolean;
  setDelinqPast: (v: boolean) => void;
  cardloan: boolean;
  setCardloan: (v: boolean) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--ink)", lineHeight: 1.25 }}>
        1분 예상 진단
      </h1>
      <p className="mt-1" style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
        정확하지 않아도 괜찮아요 — 예상 진단이에요.
      </p>

      <div className="mt-5 flex items-baseline justify-between">
        <div style={{ fontSize: "12px", color: "var(--ink)", fontWeight: 700 }}>신용점수</div>
        <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--ink)" }}>{score}</div>
      </div>
      <div style={{ fontSize: "10.5px", color: "var(--warm-gray)" }}>
        토스·카카오뱅크에서 본 점수, 대략이면 돼요
      </div>
      <input
        type="range"
        min={300}
        max={1000}
        step={10}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="mt-2 w-full"
        style={{ accentColor: "var(--midnight)" }}
      />
      <div className="mt-1 flex justify-between" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
        <span>300</span><span>650</span><span>1000</span>
      </div>

      <NumField
        label="연소득"
        hint="세전 기준, 대략"
        suffix="만원"
        value={income}
        onChange={setIncome}
      />
      <NumField
        label="매달 갚는 돈"
        hint="대출·할부·카드론 상환액을 합쳐서"
        suffix="만원"
        value={debt}
        onChange={setDebt}
      />

      <div className="mt-4 space-y-2">
        <CheckRow
          checked={delinqNow}
          onToggle={() => setDelinqNow(!delinqNow)}
          label="최근 1년 안에 연체가 있었어요"
        />
        <CheckRow
          checked={delinqPast}
          onToggle={() => setDelinqPast(!delinqPast)}
          label="예전에 연체한 적이 있어요"
        />
        <CheckRow
          checked={cardloan}
          onToggle={() => setCardloan(!cardloan)}
          label="카드론 이용 중이에요"
        />
      </div>

      {error && (
        <div
          className="mt-4 rounded-xl px-3 py-2.5"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--hairline)",
            fontSize: "12px",
            color: "var(--ink)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className="mt-5 w-full rounded-xl py-3.5 transition active:scale-[0.98]"
        style={{
          backgroundColor: canSubmit && !submitting ? "var(--midnight)" : "var(--hairline)",
          color: "var(--ivory)",
          fontSize: "14px",
          fontWeight: 700,
          opacity: canSubmit && !submitting ? 1 : 0.7,
        }}
      >
        {submitting ? "확인 중..." : "여력 확인하기"}
      </button>
      <p className="mt-3 text-center" style={{ fontSize: "10.5px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
        예상 진단이에요 — 실제 조건은 금융사 심사에 따라 달라질 수 있어요
      </p>
    </div>
  );
}

function NumField({
  label,
  hint,
  suffix,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <div style={{ fontSize: "12px", color: "var(--ink)", fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: "10.5px", color: "var(--warm-gray)" }}>{hint}</div>
      </div>
      <div
        className="mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-2.5"
        style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}
      >
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          className="w-full bg-transparent outline-none"
          style={{ fontSize: "14px", color: "var(--ink)" }}
        />
        <span style={{ fontSize: "12px", color: "var(--warm-gray)" }}>{suffix}</span>
      </div>
    </div>
  );
}

function CheckRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99]"
      style={{
        borderColor: checked ? "var(--midnight)" : "var(--hairline)",
        backgroundColor: checked ? "var(--midnight)" : "var(--surface)",
        color: checked ? "var(--ivory)" : "var(--ink)",
        fontSize: "12.5px",
      }}
    >
      <span>{label}</span>
      <span
        className="ml-2 flex h-5 w-5 items-center justify-center rounded-md"
        style={{
          backgroundColor: checked ? "var(--gold)" : "transparent",
          border: checked ? "none" : "1px solid var(--hairline)",
        }}
      >
        {checked && <Check size={13} color="var(--midnight)" />}
      </span>
    </button>
  );
}

/* ─────────── Result View ─────────── */

function ResultView({
  result,
  car,
  hasCarbti,
  userSignedIn: _userSignedIn,
  onGoCars,
  showDreamPick,
  dreamPickCarId,
  onDreamPick,
  dreamPickResult,
  dreamPickLoading,
  dreamPickQuery,
  setDreamPickQuery,
  dreamPickFiltered,
  popular,
}: {
  result: ApproveResponse;
  car: (typeof CAR_DB)[number] | null;
  hasCarbti: boolean;
  userSignedIn: boolean;
  onGoCars: () => void;
  showDreamPick: boolean;
  dreamPickCarId: string | null;
  onDreamPick: (id: string | null) => void;
  dreamPickResult: ApproveResponse | null;
  dreamPickLoading: boolean;
  dreamPickQuery: string;
  setDreamPickQuery: (v: string) => void;
  dreamPickFiltered: typeof CAR_DB;
  popular: typeof CAR_DB;
}) {
  const carName = car ? `${car.brand} ${car.name}` : null;
  const heroTitle =
    carName
      ? result.verdict === "high"
        ? `${carName}, 갈 수 있어요`
        : result.verdict === "mid"
          ? "지금 조건으론 빠듯해요 — 길이 있어요"
          : "함께 설계가 필요해요"
      : "당신의 여력을 확인했어요";

  const badge =
    result.verdict === "high"
      ? { label: "여력 높음", bg: "var(--teal)", fg: "var(--ivory)" }
      : result.verdict === "mid"
        ? { label: "조정 필요", bg: "var(--gold)", fg: "var(--midnight)" }
        : { label: "상담 필요", bg: "var(--warm-gray)", fg: "var(--ivory)" };

  // 방식별 정렬 — limits 큰 순
  type Method = "rent" | "lease" | "installment";
  const methodLabel: Record<Method, string> = {
    rent: "장기렌트",
    lease: "리스",
    installment: "할부",
  };
  const rows = (["rent", "lease", "installment"] as Method[])
    .map((k) => ({ k, limit: result.limits[k], capacity: result.capacity[k] }))
    .sort((a, b) => b.limit - a.limit);

  const topMethod = rows[0];
  const carPrice = car ? ((car.priceMinManwon + car.priceMaxManwon) / 2) * 10000 : null;
  const gaugePct = carPrice && topMethod.limit > 0
    ? Math.min(120, Math.round((carPrice / topMethod.limit) * 100))
    : null;
  const withinLimit = carPrice != null ? carPrice <= topMethod.limit : null;

  return (
    <div>
      {/* 히어로 */}
      <section
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--midnight)",
          color: "var(--ivory)",
          boxShadow: "var(--shadow-dark)",
        }}
      >
        <span
          className="inline-flex rounded-full px-2.5 py-0.5"
          style={{
            backgroundColor: badge.bg,
            color: badge.fg,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {badge.label}
        </span>
        <h1 className="mt-3" style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.25 }}>
          {heroTitle}
        </h1>
        {result.est_monthly != null && (
          <div className="mt-2" style={{ fontSize: "12px", opacity: 0.8 }}>
            {carName ? `${carName} · ` : ""}예상 월 {fmtMonthlyManwon(result.est_monthly)}
          </div>
        )}
      </section>

      {/* 내 여력 카드 */}
      <section
        className="mt-4 rounded-2xl p-5"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--hairline)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ fontSize: "10.5px", color: "var(--warm-gray)", letterSpacing: "0.15em", fontWeight: 700 }}>
          MY CAPACITY
        </div>
        <div className="mt-1" style={{ fontSize: "16px", fontWeight: 800, color: "var(--ink)" }}>
          어느 차까지 갈 수 있나
        </div>
        <ul className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <li
              key={r.k}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{
                backgroundColor: i === 0 ? "var(--midnight)" : "transparent",
                color: i === 0 ? "var(--ivory)" : "var(--ink)",
                border: i === 0 ? "none" : "1px solid var(--hairline)",
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{methodLabel[r.k]}</span>
                {i === 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--midnight)",
                      backgroundColor: "var(--gold)",
                      padding: "2px 6px",
                      borderRadius: "999px",
                      fontWeight: 700,
                    }}
                  >
                    한도 최대
                  </span>
                )}
                {r.k === "rent" && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: i === 0 ? "var(--ivory)" : "var(--warm-gray)",
                      border: `1px solid ${i === 0 ? "rgba(245,244,240,0.35)" : "var(--hairline)"}`,
                      padding: "1px 6px",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}
                  >
                    보험·정비·세금 다 포함
                  </span>
                )}
              </div>
              <div className="text-right">
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{fmtManwon(r.limit)}</div>
                <div
                  style={{
                    fontSize: "10.5px",
                    opacity: i === 0 ? 0.75 : 1,
                    color: i === 0 ? "var(--ivory)" : "var(--warm-gray)",
                  }}
                >
                  월 여력 {fmtMonthlyManwon(r.capacity)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 게이지 */}
      {carPrice != null && gaugePct != null && (
        <section
          className="mt-4 rounded-2xl p-5"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--hairline)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-baseline justify-between">
            <div style={{ fontSize: "12px", color: "var(--ink)", fontWeight: 700 }}>
              한도 대비 드림카 가격
            </div>
            <div style={{ fontSize: "10.5px", color: "var(--warm-gray)" }}>
              기준 · {methodLabel[topMethod.k]}
            </div>
          </div>
          <div className="relative mt-3 h-3 overflow-hidden rounded-full" style={{ backgroundColor: "var(--hairline)" }}>
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, gaugePct)}%`,
                backgroundColor: withinLimit ? "var(--teal)" : "var(--gold)",
              }}
            />
            <div
              className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2"
              style={{
                left: `${Math.min(100, gaugePct)}%`,
                backgroundColor: "var(--midnight)",
              }}
            />
          </div>
          <div className="mt-2 flex justify-between" style={{ fontSize: "11px", color: "var(--ink)" }}>
            <span>드림카 {fmtManwon(carPrice)}</span>
            <span style={{ color: withinLimit ? "var(--teal)" : "var(--gold)", fontWeight: 700 }}>
              {withinLimit
                ? `여유 ${fmtManwon(topMethod.limit - carPrice)}`
                : `초과 ${fmtManwon(carPrice - topMethod.limit)}`}
            </span>
          </div>
          {result.est_monthly != null && (
            <div className="mt-1 text-right" style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
              예상 월 {fmtMonthlyManwon(result.est_monthly)}
            </div>
          )}
        </section>
      )}

      {/* Tips */}
      {result.tips && result.tips.length > 0 && (
        <section
          className="mt-4 rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(201,169,106,0.12)",
            border: "1px solid var(--gold)",
          }}
        >
          <div style={{ fontSize: "10.5px", color: "var(--gold)", letterSpacing: "0.15em", fontWeight: 700 }}>
            여력을 넓히는 팁
          </div>
          <ul className="mt-2 space-y-1.5">
            {result.tips.map((t) => (
              <li key={t} className="flex items-start gap-2" style={{ fontSize: "12px", color: "var(--ink)", lineHeight: 1.55 }}>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onGoCars}
        className="mt-4 w-full rounded-xl py-3.5 transition active:scale-[0.98]"
        style={{
          backgroundColor: "var(--midnight)",
          color: "var(--ivory)",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        내 기준으로 차량 둘러보기 →
      </button>

      {showDreamPick && (
        <section
          className="mt-5 rounded-2xl p-5"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--hairline)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)", lineHeight: 1.35 }}>
            드림카가 있다면? — 그 차, 될까 바로 알려드려요
          </div>
          <p className="mt-1" style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
            방금 입력한 진단으로 즉시 판정해요.
          </p>

          {dreamPickCarId ? (
            (() => {
              const picked = CAR_DB.find((c) => c.id === dreamPickCarId);
              if (!picked) return null;
              const v = dreamPickResult?.verdict;
              const bg =
                v === "high"
                  ? { label: "여력 높음", bg: "var(--teal)", fg: "var(--ivory)" }
                  : v === "mid"
                    ? { label: "조정 필요", bg: "var(--gold)", fg: "var(--midnight)" }
                    : v === "consult"
                      ? { label: "상담 필요", bg: "var(--warm-gray)", fg: "var(--ivory)" }
                      : null;
              return (
                <div
                  className="mt-3 rounded-xl p-3"
                  style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--hairline)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--warm-gray)", letterSpacing: "0.15em", fontWeight: 700 }}>
                        선택됨
                      </div>
                      <div className="mt-0.5" style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                        {picked.brand} {picked.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDreamPick(null)}
                      style={{ fontSize: "11px", color: "var(--warm-gray)" }}
                    >
                      변경
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {dreamPickLoading || !bg ? (
                      <span style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
                        {dreamPickLoading ? "확인 중..." : "판정 대기"}
                      </span>
                    ) : (
                      <>
                        <span
                          className="inline-flex rounded-full px-2.5 py-0.5"
                          style={{
                            backgroundColor: bg.bg,
                            color: bg.fg,
                            fontSize: "10.5px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {bg.label}
                        </span>
                        {dreamPickResult?.est_monthly != null && (
                          <span style={{ fontSize: "12px", color: "var(--ink)", fontWeight: 700 }}>
                            예상 월 {fmtMonthlyManwon(dreamPickResult.est_monthly)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              <div
                className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5"
                style={{ borderColor: "var(--hairline)", backgroundColor: "var(--ivory)" }}
              >
                <Search size={16} color="var(--warm-gray)" />
                <input
                  type="text"
                  value={dreamPickQuery}
                  onChange={(e) => setDreamPickQuery(e.target.value)}
                  placeholder="브랜드나 차명 검색"
                  className="w-full bg-transparent outline-none"
                  style={{ fontSize: "13px", color: "var(--ink)" }}
                />
              </div>
              {dreamPickFiltered.length > 0 && (
                <div
                  className="mt-2 rounded-xl border"
                  style={{ borderColor: "var(--hairline)", backgroundColor: "var(--ivory)" }}
                >
                  {dreamPickFiltered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onDreamPick(c.id);
                        setDreamPickQuery("");
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                      style={{ borderTop: "1px solid var(--hairline)", fontSize: "13px", color: "var(--ink)" }}
                    >
                      <span>
                        <span style={{ color: "var(--warm-gray)" }}>{c.brand}</span>{" "}
                        <span style={{ fontWeight: 700 }}>{c.name}</span>
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--warm-gray)" }}>{c.segment}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {popular.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onDreamPick(c.id)}
                    className="rounded-full border px-3 py-1.5 transition active:scale-[0.98]"
                    style={{
                      fontSize: "12px",
                      borderColor: "var(--hairline)",
                      backgroundColor: "var(--ivory)",
                      color: "var(--ink)",
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <IntentCtaSet
        screen="car_detail"
        carId={car?.id ?? null}
        defaultCarName={carName ?? undefined}
      />

      {!hasCarbti && (
        <div
          className="mt-3 rounded-xl px-3 py-2.5 text-center"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--hairline)",
            fontSize: "12px",
            color: "var(--ink)",
          }}
        >
          취향 진단까지 채우면 완성 카드가 열려요
        </div>
      )}

      <p
        className="mt-4 px-1 text-center"
        style={{ fontSize: "10.5px", color: "var(--warm-gray)", lineHeight: 1.6 }}
      >
        예상 진단이에요 — 실제 조건은 금융사 심사에 따라 달라질 수 있어요
      </p>
    </div>
  );
}