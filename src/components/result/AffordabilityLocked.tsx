import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";
import { track } from "@/lib/events";
import { ArrowRight } from "lucide-react";

const TIERS: Array<{ key: string; name: string; tagline: string }> = [
  { key: "stable", name: "안정", tagline: "가장 부담 없이" },
  { key: "standard", name: "적정", tagline: "지금 여력에 맞게" },
  { key: "dream", name: "드림", tagline: "조금 무리해서" },
];

export function AffordabilityLocked() {
  const onOpen = () => {
    track("entry_select", { door: "dreamcar_teaser" });
    track("amp_click", { screen: "result", lock_type: "result_blur" });
    if (typeof window !== "undefined") {
      window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      className="mb-4 rounded-2xl p-5"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="mb-1"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        내가 탈 수 있는 차
      </div>
      <div className="mb-3" style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
        드림카 승인 확인이 열리면, 내 여력 기준으로 채워져요 — 곧 열려요
      </div>
      <div className="mb-3" style={{ fontSize: "11.5px", color: "var(--ink)", lineHeight: 1.5 }}>
        조회하면 전부 실숫자로 바뀌어요
      </div>

      <div className="grid grid-cols-3 gap-2 select-none" aria-hidden>
        {TIERS.map((t, idx) => {
          const isMid = idx === 1;
          const bg = isMid ? "var(--navy)" : "var(--surface)";
          const fg = isMid ? "var(--ivory)" : "var(--ink)";
          const subFg = isMid ? "rgba(245,244,240,0.65)" : "var(--warm-gray)";
          return (
            <div
              key={t.key}
              className="relative overflow-hidden rounded-2xl p-3"
              style={{
                backgroundColor: bg,
                color: fg,
                border: isMid ? "none" : "1px solid var(--hairline)",
                boxShadow: isMid ? "var(--shadow-dark)" : "var(--shadow-card)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700 }}>{t.name}</div>
              <div className="mt-0.5" style={{ fontSize: "10px", color: subFg, lineHeight: 1.4 }}>
                {t.tagline}
              </div>
              <div className="mt-3" style={{ filter: "blur(6px)", pointerEvents: "none" }}>
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: isMid ? "rgba(245,244,240,0.15)" : "var(--hairline)" }}
                />
                <div
                  className="mt-1.5 h-2 w-3/4 rounded"
                  style={{ backgroundColor: isMid ? "rgba(245,244,240,0.15)" : "var(--hairline)" }}
                />
                <div
                  className="mt-1 h-2 w-1/2 rounded"
                  style={{ backgroundColor: isMid ? "rgba(245,244,240,0.15)" : "var(--hairline)" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-3 select-none text-center"
        aria-hidden
        style={{ filter: "blur(5px)", fontSize: "11px", color: "var(--warm-gray)" }}
      >
        소득 기준 상위 ●●% (추정)
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 font-medium transition-transform active:scale-[0.98]"
        style={{ backgroundColor: "var(--midnight)", color: "var(--ivory)", fontSize: "13px" }}
      >
        오픈 알림 받기
        <ArrowRight size={14} color="var(--gold)" />
      </button>
    </section>
  );
}