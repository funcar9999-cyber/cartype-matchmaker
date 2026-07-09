import { createFileRoute, useNavigate } from "@tanstack/react-router";

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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
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
          <div className="mb-3.5" style={{ fontSize: "48px" }}>
            🚗✨
          </div>
          <h1
            className="mb-2.5 font-medium"
            style={{ fontSize: "22px", lineHeight: 1.35 }}
          >
            신용과 취향, 둘 다 반영한
            <br />
            진짜 개인화 진단
          </h1>
          <p
            className="text-slate-500"
            style={{ fontSize: "13px", lineHeight: 1.5 }}
          >
            15개 간단한 질문으로
            <br />
            나의 자동차 DNA를 발견하세요
          </p>
        </div>

        {/* 3대 안심 블록 */}
        <main className="flex-1 px-4">
          <div className="mb-3 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white" style={{ fontSize: "22px" }}>
                ⏱️
              </div>
              <div className="flex-1">
                <div className="mb-0.5 font-medium text-slate-900" style={{ fontSize: "13px" }}>
                  약 2분 소요
                </div>
                <div className="text-slate-500" style={{ fontSize: "11px", lineHeight: 1.4 }}>
                  15개 문항 · 선택만 하시면 자동으로 넘어가요
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white" style={{ fontSize: "22px" }}>
                🎯
              </div>
              <div className="flex-1">
                <div className="mb-0.5 font-medium text-slate-900" style={{ fontSize: "13px" }}>
                  16가지 유형 중 하나
                </div>
                <div className="text-slate-500" style={{ fontSize: "11px", lineHeight: 1.4 }}>
                  당신의 유형과 어울리는 대표 차량, 그리고 내 예산에 맞는 선택지를 알려드려요
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white" style={{ fontSize: "22px" }}>
                🔒
              </div>
              <div className="flex-1">
                <div className="mb-0.5 font-medium text-slate-900" style={{ fontSize: "13px" }}>
                  진단 자체는 회원가입 불필요
                </div>
                <div className="text-slate-500" style={{ fontSize: "11px", lineHeight: 1.4 }}>
                  결과 저장·공유하실 때만 로그인 안내드려요
                </div>
              </div>
            </div>
          </div>

          {/* 문항 예시 미리보기 */}
          <div className="mb-5 rounded-xl border border-dashed border-slate-300 bg-white p-3.5">
            <div
              className="mb-2 font-medium uppercase text-slate-400"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              문항 예시 미리보기
            </div>
            <div className="mb-2 font-medium" style={{ fontSize: "13px" }}>
              차를 주로 어떤 상황에서 탈 것 같나요?
            </div>
            <div className="flex gap-1.5">
              <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 p-2 text-center text-slate-600" style={{ fontSize: "10px" }}>
                🏙️ 매일 출퇴근
              </div>
              <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 p-2 text-center text-slate-600" style={{ fontSize: "10px" }}>
                🏞️ 주말 여행
              </div>
            </div>
          </div>
        </main>

        {/* 하단 CTA 영역 */}
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-opacity hover:opacity-95"
            style={{
              fontSize: "14px",
              background: "linear-gradient(90deg, #0F7FFF, #6B47FF)",
            }}
          >
            진단 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
