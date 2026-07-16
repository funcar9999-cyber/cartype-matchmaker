import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { formatTypeCode } from "@/lib/carbti-types";
import { supabase } from "@/lib/supabase";
import {
  claimAnonymousDiagnosis,
  upsertProfileFromUser,
} from "@/lib/carbti-data";

const searchSchema = z.object({
  code: z.string().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/diagnosis/gate")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "진단 완료 · 카카오 로그인하고 결과 확인" },
      {
        name: "description",
        content:
          "15문항 진단이 완료됐어요. 카카오 로그인 3초로 나의 카BTI 결과를 확인하세요.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GatePage,
});

// 브랜드 도트 배경용 팔레트
const CONFETTI_COLORS = ["#F59E0B", "#0F7FFF", "#6B47FF", "#EF4444", "#10B981"];
const CONFETTI_DOTS = [
  { top: 9, left: 14, duration: 3, delay: "0.0" },
  { top: 23, left: 84, duration: 4, delay: "0.4" },
  { top: 41, left: 29, duration: 5, delay: "0.8" },
  { top: 59, left: 70, duration: 3, delay: "1.2" },
  { top: 75, left: 19, duration: 4, delay: "1.6" },
  { top: 88, left: 80, duration: 5, delay: "2.0" },
].map((d, i) => ({ ...d, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }));

function GatePage() {
  const { code: searchCode } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState<string>(searchCode ?? "CTEF");
  const [loggingIn, setLoggingIn] = useState(false);

  // sessionStorage에서 진단 결과 유형 코드 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored) setCode(stored);
  }, []);

  // 카카오 OAuth 복귀 시 세션 감지 → profiles upsert → diagnoses claim → 결과지 이동
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const run = async (userId: string, user: { id: string; user_metadata?: Record<string, unknown> }) => {
      await upsertProfileFromUser(user);
      await claimAnonymousDiagnosis(userId);
      const target = sessionStorage.getItem("carbti:diagnosis:code") ?? code;
      if (!cancelled) {
        void navigate({ to: "/result/$typeCode", params: { typeCode: target } });
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) void run(u.id, u);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void run(session.user.id, session.user);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [code, navigate]);

  // 뒤로가기 확인 다이얼로그 (결과 유실 방지)
  useEffect(() => {
    if (typeof window === "undefined") return;
    // 현재 페이지 위에 더미 히스토리 항목을 push해서 popstate를 가로챔
    window.history.pushState({ carbtiGate: true }, "");
    const handlePopState = () => {
      const leave = window.confirm("결과가 사라져요. 정말 나가시겠어요?");
      if (leave) {
        void navigate({ to: "/" });
      } else {
        // 다시 게이트 상태로 복귀
        window.history.pushState({ carbtiGate: true }, "");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleKakaoLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin + "/diagnosis/gate",
      },
    });
    if (error) {
      setLoggingIn(false);
      toast.error("카카오 로그인에 실패했어요. 잠시 후 다시 시도해주세요.");
      console.warn("[kakao login]", error);
    }
  };

  const formatted = formatTypeCode(code);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col overflow-hidden bg-background">
        {/* 1. 컨페티 배경 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {CONFETTI_DOTS.map((dot, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                width: "6px",
                height: "6px",
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                backgroundColor: dot.color,
                opacity: 0.3,
                animation: `carbti-float ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes carbti-float {
            0%, 100% { transform: translateY(-2px); }
            50% { transform: translateY(2px); }
          }
          @keyframes carbti-emoji-bounce {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}</style>

        <div className="relative z-10 flex flex-1 flex-col px-4">
          {/* 2. 상단 완료 상태 */}
          <div className="p-1 pb-5 pt-3 text-center">
            <span
              className="text-slate-400"
              style={{ fontSize: "11px" }}
            >
              15 / 15 · 진단 완료
            </span>
          </div>

          {/* 3. 히어로 */}
          <div className="px-1 pb-5 pt-2 text-center">
            <div
              className="mb-3.5 inline-block"
              style={{
                fontSize: "56px",
                lineHeight: 1,
                animation:
                  "carbti-emoji-bounce 500ms ease-in-out 300ms both",
              }}
            >
              🎉
            </div>
            <h1
              className="mb-2.5 font-medium text-slate-900"
              style={{ fontSize: "24px", lineHeight: 1.3 }}
            >
              당신의 카BTI가
              <br />
              <span style={{ color: "#0F7FFF" }}>방금 나왔어요!</span>
            </h1>
            <p
              className="text-slate-500"
              style={{ fontSize: "13px", lineHeight: 1.5 }}
            >
              3초만에 확인하고
              <br />
              친구들에게도 자랑해봐요
            </p>
          </div>

          {/* 4. 블러 프리뷰 카드 */}
          <div
            className="mb-5 rounded-2xl p-4 text-center"
            style={{
              background:
                "linear-gradient(160deg, rgba(15,127,255,0.08), rgba(107,71,255,0.08))",
              border: "1px solid rgba(15,127,255,0.15)",
              padding: "18px",
            }}
          >
            <div
              className="mb-2.5 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.15em" }}
            >
              당신의 유형
            </div>
            <div
              className="mb-2 font-medium"
              style={{
                fontSize: "30px",
                letterSpacing: "0.2em",
                color: "#0F7FFF",
                filter: "blur(6px)",
                userSelect: "none",
              }}
            >
              {formatted}
            </div>
            <div className="text-slate-500" style={{ fontSize: "12px" }}>
              🔒 카카오 로그인하시면 바로 보여드려요
            </div>
          </div>

          {/* 5. 3대 혜택 */}
          <div className="mb-5 rounded-2xl bg-slate-50 p-3.5">
            {[
              "결과지 영구 저장 · 언제든 다시 볼 수 있어요",
              "카카오톡·인스타로 결과 공유하기",
              "마이데이터 연동 시 실제 승인률까지",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-2.5 py-1.5"
              >
                <span
                  className="flex-shrink-0"
                  style={{ fontSize: "14px", color: "#10B981" }}
                >
                  ✓
                </span>
                <span
                  className="text-slate-900"
                  style={{ fontSize: "12px" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* 카카오 로그인 CTA */}
          <div className="pb-6">
            <button
              type="button"
              onClick={() => void handleKakaoLogin()}
              disabled={loggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-transform duration-100 active:scale-[0.98]"
              style={{
                backgroundColor: "#FEE500",
                color: "#191600",
                fontSize: "14px",
              }}
            >
              <span style={{ fontSize: "16px" }}>💬</span>
              {loggingIn ? "카카오로 이동 중…" : "카카오로 3초만에 시작하기"}
            </button>
            <p
              className="mt-2.5 text-center text-slate-400"
              style={{ fontSize: "10px", lineHeight: 1.5 }}
            >
              가입 시{" "}
              <Link to="/terms" className="underline">
                서비스 이용약관
              </Link>{" "}
              및{" "}
              <Link to="/privacy" className="underline">
                개인정보 처리방침
              </Link>
              에 동의합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}