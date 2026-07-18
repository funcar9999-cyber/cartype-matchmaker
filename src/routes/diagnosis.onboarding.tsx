import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Target, ShieldCheck, Building2, Route as RouteIcon, ArrowRight } from "lucide-react";
import { ANSWERS_STORAGE_KEY, type Answer } from "@/lib/carbti-questions";

export const Route = createFileRoute("/diagnosis/onboarding")({
  head: () => ({
    meta: [
      { title: "CarBTI 진단 · 나의 자동차 DNA 찾기" },
      {
        name: "description",
        content: "15개 문항으로 나의 자동차 취향 유형을 1분 만에 진단하세요.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate({ to: "/" });
  };

  const handleStart = () => {
    void navigate({ to: "/diagnosis", search: { q: 1 } });
  };

  const startFromExample = (maps: "C" | "W") => {
    if (typeof window !== "undefined") {
      try {
        const answer: Answer = {
          questionId: 1,
          dimension: "purpose",
          maps,
        };
        sessionStorage.setItem(
          ANSWERS_STORAGE_KEY,
          JSON.stringify([answer]),
        );
      } catch {
        /* ignore */
      }
    }
    void navigate({ to: "/diagnosis", search: { q: 2 } });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col" style={{ backgroundColor: "var(--ivory)" }}>
        {/* 상단 바 */}
        <div className="flex items-center justify-between p-1 px-4 pb-5 pt-3">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={handleGoHome}
            className="flex h-8 w-8 items-center justify-center text-slate-500"
            style={{ fontSize: "18px" }}
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="text-slate-400"
            style={{ fontSize: "11px" }}
          >
            건너뛰기
          </button>
        </div>

        {/* 히어로 영역 */}
        <div className="px-4 pb-2 pt-5 text-center">
          <div
            className="mb-3"
            style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
          >
            CARBTI DIAGNOSIS
          </div>
          <h1
            className="mb-3"
            style={{ fontSize: "24px", lineHeight: 1.3, fontWeight: 800, color: "var(--ink)" }}
          >
            신용과 취향, 둘 다 반영한
            <br />
            진짜 개인화 진단
          </h1>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--warm-gray)" }}>
            15문항 · 한 문항에 5초면 충분해요
          </p>
        </div>

        {/* 3대 안심 블록 */}
        <main className="flex-1 px-4">
          <div className="mb-3 flex flex-col gap-2.5">
            {[
              { Icon: Clock, title: "약 2분 소요", desc: "15개 문항 · 선택만 하시면 자동으로 넘어가요" },
              { Icon: Target, title: "16가지 유형 중 하나", desc: "어울리는 대표 차량과 예산 선택지를 알려드려요" },
              { Icon: ShieldCheck, title: "진단은 회원가입 불필요", desc: "결과 저장·공유하실 때만 로그인 안내드려요" },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border p-3.5"
                style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--ivory)" }}
                >
                  <Icon size={18} color="var(--teal)" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                    {title}
                  </div>
                  <div className="mt-0.5" style={{ fontSize: "11px", color: "var(--warm-gray)", lineHeight: 1.4 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 문항 예시 미리보기 */}
          <div
            className="mb-5 rounded-2xl border p-4"
            style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}
          >
            <div
              className="mb-3"
              style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--gold)", fontWeight: 700 }}
            >
              눌러보세요 — 바로 시작돼요
            </div>
            <div className="mb-3" style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink)" }}>
              차를 주로 어떤 상황에서 탈 것 같나요?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startFromExample("C")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border p-2.5 transition active:scale-[0.98]"
                style={{ borderColor: "var(--hairline)", fontSize: "11px", color: "var(--ink)" }}
              >
                <Building2 size={14} color="var(--teal)" strokeWidth={1.75} /> 매일 출퇴근
              </button>
              <button
                type="button"
                onClick={() => startFromExample("W")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border p-2.5 transition active:scale-[0.98]"
                style={{ borderColor: "var(--hairline)", fontSize: "11px", color: "var(--ink)" }}
              >
                <RouteIcon size={14} color="var(--teal)" strokeWidth={1.75} /> 주말 여행
              </button>
            </div>
          </div>
        </main>

        {/* 하단 CTA 영역 */}
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={handleStart}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98]"
            style={{ fontSize: "14px", backgroundColor: "var(--midnight)", color: "var(--ivory)" }}
          >
            진단 시작하기 <ArrowRight size={15} color="var(--gold)" />
          </button>
        </div>
      </div>
    </div>
  );
}
