import { useState } from "react";
import { toast } from "sonner";

import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";
import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";
import { insertLead, type LeadSource } from "@/lib/carbti-data";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { track } from "@/lib/events";

export type IntentScreen = "result" | "car_detail" | "compare";

const SCREEN_TO_SOURCE: Record<IntentScreen, LeadSource> = {
  result: "result",
  car_detail: "car_detail",
  compare: "compare",
};

export type IntentCtaSetProps = {
  screen: IntentScreen;
  carId?: string | null;
  defaultCarName?: string;
  /** compare 화면에서 선택된 방식(할부/리스/장기렌트) */
  product?: string;
  /** KEEP 클릭 시 커스텀 동작. 지정하지 않으면 현재 URL 복사 + 토스트. */
  onKeep?: () => void;
};

const REASSURANCE = "아직 계약이 아니에요 — 서류 전 최종 확인만 남아요";

export function IntentCtaSet({
  screen,
  carId,
  defaultCarName,
  product,
  onKeep,
}: IntentCtaSetProps) {
  const [hotOpen, setHotOpen] = useState(false);
  const { user, code, budgetManwon, dbId } = useMyCarbti();

  const eventProps = {
    screen,
    ...(carId ? { car_id: carId } : {}),
    ...(product ? { product } : {}),
  };

  const source = SCREEN_TO_SOURCE[screen];

  const handleHot = () => {
    track("cta_apply", eventProps);
    setHotOpen(true);
  };

  const handleWarm = () => {
    track("cta_question", eventProps);
    // 기록 먼저, 동작 나중
    void insertLead({
      source,
      interestCarId: carId ?? null,
      preferredMethod: product ?? (code ? "미정" : "미정"),
      budgetManwon,
      contactPref: "chat_only",
      diagnosisId: dbId,
      userId: user?.id ?? null,
      intent: "question",
    });
    window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
  };

  const handleKeep = () => {
    track("cta_save", eventProps);
    void insertLead({
      source,
      interestCarId: carId ?? null,
      preferredMethod: product ?? "미정",
      budgetManwon,
      contactPref: "chat_only",
      diagnosisId: dbId,
      userId: user?.id ?? null,
      intent: "save",
    });
    if (onKeep) {
      onKeep();
      return;
    }
    if (typeof window === "undefined") return;
    const url = window.location.href;
    void (async () => {
      try {
        await navigator.clipboard.writeText(url);
        toast("저장했어요");
      } catch {
        toast("링크 복사에 실패했어요");
      }
    })();
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleHot}
        className="w-full rounded-xl py-3.5 transition active:scale-[0.98]"
        style={{
          backgroundColor: "var(--midnight)",
          color: "var(--ivory)",
          fontSize: "14px",
          fontWeight: 700,
          boxShadow: "var(--shadow-dark)",
        }}
      >
        이 조건으로 견적 확정 요청
      </button>
      <p
        className="mt-1.5 text-center"
        style={{ fontSize: "10.5px", color: "var(--warm-gray)", lineHeight: 1.5 }}
      >
        {REASSURANCE}
      </p>

      <button
        type="button"
        onClick={handleWarm}
        className="mt-2 w-full rounded-xl py-3 text-center transition active:scale-[0.98]"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--hairline)",
          color: "var(--ink)",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        궁금한 점만 물어보기
      </button>

      <button
        type="button"
        onClick={handleKeep}
        className="mt-1.5 w-full rounded-lg py-2.5 text-center transition active:scale-[0.98]"
        style={{
          backgroundColor: "transparent",
          color: "var(--warm-gray)",
          fontSize: "12.5px",
          fontWeight: 600,
        }}
      >
        이 견적 저장·공유하기
      </button>

      <QuoteRequestSheet
        open={hotOpen}
        onOpenChange={setHotOpen}
        context={{ defaultCarName, source }}
        intent="apply"
        reassurance={REASSURANCE}
      />
    </div>
  );
}