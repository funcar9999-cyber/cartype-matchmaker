import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Plus, Minus, ArrowUpRight } from "lucide-react";

import { CARBTI_TYPES } from "@/lib/carbti-types";
import { CONSULT_FAQ } from "@/lib/car-db";
import { BottomTabBar } from "@/components/home/BottomTabBar";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";
import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";
import { DIAGNOSIS_DB_ID_KEY, supabase } from "@/lib/supabase";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { track } from "@/lib/events";

export const Route = createFileRoute("/consult")({
  head: () => ({
    meta: [
      { title: "상담 · 야차" },
      { name: "description", content: "카카오톡으로 강요 없는 무료 상담을 받아보세요." },
    ],
  }),
  component: ConsultPage,
});

function ConsultPage() {
  const [code, setCode] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { dbId } = useMyCarbti();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored && CARBTI_TYPES[stored]) setCode(stored);
  }, []);

  const type = code ? CARBTI_TYPES[code] : null;

  const openKakaoChannel = () => {
    track("consult_click", { from: "/consult" });
    const diagnosisId =
      dbId ??
      (typeof window !== "undefined"
        ? sessionStorage.getItem(DIAGNOSIS_DB_ID_KEY)
        : null);
    void (async () => {
      try {
        await supabase.from("leads").insert({
          source: "consult",
          diagnosis_id: diagnosisId,
        });
      } catch {
        // 채널 열기는 저장 성공 여부와 무관하게 유지
      }
    })();
    window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <header
          className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--hairline)", backgroundColor: "rgba(245,244,240,0.9)" }}
        >
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)" }}>상담</div>
          <div style={{ fontSize: "10.5px", color: "var(--warm-gray)", letterSpacing: "0.05em" }}>
            강요 없는 무료 상담
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 메인 카드 — 미드나이트 */}
          <button
            type="button"
            onClick={openKakaoChannel}
            className="block w-full rounded-2xl p-6 text-left transition active:scale-[0.99]"
            style={{
              background: "var(--gradient-hero)",
              color: "var(--ivory)",
              boxShadow: "var(--shadow-dark)",
            }}
          >
            <MessageCircle size={26} color="var(--gold)" strokeWidth={1.75} />
            <div className="mt-3" style={{ fontSize: "17px", fontWeight: 800 }}>
              카카오톡으로 바로 상담
            </div>
            <div className="mt-1.5" style={{ fontSize: "11.5px", color: "var(--gold-soft)" }}>
              평일 09:00–19:00 · 영업시간 내 순차 답변
            </div>
            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                border: "1px solid var(--gold)",
                color: "var(--gold)",
              }}
            >
              카카오톡 채널 열기
              <ArrowUpRight size={12} strokeWidth={2} />
            </div>
          </button>

          {type && (
            <section
              className="mt-4 rounded-2xl p-5"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="mb-2"
                style={{
                  fontSize: "10.5px",
                  letterSpacing: "0.25em",
                  color: "var(--warm-gray)",
                  fontWeight: 700,
                }}
              >
                MY CARBTI
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  style={{
                    fontSize: "20px",
                    letterSpacing: "0.2em",
                    color: "var(--gold)",
                    fontWeight: 800,
                  }}
                >
                  {type.code}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                  {type.name}
                </span>
              </div>
              <div className="mt-3 space-y-1.5" style={{ fontSize: "12px" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--warm-gray)" }}>대표 차량</span>
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>{type.topCars[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--warm-gray)" }}>최적 결제방식</span>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>{type.bestPayment.method}</span>
                </div>
              </div>
              <p
                className="mt-3 rounded-lg px-3 py-2"
                style={{
                  fontSize: "11px",
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  backgroundColor: "var(--ivory)",
                  border: "1px solid var(--hairline)",
                }}
              >
                채팅창에 유형 코드 <b>{type.code}</b>를 알려주시면 상담이 빨라져요.
              </p>
            </section>
          )}

          {/* FAQ */}
          <section className="mt-4">
            <h2
              className="mb-2 pl-1"
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.25em",
                color: "var(--warm-gray)",
                fontWeight: 700,
              }}
            >
              자주 묻는 질문
            </h2>
            <div
              className="overflow-hidden rounded-2xl"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)" }}
            >
              {CONSULT_FAQ.map((f, i) => {
                const open = openIdx === i;
                return (
                  <div
                    key={f.q}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                    >
                      <span style={{ fontSize: "12.5px", color: "var(--ink)", fontWeight: 500 }}>
                        {f.q}
                      </span>
                      {open ? (
                        <Minus size={14} color="var(--gold)" strokeWidth={2} />
                      ) : (
                        <Plus size={14} color="var(--warm-gray)" strokeWidth={2} />
                      )}
                    </button>
                    {open && (
                      <div
                        className="px-4 pb-3"
                        style={{ fontSize: "11.5px", lineHeight: 1.6, color: "var(--warm-gray)" }}
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
            className="mt-6 px-1 text-center"
            style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}
          >
            금융상품판매대리·중개업 등록 사업자
          </p>
          <div className="mt-2 text-center">
            <Link
              to="/about"
              className="underline underline-offset-2"
              style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 700 }}
            >
              회사 소개 →
            </Link>
          </div>
        </main>

        <BottomTabBar />
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{ source: "consult" }}
        />
      </div>
    </div>
  );
}
