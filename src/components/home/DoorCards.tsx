import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { DREAMCAR_LIVE } from "@/lib/flags";
import { track } from "@/lib/events";
import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";

export function DoorCards() {
  const navigate = useNavigate();

  const cardBase =
    "block w-full rounded-2xl border p-5 text-left transition active:scale-[0.99]";
  const cardStyle = {
    borderColor: "var(--hairline)",
    backgroundColor: "var(--surface)",
    boxShadow: "var(--shadow-card)",
  } as const;

  const onDoorA = () => {
    track("entry_select", { door: "carbti" });
    void navigate({ to: "/diagnosis/onboarding" });
  };

  const onDoorB = () => {
    track("entry_select", {
      door: DREAMCAR_LIVE ? "dreamcar" : "dreamcar_teaser",
    });
    if (DREAMCAR_LIVE) {
      void navigate({ to: "/dreamcar" as never });
    } else {
      window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="mb-4 space-y-2">
      <button type="button" onClick={onDoorA} className={cardBase} style={cardStyle}>
        <div style={{ fontSize: "22px" }}>🧭</div>
        <div
          className="mt-2"
          style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink)" }}
        >
          어떤 차가 나랑 맞는지 모르겠어요
        </div>
        <div
          className="mt-1"
          style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.55 }}
        >
          카BTI 1분 진단 — 성향과 상황으로 차와 금융을 맞춰드려요
        </div>
      </button>

      <button type="button" onClick={onDoorB} className={cardBase} style={cardStyle}>
        <div style={{ fontSize: "22px" }}>🎯</div>
        <div
          className="mt-2"
          style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink)" }}
        >
          드림카가 있어요 — 그 차, 될까요?
        </div>
        <div
          className="mt-1"
          style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.55 }}
        >
          {DREAMCAR_LIVE
            ? "내 신용·소득 기준으로 1분 만에"
            : "드림카 승인 확인 — 곧 열려요"}
        </div>
        {!DREAMCAR_LIVE && (
          <div
            className="mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: "var(--midnight)",
              color: "var(--ivory)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            오픈 알림 받기
            <ArrowRight size={13} color="var(--gold)" />
          </div>
        )}
      </button>
    </section>
  );
}