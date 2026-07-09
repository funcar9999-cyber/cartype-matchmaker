import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/mydata/intro")({
  head: () => ({
    meta: [
      { title: "내 예산 정확하게 알기 · CarBTI" },
      {
        name: "description",
        content:
          "마이데이터를 연결하면 내 소득·신용 기준으로 안정형·표준형·드림형 예산이 열려요.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MydataIntroPage,
});

function MydataIntroPage() {
  const navigate = useNavigate();
  const [requiredAgree, setRequiredAgree] = useState(false);
  const [optionalAgree, setOptionalAgree] = useState(false);

  const canProceed = requiredAgree;

  const handleConnect = () => {
    if (!canProceed) return;
    void navigate({ to: "/mydata/connecting" });
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
            내 예산 정확하게 알기
          </div>
          <div className="h-7 w-7" />
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 히어로 */}
          <section className="mb-4 rounded-2xl bg-slate-50 p-5 text-center">
            <div className="mb-2" style={{ fontSize: "36px", lineHeight: 1 }}>
              🔐
            </div>
            <h1
              className="mb-2 font-medium text-slate-900"
              style={{ fontSize: "18px", lineHeight: 1.4 }}
            >
              1분이면 내 예산이 정확해져요
            </h1>
            <p
              className="text-slate-500"
              style={{ fontSize: "12px", lineHeight: 1.6 }}
            >
              연결하는 순간, 안정형·표준형·드림형이
              <br />내 소득·신용 기준으로 열려요
            </p>
          </section>

          {/* 3단계 안내 */}
          <section className="mb-4 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-3 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              3단계로 완료돼요
            </div>
            <ol className="space-y-2.5">
              {[
                { n: "①", title: "카카오 본인확인", time: "10초" },
                { n: "②", title: "NICE 마이데이터 동의", time: "30초" },
                { n: "③", title: "예산 매칭 완료", time: "20초" },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-brand-primary"
                      style={{ fontSize: "14px" }}
                    >
                      {s.n}
                    </span>
                    <span
                      className="font-medium text-slate-900"
                      style={{ fontSize: "12px" }}
                    >
                      {s.title}
                    </span>
                  </div>
                  <span className="text-slate-400" style={{ fontSize: "11px" }}>
                    {s.time}
                  </span>
                </li>
              ))}
            </ol>
            <p
              className="mt-2 pl-1 text-slate-500"
              style={{ fontSize: "10px", lineHeight: 1.5 }}
            >
              * 마이데이터: 내 금융정보를 안전하게 불러오는 금융위원회 인증 방식이에요
            </p>
          </section>

          {/* 신뢰 블록 */}
          <section className="mb-4 rounded-2xl bg-slate-50 p-4">
            <ul>
              {[
                "조회 이력이 남지 않아요 — 신용점수에 영향 없음",
                "언제든 연결 해지 가능 — 내 정보는 내가 통제",
                "금융상품 대리중개업 등록 정식 사업자",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2.5 py-1.5">
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: "14px", color: "#10B981" }}
                  >
                    ✓
                  </span>
                  <span
                    className="text-slate-900"
                    style={{ fontSize: "12px", lineHeight: 1.5 }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 동의 체크박스 */}
          <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={requiredAgree}
                onChange={(e) => setRequiredAgree(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-slate-900" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                <span className="font-medium text-brand-primary">[필수]</span>{" "}
                마이데이터 서비스{" "}
                <Link to="/terms" className="underline">
                  이용 동의
                </Link>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={optionalAgree}
                onChange={(e) => setOptionalAgree(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-slate-900" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                <span className="text-slate-400">[선택]</span> 혜택 알림 수신 동의
              </span>
            </label>
          </section>

          {/* CTA */}
          <button
            type="button"
            onClick={handleConnect}
            disabled={!canProceed}
            className="w-full rounded-xl bg-brand-primary py-3.5 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ fontSize: "14px" }}
          >
            안전하게 연결하기
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-3 w-full py-2 text-center text-slate-500 underline"
            style={{ fontSize: "12px" }}
          >
            다음에 할게요
          </button>
        </main>
      </div>
    </div>
  );
}