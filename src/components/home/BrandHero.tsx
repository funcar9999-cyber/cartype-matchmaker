import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { DREAMCAR_LIVE } from "@/lib/flags";
import { track } from "@/lib/events";
import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";

export function BrandHero() {
  const navigate = useNavigate();

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
    <section
      className="relative mb-4 overflow-hidden rounded-2xl p-5"
      style={{
        backgroundColor: "var(--midnight)",
        color: "var(--ivory)",
        boxShadow: "var(--shadow-dark)",
      }}
    >
      <h1
        className="leading-[1.15]"
        style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.01em" }}
      >
        자동차 살 땐 <span style={{ color: "var(--yacha-red)" }}>야차</span>
      </h1>
      <p
        className="mt-1.5"
        style={{ fontSize: "13px", opacity: 0.75, lineHeight: 1.6 }}
      >
        내게 맞는 차와 금융, 여기서 한 번에
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDoorA}
          className="flex h-full flex-col items-center rounded-xl border border-white/20 bg-white/10 p-3 text-center transition active:scale-[0.99]"
        >
          <div style={{ fontSize: "22px" }}>🧭</div>
          <div
            className="mt-1.5"
            style={{ fontSize: "15px", fontWeight: 700, color: "var(--ivory)" }}
          >
            어떤 차가 맞을까?
          </div>
          <div
            className="mt-0.5"
            style={{ fontSize: "11px", color: "var(--ivory)", opacity: 0.75, lineHeight: 1.45 }}
          >
            카BTI 1분 진단
          </div>
        </button>

        <button
          type="button"
          onClick={onDoorB}
          className="flex h-full flex-col items-center rounded-xl border border-white/20 bg-white/10 p-3 text-center transition active:scale-[0.99]"
        >
          <div style={{ fontSize: "22px" }}>🎯</div>
          <div
            className="mt-1.5"
            style={{ fontSize: "15px", fontWeight: 700, color: "var(--ivory)" }}
          >
            그 차, 될까?
          </div>
          <div
            className="mt-0.5"
            style={{ fontSize: "11px", color: "var(--ivory)", opacity: 0.75, lineHeight: 1.45 }}
          >
            {DREAMCAR_LIVE ? "드림카 승인 확인 · 1분" : "드림카 승인 확인 — 곧 열려요"}
          </div>
          {!DREAMCAR_LIVE && (
            <div
              className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{
                backgroundColor: "rgba(245, 244, 240, 0.15)",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "var(--ivory)" }}>오픈 알림 받기</span>
              <ArrowRight size={12} color="var(--gold)" />
            </div>
          )}
        </button>
      </div>
    </section>
  );
}
