import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Check } from "lucide-react";

import { formatTypeCode } from "@/lib/carbti-types";
import { Emblem } from "@/components/common/Emblem";
import { supabase } from "@/lib/supabase";
import {
  claimAnonymousDiagnosis,
  upsertProfileFromUser,
} from "@/lib/carbti-data";
import { useMyCarbti } from "@/hooks/use-my-carbti";

const searchSchema = z.object({
  code: z.string().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/diagnosis/gate")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "진단 완료 · 카카오 로그인하고 결과 확인" },
      { name: "description", content: "15문항 진단이 완료됐어요. 카카오 로그인 3초로 나의 카BTI 결과를 확인하세요." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GatePage,
});

function GatePage() {
  const { code: searchCode } = Route.useSearch();
  const navigate = useNavigate();
  const { refresh } = useMyCarbti();
  const [code, setCode] = useState<string>(searchCode ?? "CTEF");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored) setCode(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const run = async (userId: string, user: { id: string; user_metadata?: Record<string, unknown> }) => {
      await upsertProfileFromUser(user);
      await claimAnonymousDiagnosis(userId);
      await refresh();
      const target = sessionStorage.getItem("carbti:diagnosis:code") ?? code;
      void target;
      if (!cancelled) void navigate({ to: "/diagnosis/reveal" });
    };
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) void run(u.id, u);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) void run(session.user.id, session.user);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [code, navigate, refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState({ carbtiGate: true }, "");
    const handlePopState = () => {
      const leave = window.confirm("결과가 사라져요. 정말 나가시겠어요?");
      if (leave) void navigate({ to: "/" });
      else window.history.pushState({ carbtiGate: true }, "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleKakaoLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin + "/diagnosis/gate",
        scopes: "profile_nickname profile_image",
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
    <div style={{ backgroundColor: "var(--midnight)" }} className="min-h-screen">
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col overflow-hidden"
        style={{
          background: "radial-gradient(120% 60% at 50% 0%, rgba(30,127,116,0.35) 0%, rgba(10,15,28,0) 60%), var(--midnight)",
          color: "var(--ivory)",
          animation: "carbti-fadein 600ms ease-out both",
        }}
      >
        <style>{`
          @keyframes carbti-fadein { from { opacity: 0 } to { opacity: 1 } }
          @keyframes carbti-emblem-in {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <div className="relative z-10 flex flex-1 flex-col px-5">
          {/* 상단 진행 표시 */}
          <div className="pt-4 text-center">
            <span style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--gold)", fontWeight: 700 }}>
              15 / 15 · COMPLETE
            </span>
          </div>

          {/* 히어로 카피 */}
          <div className="mt-8 px-1 text-center">
            <h1 style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.25, color: "var(--ivory)" }}>
              당신의 카BTI가
              <br />
              방금 <span style={{ color: "var(--gold)" }}>나왔어요</span>
            </h1>
            <p className="mt-3" style={{ fontSize: "12px", color: "#8B93A7", lineHeight: 1.6 }}>
              3초만에 확인하고 친구들에게도 자랑해봐요
            </p>
          </div>

          {/* Emblem 티저 (blurred) */}
          <div className="mt-8 flex flex-col items-center">
            <div style={{ animation: "carbti-emblem-in 600ms ease-out 200ms both" }}>
              <Emblem code={code} size={128} blurred />
            </div>
            <div
              className="mt-6 rounded-2xl px-6 py-4 text-center"
              style={{ backgroundColor: "var(--navy)", border: "1px solid rgba(201,169,106,0.25)" }}
            >
              <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: "var(--gold)", fontWeight: 700 }}>
                YOUR TYPE
              </div>
              <div
                className="mt-2"
                style={{
                  fontSize: "34px",
                  letterSpacing: "0.28em",
                  fontWeight: 800,
                  color: "var(--ivory)",
                  filter: "blur(8px)",
                  userSelect: "none",
                }}
              >
                {formatted}
              </div>
              <div className="mt-2" style={{ fontSize: "11px", color: "#8B93A7" }}>
                카카오 로그인하면 바로 보여드려요
              </div>
            </div>
          </div>

          {/* 3대 혜택 */}
          <div className="mt-8 space-y-2.5">
            {[
              "결과지 영구 저장 · 언제든 다시 보기",
              "카카오톡·인스타로 결과 공유",
              "마이데이터 연동 시 실제 승인률까지",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <Check size={14} color="var(--gold)" strokeWidth={2.5} />
                <span style={{ fontSize: "12px", color: "var(--ivory)", opacity: 0.9 }}>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* 카카오 CTA */}
          <div className="pb-6 pt-8">
            <button
              type="button"
              onClick={() => void handleKakaoLogin()}
              disabled={loggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98]"
              style={{ backgroundColor: "#FEE500", color: "#191600", fontSize: "14px" }}
            >
              {loggingIn ? "카카오로 이동 중…" : "카카오로 3초만에 시작하기"}
            </button>
            <p className="mt-3 text-center" style={{ fontSize: "10px", color: "#8B93A7", lineHeight: 1.6 }}>
              가입 시{" "}
              <Link to="/terms" className="underline">서비스 이용약관</Link>{" "}및{" "}
              <Link to="/privacy" className="underline">개인정보 처리방침</Link>
              에 동의합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
