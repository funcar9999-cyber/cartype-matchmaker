import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { CARBTI_TYPES, LEGAL_DISCLAIMER } from "@/lib/carbti-types";
import {
  MYDATA_DEMO_DISCLAIMER,
  TIER_CARS,
  TIER_LABELS,
  type TierCar,
} from "@/lib/mydata-tiers";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";

export const Route = createFileRoute("/mydata/result")({
  head: () => ({
    meta: [
      { title: "예산 매칭 결과 (예시) · CarBTI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MydataResultPage,
});

function MydataResultPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);
  const [selfBudget, setSelfBudget] = useState<number | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (!stored || !CARBTI_TYPES[stored]) {
      void navigate({ to: "/diagnosis/onboarding" });
      return;
    }
    setCode(stored);
    const b = sessionStorage.getItem("carbti:budget");
    if (b) {
      const v = Number(b);
      if (Number.isFinite(v)) setSelfBudget(v);
    }
  }, [navigate]);

  if (!code) return null;
  const type = CARBTI_TYPES[code];
  const tiers = TIER_CARS[code];
  if (!type || !tiers) return null;

  const goBackToResult = () => {
    void navigate({ to: "/result/$typeCode", params: { typeCode: code } });
  };

  const sectionLabel = {
    fontSize: "10.5px",
    letterSpacing: "0.25em",
    color: "var(--warm-gray)",
    fontWeight: 700,
  } as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--hairline)", backgroundColor: "rgba(245,244,240,0.9)" }}
        >
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
            className="flex h-7 w-7 items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>예산 매칭 결과</div>
          <div className="h-7 w-7" />
        </header>

        <div
          className="border-b px-4 py-2 text-center"
          style={{
            borderColor: "var(--hairline)",
            backgroundColor: "var(--surface)",
            fontSize: "10.5px",
            letterSpacing: "0.2em",
            color: "var(--gold)",
            fontWeight: 700,
          }}
        >
          DEMO · 예시 데이터
        </div>

        <main className="flex-1 px-4 py-4">
          {/* 프로필 카드 (다크 네이비) */}
          <section
            className="mb-4 rounded-2xl p-5"
            style={{
              backgroundColor: "var(--navy)",
              color: "var(--ivory)",
              boxShadow: "var(--shadow-dark)",
            }}
          >
            <div
              className="mb-2"
              style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--gold)", fontWeight: 700 }}
            >
              MY DATA PROFILE
            </div>
            <div className="mb-3" style={{ fontSize: "16px", fontWeight: 800 }}>
              김카비 님{" "}
              <span style={{ color: "var(--gold-soft)", fontSize: "11px", fontWeight: 400 }}>(예시)</span>
            </div>
            <ul className="space-y-1.5" style={{ fontSize: "12px" }}>
              <ProfileRow label="연소득" value="4,200만원" />
              <ProfileRow label="신용" value="우수 (NICE 800점대)" />
              <ProfileRow label="월 납입 여력" value="약 55만원" />
              {selfBudget != null && (
                <ProfileRow label="직접 입력 예산" value={`월 ${selfBudget}만원`} />
              )}
            </ul>
          </section>

          {/* 티어 3카드 */}
          <section className="mb-4">
            <div className="mb-2 pl-1" style={sectionLabel}>내 예산으로 가능한 선택지</div>
            <div className="grid grid-cols-3 gap-2">
              <TierCard label={TIER_LABELS.stable.name} tagline={TIER_LABELS.stable.tagline} data={tiers.stable} delay={0} />
              <TierCard label={TIER_LABELS.standard.name} tagline={TIER_LABELS.standard.tagline} data={tiers.standard} delay={120} recommended />
              <TierCard label={TIER_LABELS.dream.name} tagline={TIER_LABELS.dream.tagline} data={tiers.dream} delay={240} />
            </div>
          </section>

          {/* 상세 3줄 */}
          <section
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)" }}
          >
            <ul className="space-y-2" style={{ fontSize: "12px" }}>
              <ProfileRow label="예상 승인 가능성" value="높음 (예시)" light />
              <ProfileRow label="예상 월 납입" value="표준형 기준 (예시)" light />
              <ProfileRow label="어울리는 금융 방식" value={type.bestPayment.method} light gold />
            </ul>
          </section>

          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 transition active:scale-[0.98]"
            style={{
              backgroundColor: "var(--midnight)",
              color: "var(--ivory)",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "var(--shadow-dark)",
            }}
          >
            이 결과로 무료 상담 받기
            <MessageCircle size={16} color="var(--gold)" strokeWidth={1.75} />
          </button>
          <p
            className="mt-2 text-center"
            style={{ fontSize: "11px", lineHeight: 1.5, color: "var(--warm-gray)" }}
          >
            상담사가 실제 견적과 승인 가능성을 확인해드려요
            <br />강요 없는 무료 상담
          </p>

          <button
            type="button"
            onClick={goBackToResult}
            className="mt-3 w-full rounded-xl py-3 transition active:scale-[0.98]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--hairline)",
              color: "var(--ink)",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            결과지로 돌아가기
          </button>

          <p
            className="mt-4 px-1"
            style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}
          >
            {LEGAL_DISCLAIMER}
            <br />
            {MYDATA_DEMO_DISCLAIMER}
          </p>
        </main>
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{ defaultCarName: type.topCars[0], source: "mydata_result" }}
        />
      </div>

      <style>{`
        @keyframes carbti-unlock {
          0%   { filter: blur(6px); opacity: 0.4; transform: scale(0.98); }
          100% { filter: blur(0);    opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  light,
  gold,
}: {
  label: string;
  value: string;
  light?: boolean;
  gold?: boolean;
}) {
  return (
    <li className="flex justify-between">
      <span
        style={{
          color: light ? "var(--warm-gray)" : "var(--gold-soft)",
          opacity: light ? 1 : 0.85,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: gold ? "var(--gold)" : light ? "var(--ink)" : "var(--ivory)",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </li>
  );
}

function TierCard({
  label,
  tagline,
  data,
  delay,
  recommended,
}: {
  label: string;
  tagline: string;
  data: TierCar;
  delay: number;
  recommended?: boolean;
}) {
  return (
    <div
      className="relative rounded-xl p-3"
      style={{
        backgroundColor: recommended ? "var(--navy)" : "var(--surface)",
        color: recommended ? "var(--ivory)" : "var(--ink)",
        border: `1px solid ${recommended ? "var(--navy)" : "var(--hairline)"}`,
        animation: `carbti-unlock 700ms ease-out ${delay}ms both`,
        boxShadow: recommended ? "var(--shadow-dark)" : "var(--shadow-card)",
      }}
    >
      {recommended && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5"
          style={{
            fontSize: "9px",
            fontWeight: 800,
            backgroundColor: "var(--gold)",
            color: "var(--midnight)",
            letterSpacing: "0.1em",
          }}
        >
          추천
        </span>
      )}
      <div style={{ fontSize: "12px", fontWeight: 800 }}>{label}</div>
      <div
        className="mt-0.5"
        style={{
          fontSize: "10px",
          lineHeight: 1.4,
          color: recommended ? "var(--gold-soft)" : "var(--warm-gray)",
        }}
      >
        {tagline}
      </div>
      <div className="mt-3" style={{ fontSize: "12px", lineHeight: 1.4, fontWeight: 700 }}>
        {data.car}
      </div>
      <div
        className="mt-1"
        style={{
          fontSize: "10px",
          color: recommended ? "var(--gold-soft)" : "var(--warm-gray)",
        }}
      >
        {data.method}
      </div>
      <div
        className="mt-2"
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "var(--gold)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {data.monthly}
      </div>
      <div
        className="mt-1"
        style={{ fontSize: "9px", color: recommended ? "var(--gold-soft)" : "var(--warm-gray)", opacity: 0.7 }}
      >
        (예시)
      </div>
    </div>
  );
}