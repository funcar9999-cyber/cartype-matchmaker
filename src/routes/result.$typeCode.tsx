import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { CARBTI_TYPES, LEGAL_DISCLAIMER } from "@/lib/carbti-types";
import { ResultTopBar } from "@/components/result/ResultTopBar";
import { TypeHeroCard } from "@/components/result/TypeHeroCard";
import { RecommendedCars } from "@/components/result/RecommendedCars";
import { RecommendedTop3 } from "@/components/result/RecommendedTop3";
import { BudgetTiers } from "@/components/result/BudgetTiers";
import { ShareSection } from "@/components/result/ShareSection";
import { LockedDivider } from "@/components/result/LockedDivider";
import { AnswerRecap } from "@/components/result/AnswerRecap";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { hasPrecision, useYachaMatch } from "@/hooks/use-yacha-match";
import { track } from "@/lib/events";

export const Route = createFileRoute("/result/$typeCode")({
  head: ({ params }) => {
    const type = CARBTI_TYPES[params.typeCode];
    const title = type
      ? `${type.code} · ${type.name} · CarBTI 결과`
      : "CarBTI 결과";
    const description = type
      ? `${type.description} · 상위 ${type.rarityPercent}% 희소 유형`
      : "카BTI 진단 결과지";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  loader: ({ params }) => {
    const type = CARBTI_TYPES[params.typeCode];
    if (!type) throw notFound();
    return { type };
  },
  component: ResultPage,
  notFoundComponent: ResultNotFound,
});

function ResultNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-lg font-medium">유형을 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          진단을 먼저 완료해 주세요.
        </p>
      </div>
    </div>
  );
}

function ResultPage() {
  const { type } = Route.useLoaderData();
  const navigate = useNavigate();
  const shareRef = useRef<HTMLElement>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { status, source, code: myCode, precision, approval } = useMyCarbti();
  // 접근 판정: 훅이 준비될 때까지 대기 → 로그인/세션 진단 있음 → full, 없음 → shared
  const access: "loading" | "full" | "shared" =
    status === "loading"
      ? "loading"
      : source === "none"
        ? "shared"
        : "full";
  const viewingOthers = access === "full" && myCode && myCode !== type.code;

  const precisionReady = access === "full" && !viewingOthers && hasPrecision(precision);
  const match = useYachaMatch(type.code, precision, precisionReady, approval?.capacity_monthly ?? null);
  const engineFallback = precisionReady && !match.loading && (match.errored || match.data?.fallback === true);
  const top3 = match.data?.top3 ?? [];
  const showTop3 = precisionReady && !engineFallback && (match.loading || top3.length > 0);

  const OthersBanner = () =>
    myCode ? (
      <Link
        to="/result/$typeCode"
        params={{ typeCode: myCode }}
        className="mb-3 flex items-center justify-between rounded-2xl px-4 py-3 transition active:scale-[0.99]"
        style={{
          backgroundColor: "var(--navy)",
          color: "var(--ivory)",
          boxShadow: "var(--shadow-dark)",
        }}
      >
        <span style={{ fontSize: "12px" }}>
          지금 보는 유형은 {type.code}예요
        </span>
        <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700 }}>
          내 결과 보기 ({myCode}) →
        </span>
      </Link>
    ) : null;

  const scrollToShare = () => {
    shareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goMydata = () => {
    void navigate({ to: "/mydata/intro" });
  };

  const openQuote = () => {
    track("consult_click", { from: window.location.pathname });
    setQuoteOpen(true);
  };

  if (access === "loading") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: "var(--hairline)", borderTopColor: "var(--midnight)" }}
            aria-label="로딩 중"
          />
        </div>
      </div>
    );
  }

  if (access === "shared") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col" style={{ backgroundColor: "var(--ivory)" }}>
          <ResultTopBar onShareClick={scrollToShare} />
          <main className="flex-1 px-4 py-4">
            <TypeHeroCard type={type} />
            <RecommendedCars type={type} />
            <Link
              to="/diagnosis/onboarding"
              className="mt-4 block w-full rounded-xl py-3 text-center font-medium transition-transform active:scale-[0.98]"
              style={{ fontSize: "13px", backgroundColor: "var(--midnight)", color: "var(--ivory)" }}
            >
              나도 1분 진단하기
            </Link>
            <p
              className="mt-4 px-1"
              style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}
            >
              {LEGAL_DISCLAIMER}
            </p>
          </main>
        </div>
      </div>
    );
  }

  if (viewingOthers) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col" style={{ backgroundColor: "var(--ivory)" }}>
          <ResultTopBar onShareClick={scrollToShare} />
          <main className="flex-1 px-4 py-4">
            <OthersBanner />
            <TypeHeroCard type={type} />
            <RecommendedCars type={type} />
            <Link
              to="/diagnosis/onboarding"
              className="mt-4 block w-full rounded-xl py-3 text-center font-medium transition-transform active:scale-[0.98]"
              style={{ fontSize: "13px", backgroundColor: "var(--midnight)", color: "var(--ivory)" }}
            >
              나도 1분 진단하기
            </Link>
            <p
              className="mt-4 px-1"
              style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}
            >
              {LEGAL_DISCLAIMER}
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col" style={{ backgroundColor: "var(--ivory)" }}>
        <ResultTopBar onShareClick={scrollToShare} />
        <main className="flex-1 px-4 py-4">
          <TypeHeroCard type={type} />
          <AnswerRecap />
            <RecommendedCars type={type} personalize />
          {showTop3 && <RecommendedTop3 items={top3} loading={match.loading} />}
          {engineFallback && (
            <section
              className="mb-4 rounded-2xl p-4"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--hairline)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <p style={{ fontSize: "12px", color: "var(--ink)", lineHeight: 1.55 }}>
                예산에 맞는 추천을 찾지 못했어요 — 상담사와 설계해 보세요
              </p>
              <button
                type="button"
                onClick={openQuote}
                className="mt-3 w-full rounded-xl py-3 font-medium transition-transform active:scale-[0.98]"
                style={{ backgroundColor: "var(--midnight)", color: "var(--ivory)", fontSize: "13px" }}
              >
                상담사와 설계 요청하기
              </button>
            </section>
          )}
          <BudgetTiers
            type={type}
            onCtaClick={goMydata}
            matchTiers={precisionReady && !engineFallback ? match.data?.tiers ?? null : null}
            onBudgetDebounced={precisionReady ? match.refetchWithBudget : undefined}
          />

          {/* 3대 혜택 */}
          <section className="mb-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              지금 확인할 수 있어요
            </div>
            <ul>
              {type.benefits.map((b: string) => (
                <li key={b} className="flex items-start gap-2.5 py-1.5">
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: "14px", color: "#10B981" }}
                  >
                    ✓
                  </span>
                  <span className="text-slate-900" style={{ fontSize: "12px" }}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <ShareSection ref={shareRef} type={type} />
          <LockedDivider />

          {/* 2단 티저 (마이데이터 미연동 상태) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div
              className="mb-3 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              마이데이터 연동 시 공개
            </div>
            <div
              className="space-y-2 select-none"
            >
              <div className="flex justify-between" style={{ fontSize: "12px" }}>
                <span>승인 확률</span>
                <span
                  className="font-medium"
                  style={{ filter: "blur(6px)" }}
                  aria-hidden="true"
                >
                  --%
                </span>
              </div>
              <div className="flex justify-between" style={{ fontSize: "12px" }}>
                <span>예상 월 납입금</span>
                <span
                  className="font-medium"
                  style={{ filter: "blur(6px)" }}
                  aria-hidden="true"
                >
                  --만원
                </span>
              </div>
              <div className="flex justify-between" style={{ fontSize: "12px" }}>
                <span>유리한 금융사</span>
                <span
                  className="font-medium"
                  style={{ filter: "blur(6px)" }}
                  aria-hidden="true"
                >
                  -----
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={goMydata}
              className="mt-4 w-full rounded-xl py-3 font-medium transition-transform active:scale-[0.98]"
              style={{ fontSize: "13px", backgroundColor: "var(--midnight)", color: "var(--ivory)" }}
            >
              마이데이터 연결하고 전체 결과 보기
            </button>
            <p
              className="mt-2 text-center text-slate-500"
              style={{ fontSize: "10px" }}
            >
              1분 안에 안전하게 연동 · 언제든 해지 가능
            </p>
          </section>

          <button
            type="button"
            onClick={openQuote}
            className="mt-3 w-full rounded-xl border border-border bg-white py-3 font-medium text-slate-900"
            style={{ fontSize: "13px" }}
          >
            상담사에게 실제 견적 받기
          </button>

          {/* 법적 고지 */}
          <p
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {LEGAL_DISCLAIMER}
          </p>
        </main>
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{ defaultCarName: type.topCars[0], source: "result" }}
        />
      </div>
    </div>
  );
}