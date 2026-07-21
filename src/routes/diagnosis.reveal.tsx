import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { CARBTI_TYPES } from "@/lib/carbti-types";
import { TypeHeroCard } from "@/components/result/TypeHeroCard";
import { ShareSection } from "@/components/result/ShareSection";
import { useMyCarbti } from "@/hooks/use-my-carbti";

export const Route = createFileRoute("/diagnosis/reveal")({
  head: () => ({
    meta: [
      { title: "카BTI 유형 공개 · 정밀 매칭 시작" },
      { name: "description", content: "당신의 카BTI 유형이 나왔어요. 7문항으로 진짜 내 차를 찾아드릴게요." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RevealPage,
});

function RevealPage() {
  const navigate = useNavigate();
  const shareRef = useRef<HTMLElement>(null);
  const { status, code } = useMyCarbti();

  // 훅에 코드가 없으면 세션 폴백
  const sessionCode =
    typeof window !== "undefined"
      ? sessionStorage.getItem("carbti:diagnosis:code")
      : null;
  const resolved = code ?? sessionCode ?? null;
  const type = resolved ? CARBTI_TYPES[resolved] : null;

  useEffect(() => {
    if (status === "ready" && !type) {
      void navigate({ to: "/diagnosis/onboarding" });
    }
  }, [status, type, navigate]);

  if (status === "loading" || !type) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col" style={{ backgroundColor: "var(--ivory)" }}>
        <main className="flex-1 px-4 py-5">
          <div
            className="mb-3 text-center"
            style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--gold)", fontWeight: 700 }}
          >
            YOUR CARBTI · REVEAL
          </div>
          <TypeHeroCard type={type} />
          <ShareSection ref={shareRef} type={type} />

          <button
            type="button"
            onClick={() => void navigate({ to: "/diagnosis/precision" })}
            className="mt-4 flex w-full items-center justify-center rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98]"
            style={{ backgroundColor: "var(--midnight)", color: "var(--ivory)", fontSize: "14px" }}
          >
            이제 내 차를 찾아드릴게요 — 7문항이면 충분해요
          </button>

          <Link
            to="/result/$typeCode"
            params={{ typeCode: type.code }}
            className="mt-3 block text-center underline"
            style={{ fontSize: "12px", color: "var(--warm-gray)" }}
          >
            나중에 할게요 — 결과지로 이동
          </Link>
        </main>
      </div>
    </div>
  );
}