import { createFileRoute, notFound } from "@tanstack/react-router";
import { useRef } from "react";

import { CARBTI_TYPES, LEGAL_DISCLAIMER } from "@/lib/carbti-types";
import { ResultTopBar } from "@/components/result/ResultTopBar";
import { TypeHeroCard } from "@/components/result/TypeHeroCard";
import { RecommendedCars } from "@/components/result/RecommendedCars";
import { ShareSection } from "@/components/result/ShareSection";
import { LockedDivider } from "@/components/result/LockedDivider";

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
  const shareRef = useRef<HTMLElement>(null);

  const scrollToShare = () => {
    shareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <ResultTopBar onShareClick={scrollToShare} />
        <main className="flex-1 px-4 py-4">
          <TypeHeroCard type={type} />
          <RecommendedCars type={type} />

          {/* 3대 혜택 */}
          <section className="mb-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              지금 확인할 수 있어요
            </div>
            <ul>
              {type.benefits.map((b) => (
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

          <ShareSection ref={shareRef} />
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
              style={{ filter: "blur(6px)", pointerEvents: "none" }}
              aria-hidden
            >
              <div className="flex justify-between" style={{ fontSize: "12px" }}>
                <span>승인 확률</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: "12px" }}>
                <span>예상 월 납입금</span>
                <span className="font-medium">62만원</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: "12px" }}>
                <span>유리한 금융사</span>
                <span className="font-medium">○○캐피탈</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => console.log("navigate:/mydata/connect")}
              className="mt-4 w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
              style={{ fontSize: "13px" }}
            >
              🔒 마이데이터 연결하고 전체 결과 보기
            </button>
            <p
              className="mt-2 text-center text-slate-500"
              style={{ fontSize: "10px" }}
            >
              1분 안에 안전하게 연동 · 언제든 해지 가능
            </p>
          </section>

          {/* 법적 고지 */}
          <p
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {LEGAL_DISCLAIMER}
          </p>
        </main>
      </div>
    </div>
  );
}