import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CARBTI_TYPES, LEGAL_DISCLAIMER } from "@/lib/carbti-types";
import {
  KAKAO_CHANNEL_URL,
  MYDATA_DEMO_DISCLAIMER,
  TIER_CARS,
  TIER_LABELS,
  type TierCar,
} from "@/lib/mydata-tiers";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (!stored || !CARBTI_TYPES[stored]) {
      void navigate({ to: "/diagnosis/onboarding" });
      return;
    }
    setCode(stored);
  }, [navigate]);

  if (!code) return null;
  const type = CARBTI_TYPES[code];
  const tiers = TIER_CARS[code];
  if (!type || !tiers) return null;

  const goBackToResult = () => {
    void navigate({ to: "/result/$typeCode", params: { typeCode: code } });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        {/* 헤더 */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
            className="flex h-7 w-7 items-center justify-center text-foreground"
            style={{ fontSize: "16px" }}
          >
            ←
          </button>
          <div className="font-medium text-slate-900" style={{ fontSize: "13px" }}>
            예산 매칭 결과
          </div>
          <div className="h-7 w-7" />
        </header>

        {/* 데모 배지 */}
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-amber-800"
          style={{ fontSize: "11px" }}
        >
          데모 시뮬레이션 · 예시 데이터입니다
        </div>

        <main className="flex-1 px-4 py-4">
          {/* 프로필 카드 */}
          <section className="mb-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-1 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              내 마이데이터 프로필 (예시)
            </div>
            <div
              className="mb-2 font-medium text-slate-900"
              style={{ fontSize: "14px" }}
            >
              김카비 님 <span className="text-slate-400">(예시)</span>
            </div>
            <ul className="space-y-1" style={{ fontSize: "12px" }}>
              <li className="flex justify-between">
                <span className="text-slate-500">연소득</span>
                <span className="text-slate-900">4,200만원</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">신용</span>
                <span className="text-slate-900">우수 (NICE 800점대)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">월 납입 여력</span>
                <span className="text-slate-900">약 55만원</span>
              </li>
            </ul>
          </section>

          {/* 티어 3카드 */}
          <section className="mb-3">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              내 예산으로 가능한 선택지
            </div>
            <div className="grid grid-cols-3 gap-2">
              <TierCard
                label={TIER_LABELS.stable.name}
                tagline={TIER_LABELS.stable.tagline}
                data={tiers.stable}
                delay={0}
              />
              <TierCard
                label={TIER_LABELS.standard.name}
                tagline={TIER_LABELS.standard.tagline}
                data={tiers.standard}
                delay={120}
                recommended
              />
              <TierCard
                label={TIER_LABELS.dream.name}
                tagline={TIER_LABELS.dream.tagline}
                data={tiers.dream}
                delay={240}
              />
            </div>
          </section>

          {/* 상세 3줄 */}
          <section className="mb-4 rounded-2xl bg-slate-50 p-4">
            <ul className="space-y-2" style={{ fontSize: "12px" }}>
              <li className="flex justify-between">
                <span className="text-slate-500">예상 승인 가능성</span>
                <span className="font-medium text-slate-900">높음 (예시)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">예상 월 납입</span>
                <span className="font-medium text-slate-900">
                  표준형 기준 (예시)
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500">어울리는 금융 방식</span>
                <span className="font-medium text-slate-900">
                  {type.bestPayment.method}
                </span>
              </li>
            </ul>
          </section>

          {/* 최종 CTA */}
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-medium text-white"
            style={{
              backgroundColor: "#0F7FFF",
              fontSize: "16px",
            }}
          >
            이 결과로 무료 상담 받기 💬
          </a>
          <p
            className="mt-2 text-center text-slate-500"
            style={{ fontSize: "11px", lineHeight: 1.5 }}
          >
            상담사가 실제 견적과 승인 가능성을 확인해드려요
            <br />강요 없는 무료 상담
          </p>

          <button
            type="button"
            onClick={goBackToResult}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-3 font-medium text-slate-700"
            style={{ fontSize: "13px" }}
          >
            결과지로 돌아가기
          </button>

          <p
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {LEGAL_DISCLAIMER}
            <br />
            {MYDATA_DEMO_DISCLAIMER}
          </p>
        </main>
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
      className={
        "relative rounded-xl border bg-white p-3 " +
        (recommended ? "border-brand-primary" : "border-slate-200")
      }
      style={{
        animation: `carbti-unlock 700ms ease-out ${delay}ms both`,
      }}
    >
      {recommended && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-2 py-0.5 font-medium text-white"
          style={{ fontSize: "9px" }}
        >
          추천
        </span>
      )}
      <div
        className="font-medium text-slate-900"
        style={{ fontSize: "12px" }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 text-slate-500"
        style={{ fontSize: "10px", lineHeight: 1.4 }}
      >
        {tagline}
      </div>
      <div
        className="mt-3 font-medium text-slate-900"
        style={{ fontSize: "12px", lineHeight: 1.4 }}
      >
        {data.car}
      </div>
      <div
        className="mt-1 text-slate-500"
        style={{ fontSize: "10px" }}
      >
        {data.method}
      </div>
      <div
        className="mt-2 font-medium text-brand-primary"
        style={{ fontSize: "11px" }}
      >
        {data.monthly}
      </div>
      <div
        className="mt-1 text-slate-400"
        style={{ fontSize: "9px" }}
      >
        (예시)
      </div>
    </div>
  );
}