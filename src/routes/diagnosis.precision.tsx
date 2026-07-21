import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Check, X } from "lucide-react";

import {
  PRECISION_QUESTIONS,
  PRECISION_TOTAL,
  patchPrecision,
  readPrecision,
  splitPrecision,
  type PrecisionData,
} from "@/lib/precision";
import { supabase } from "@/lib/supabase";
import { updateDiagnosisPrecision } from "@/lib/carbti-data";
import { useMyCarbti } from "@/hooks/use-my-carbti";

const searchSchema = z.object({
  p: z.number().int().min(1).max(PRECISION_TOTAL).catch(1),
});

export const Route = createFileRoute("/diagnosis/precision")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "정밀 매칭 · 7문항" },
      { name: "description", content: "예산·주행·명의 등 7문항으로 나에게 딱 맞는 차와 금융 방식을 매칭해요." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrecisionPage,
});

function formatWon(manwon: number) {
  return (manwon * 10000).toLocaleString("ko-KR");
}

function PrecisionPage() {
  const navigate = useNavigate();
  const { p } = Route.useSearch();
  const { code, dbId } = useMyCarbti();

  const current = p;
  const question = PRECISION_QUESTIONS[current - 1];

  const [data, setData] = useState<PrecisionData>(() => readPrecision());
  const [budgetDraft, setBudgetDraft] = useState<number>(
    () => readPrecision().monthly_budget ?? 70,
  );

  useEffect(() => {
    setBudgetDraft(readPrecision().monthly_budget ?? 70);
  }, [current]);

  const pct = useMemo(
    () => Math.min(100, Math.max(0, (current / PRECISION_TOTAL) * 100)),
    [current],
  );

  const goNext = () => {
    if (current < PRECISION_TOTAL) {
      void navigate({ to: "/diagnosis/precision", search: { p: current + 1 } });
      return;
    }
    // 완료 → 결과지로 이동 + 로그인 시 DB update (실패해도 진행)
    const finalData = readPrecision();
    const target = code ?? (typeof window !== "undefined" ? sessionStorage.getItem("carbti:diagnosis:code") : null);
    void (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id ?? null;
      if (uid && dbId) {
        try {
          const { situation, condition } = splitPrecision(finalData);
          await updateDiagnosisPrecision(dbId, { situation, condition });
        } catch (e) {
          console.warn("[precision update failed]", e);
        }
      }
      if (target) {
        void navigate({ to: "/result/$typeCode", params: { typeCode: target } });
      } else {
        void navigate({ to: "/diagnosis/onboarding" });
      }
    })();
  };

  const handleChoice = <V extends string>(field: keyof PrecisionData, value: V) => {
    const next = patchPrecision({ [field]: value } as Partial<PrecisionData>);
    setData(next);
    setTimeout(goNext, 180);
  };

  const handleBudgetNext = () => {
    const next = patchPrecision({ monthly_budget: budgetDraft });
    setData(next);
    goNext();
  };

  const handleClose = () => {
    const ok = window.confirm("정밀 매칭을 그만두시겠어요? 언제든 다시 시작할 수 있어요.");
    if (!ok) return;
    const target = code ?? (typeof window !== "undefined" ? sessionStorage.getItem("carbti:diagnosis:code") : null);
    if (target) {
      void navigate({ to: "/result/$typeCode", params: { typeCode: target } });
    } else {
      void navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between p-1 pb-4">
            <button
              type="button"
              aria-label="정밀 매칭 나가기"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center"
              style={{ color: "var(--ink)" }}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
              {current} / {PRECISION_TOTAL}
            </span>
          </div>
          <div className="pb-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--hairline)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--teal), var(--teal-deep))" }}
              />
            </div>
            <p className="mt-1 text-right" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
              정밀 매칭 {current}/{PRECISION_TOTAL}
            </p>
          </div>
        </div>

        <main className="flex-1 px-4">
          <section key={question.id} className="pb-6">
            <p
              className="mb-3"
              style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
            >
              {question.label.toUpperCase()}
            </p>
            <h1
              className="mb-2 leading-[1.3]"
              style={{ fontSize: "22px", fontWeight: 700, color: "var(--ink)" }}
            >
              {question.question}
            </h1>
            {question.subtitle && (
              <p className="mb-5" style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
                {question.subtitle}
              </p>
            )}

            {question.kind === "choice" ? (
              <div className="flex flex-col gap-2.5">
                {question.options.map((opt) => {
                  const selected = (data as Record<string, unknown>)[question.field] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChoice(question.field, opt.value)}
                      className="flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.98]"
                      style={{
                        borderColor: selected ? "var(--teal)" : "var(--hairline)",
                        borderWidth: selected ? 2 : 1,
                        backgroundColor: selected ? "rgba(30,127,116,0.06)" : "var(--surface)",
                        boxShadow: selected ? "none" : "var(--shadow-card)",
                      }}
                    >
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                          {opt.title}
                        </span>
                        {opt.desc && (
                          <span style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
                            {opt.desc}
                          </span>
                        )}
                      </span>
                      {selected && <Check size={18} color="var(--teal)" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-card)" }}
                >
                  <div style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
                    편한 월 납입
                  </div>
                  <div
                    className="mt-1 mb-3"
                    style={{
                      fontSize: "34px",
                      fontWeight: 800,
                      color: "var(--ink)",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatWon(budgetDraft)}
                    <span style={{ fontSize: "18px", color: "var(--warm-gray)", fontWeight: 500 }}>원 / 월</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={budgetDraft}
                    onChange={(e) => setBudgetDraft(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: "var(--teal)" }}
                    aria-label="월 예산"
                  />
                  <div className="mt-1 flex justify-between" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
                    <span>20만원</span>
                    <span>{budgetDraft >= 100 ? "100만원+" : `${budgetDraft}만원`}</span>
                    <span>100만원+</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBudgetNext}
                  className="w-full rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: "var(--midnight)", color: "var(--ivory)", fontSize: "14px" }}
                >
                  다음
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}