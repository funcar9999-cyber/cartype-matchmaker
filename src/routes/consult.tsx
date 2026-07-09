import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CARBTI_TYPES } from "@/lib/carbti-types";
import { CONSULT_FAQ } from "@/lib/car-db";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";

export const Route = createFileRoute("/consult")({
  head: () => ({
    meta: [
      { title: "상담 · CarBTI" },
      { name: "description", content: "카카오톡으로 강요 없는 무료 상담을 받아보세요." },
    ],
  }),
  component: ConsultPage,
});

function ConsultPage() {
  const [code, setCode] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored && CARBTI_TYPES[stored]) setCode(stored);
  }, []);

  const type = code ? CARBTI_TYPES[code] : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
          <div className="font-medium" style={{ fontSize: "14px" }}>
            상담
          </div>
          <div className="text-slate-500" style={{ fontSize: "10px" }}>
            강요 없는 무료 상담
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 메인 카드 */}
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="block w-full rounded-2xl p-5 text-left text-white shadow-[0_12px_30px_-12px_rgba(15,127,255,0.55)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <span style={{ fontSize: "28px" }}>💬</span>
            <div className="mt-2 font-medium" style={{ fontSize: "16px" }}>
              카카오톡으로 바로 상담
            </div>
            <div className="mt-1" style={{ fontSize: "11px", opacity: 0.9 }}>
              평일 09:00–19:00 · 영업시간 내 순차 답변
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1.5" style={{ fontSize: "11px" }}>
              카카오톡 채널 열기 ↗
            </div>
          </button>

          {/* 유형 요약 */}
          {type && (
            <section className="mt-3 rounded-2xl bg-slate-50 p-4">
              <div
                className="mb-2 uppercase text-slate-500"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                내 카BTI 요약
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-brand-primary" style={{ fontSize: "16px", letterSpacing: "0.08em" }}>
                  {type.code}
                </span>
                <span className="font-medium text-slate-900" style={{ fontSize: "13px" }}>
                  {type.name}
                </span>
              </div>
              <div className="mt-2 space-y-1" style={{ fontSize: "12px" }}>
                <div className="flex justify-between">
                  <span className="text-slate-500">대표 차량</span>
                  <span className="text-slate-900">{type.topCars[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">최적 결제방식</span>
                  <span className="text-slate-900">{type.bestPayment.method}</span>
                </div>
              </div>
              <p
                className="mt-3 rounded-lg bg-white px-3 py-2 text-slate-600"
                style={{ fontSize: "11px", lineHeight: 1.5 }}
              >
                채팅창에 유형 코드 <b>{type.code}</b>를 알려주시면 상담이 빨라져요.
              </p>
            </section>
          )}

          {/* FAQ */}
          <section className="mt-3">
            <h2 className="mb-2 pl-1 font-medium" style={{ fontSize: "13px" }}>
              자주 묻는 질문
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              {CONSULT_FAQ.map((f, i) => {
                const open = openIdx === i;
                return (
                  <div
                    key={f.q}
                    className={i < CONSULT_FAQ.length - 1 ? "border-b border-slate-100" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                    >
                      <span className="text-slate-900" style={{ fontSize: "12px" }}>
                        {f.q}
                      </span>
                      <span className="text-slate-400" style={{ fontSize: "12px" }}>
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    {open && (
                      <div
                        className="px-3 pb-3 text-slate-600"
                        style={{ fontSize: "11px", lineHeight: 1.6 }}
                      >
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <p
            className="mt-6 px-1 text-center text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            금융상품판매대리·중개업 등록 사업자
          </p>
          <div className="mt-2 text-center">
            <Link
              to="/about"
              className="text-brand-primary underline underline-offset-2"
              style={{ fontSize: "11px" }}
            >
              회사 소개 →
            </Link>
          </div>
        </main>

        <BottomTabBar />
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{}}
        />
      </div>
    </div>
  );
}
