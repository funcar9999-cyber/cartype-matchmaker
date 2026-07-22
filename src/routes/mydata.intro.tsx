import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Shield, Unlock, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/mydata/intro")({
  head: () => ({
    meta: [
      { title: "내 예산 정확하게 알기 · 야차" },
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

  const cardStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--hairline)",
    boxShadow: "var(--shadow-card)",
  } as const;
  const sectionLabel = {
    fontSize: "10.5px",
    letterSpacing: "0.25em",
    color: "var(--warm-gray)",
    fontWeight: 700,
  } as const;
  const trustItems = [
    { Icon: Shield, text: "조회 이력이 남지 않아요 — 신용점수에 영향 없음" },
    { Icon: Unlock, text: "언제든 연결 해지 가능 — 내 정보는 내가 통제" },
    { Icon: BadgeCheck, text: "금융상품 대리중개업 등록 정식 사업자" },
  ];

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
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
            내 예산 정확하게 알기
          </div>
          <div className="h-7 w-7" />
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 히어로 */}
          <section className="mb-4 rounded-2xl p-6 text-center" style={cardStyle}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--midnight)" }}>
              <Shield size={22} color="var(--gold)" strokeWidth={1.75} />
            </div>
            <h1
              className="mb-2"
              style={{ fontSize: "20px", lineHeight: 1.4, fontWeight: 800, color: "var(--ink)" }}
            >
              1분이면 내 예산이 정확해져요
            </h1>
            <p style={{ fontSize: "12.5px", lineHeight: 1.6, color: "var(--warm-gray)" }}>
              연결하는 순간, 안정형·표준형·드림형이
              <br />내 소득·신용 기준으로 열려요
            </p>
          </section>

          {/* 3단계 */}
          <section className="mb-4 rounded-2xl p-5" style={cardStyle}>
            <div className="mb-3" style={sectionLabel}>3단계로 완료돼요</div>
            <ol className="space-y-2">
              {[
                { n: "01", title: "카카오 본인확인", time: "10초" },
                { n: "02", title: "NICE 마이데이터 동의", time: "30초" },
                { n: "03", title: "예산 매칭 완료", time: "20초" },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex items-center justify-between rounded-xl px-3 py-3"
                  style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--hairline)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontSize: "10.5px",
                        letterSpacing: "0.15em",
                        color: "var(--gold)",
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.n}
                    </span>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--ink)" }}>
                      {s.title}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--warm-gray)" }}>{s.time}</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 pl-1" style={{ fontSize: "10px", lineHeight: 1.5, color: "var(--warm-gray)" }}>
              * 마이데이터: 내 금융정보를 안전하게 불러오는 금융위원회 인증 방식이에요
            </p>
          </section>

          {/* 신뢰 블록 */}
          <section className="mb-4 rounded-2xl p-5" style={cardStyle}>
            <ul className="space-y-2.5">
              {trustItems.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={18} color="var(--teal)" strokeWidth={1.75} className="mt-0.5 flex-shrink-0" />
                  <span style={{ fontSize: "12.5px", color: "var(--ink)", lineHeight: 1.5 }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 동의 */}
          <section
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)" }}
          >
            <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={requiredAgree}
                onChange={(e) => setRequiredAgree(e.target.checked)}
                className="mt-0.5"
              />
              <span style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--ink)" }}>
                <span style={{ fontWeight: 700, color: "var(--gold)" }}>[필수]</span>{" "}
                마이데이터 서비스{" "}
                <Link to="/terms" className="underline">이용 동의</Link>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={optionalAgree}
                onChange={(e) => setOptionalAgree(e.target.checked)}
                className="mt-0.5"
              />
              <span style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--ink)" }}>
                <span style={{ color: "var(--warm-gray)" }}>[선택]</span> 혜택 알림 수신 동의
              </span>
            </label>
          </section>

          <button
            type="button"
            onClick={handleConnect}
            disabled={!canProceed}
            className="w-full rounded-xl py-3.5 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: "var(--midnight)",
              color: "var(--ivory)",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "var(--shadow-dark)",
            }}
          >
            안전하게 연결하기
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-3 w-full py-2 text-center underline"
            style={{ fontSize: "12px", color: "var(--warm-gray)" }}
          >
            다음에 할게요
          </button>
        </main>
      </div>
    </div>
  );
}