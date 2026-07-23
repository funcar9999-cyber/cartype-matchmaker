import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { DREAMCAR_LIVE } from "@/lib/flags";
import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";
import { track } from "@/lib/events";

type Approval = {
  dream_car: string | null;
  verdict: string | null;
  created_at?: string | null;
};

export function StatusCard({ onOpenQuote }: { onOpenQuote: () => void }) {
  const navigate = useNavigate();
  const { status, user, code, nickname } = useMyCarbti();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [approvalLoaded, setApprovalLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setApproval(null);
      setApprovalLoaded(true);
      return;
    }
    setApprovalLoaded(false);
    void (async () => {
      const { data } = await supabase
        .from("approvals")
        .select("dream_car, verdict, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setApproval((data as Approval | null) ?? null);
      setApprovalLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (status === "loading" || !approvalLoaded) return null;

  const hasCarbti = !!(code && CARBTI_TYPES[code]);
  const hasApproval = !!approval;
  if (!hasCarbti && !hasApproval) return null;

  const cardStyle = {
    backgroundColor: "var(--navy)",
    color: "var(--ivory)",
    boxShadow: "var(--shadow-dark)",
  } as const;

  const goldLabel = {
    fontSize: "10px",
    letterSpacing: "0.2em",
    color: "var(--gold)",
    fontWeight: 700,
  } as const;

  // 둘 다 있음
  if (hasCarbti && hasApproval) {
    const type = CARBTI_TYPES[code!];
    return (
      <section className="mb-4 rounded-2xl p-4" style={cardStyle}>
        <div style={goldLabel}>YOUR YACHA</div>
        <div className="mt-1" style={{ fontSize: "14px", fontWeight: 700 }}>
          완전 개인화 완료
        </div>
        <div
          className="mt-1"
          style={{ fontSize: "11px", opacity: 0.75, lineHeight: 1.55 }}
        >
          {type.code} · {type.name}
          {approval?.dream_car ? ` · 드림카 ${approval.dream_car}` : ""}
        </div>
        <button
          type="button"
          onClick={onOpenQuote}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 transition active:scale-[0.98]"
          style={{
            backgroundColor: "var(--ivory)",
            color: "var(--midnight)",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          상담사에게 실제 견적 받기
          <ArrowRight size={14} color="var(--gold)" />
        </button>
        <button
          type="button"
          onClick={() =>
            void navigate({
              to: "/result/$typeCode",
              params: { typeCode: code! },
            })
          }
          className="mt-2 w-full rounded-xl border py-2 transition active:scale-[0.98]"
          style={{
            fontSize: "12px",
            borderColor: "rgba(245,244,240,0.2)",
            color: "var(--ivory)",
            fontWeight: 500,
          }}
        >
          내 매칭 보기
        </button>
      </section>
    );
  }

  // 카BTI만
  if (hasCarbti) {
    const type = CARBTI_TYPES[code!];
    const teaser = DREAMCAR_LIVE
      ? "드림카 승인까지 확인하면 완전해져요 →"
      : "드림카 승인 확인이 곧 열려요 — 오픈 알림 받기";
    return (
      <section className="mb-4 rounded-2xl p-4" style={cardStyle}>
        <div style={goldLabel}>YOUR CARBTI</div>
        <div className="mt-1" style={{ fontSize: "14px", fontWeight: 700 }}>
          {type.code} · {type.name}
          {nickname ? ` · ${nickname}` : ""}
        </div>
        <button
          type="button"
          onClick={() =>
            void navigate({
              to: "/result/$typeCode",
              params: { typeCode: code! },
            })
          }
          className="mt-3 w-full rounded-xl py-2.5 transition active:scale-[0.98]"
          style={{
            backgroundColor: "var(--ivory)",
            color: "var(--midnight)",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          결과지 보기
        </button>
        <button
          type="button"
          onClick={() => {
            if (DREAMCAR_LIVE) {
              track("entry_select", { door: "dreamcar" });
              void navigate({ to: "/dreamcar" as never });
            } else {
              track("entry_select", { door: "dreamcar_teaser" });
              window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
            }
          }}
          className="mt-2 block w-full text-left"
          style={{ fontSize: "11px", color: "var(--gold)", opacity: 0.9 }}
        >
          {teaser}
        </button>
      </section>
    );
  }

  // 승인확인만
  return (
    <section className="mb-4 rounded-2xl p-4" style={cardStyle}>
      <div style={goldLabel}>DREAM CAR</div>
      <div className="mt-1" style={{ fontSize: "14px", fontWeight: 700 }}>
        드림카 {approval?.dream_car ?? "관심 차량"} · 승인 가능성{" "}
        {approval?.verdict ?? "확인됨"}
      </div>
      <button
        type="button"
        onClick={() => void navigate({ to: "/diagnosis/onboarding" })}
        className="mt-3 block w-full text-left"
        style={{ fontSize: "12px", color: "var(--gold)" }}
      >
        1분 진단하면 취향까지 맞춰드려요 →
      </button>
    </section>
  );
}