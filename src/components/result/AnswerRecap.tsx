import { useEffect, useState } from "react";
import { ANSWERS_STORAGE_KEY, type Answer } from "@/lib/carbti-questions";

type Mapping = { said: string; picked: string };

const MAP: Record<string, Record<string, Mapping>> = {
  powertrain: {
    E: { said: "전기차 갈 준비 완료", picked: "전기차 라인업을 추천" },
    G: { said: "주유가 아직은 편하다", picked: "가솔린·하이브리드를 추천" },
  },
  payment: {
    F: { said: "월 요금에 다 포함이면 좋겠다", picked: "리스·장기렌트를 추천" },
    S: { said: "내 손으로 챙겨야 진짜 내 차", picked: "할부·소유 방식을 추천" },
  },
  purpose: {
    C: { said: "도심·출퇴근 위주로 탄다", picked: "도심에 편한 차종을 추천" },
    W: { said: "장거리·여행이 잦다", picked: "장거리에 강한 차종을 추천" },
  },
};

// 금융 관련 개별 문항(F 선택 시) 교육형 문구
const PAYMENT_EDU: Record<number, Mapping> = {
  11: {
    said: "새 차로 갈아타는 게 좋다",
    picked: "잔존가치 하락을 금융사가 지는 리스·렌트가 교체 패턴에 맞아요",
  },
  12: {
    said: "월 요금에 다 포함이면 좋겠다",
    picked: "렌트는 보험·정비·세금까지 월정액에 포함돼요 — 관리는 맡기고 기름만 넣는 방식",
  },
  13: {
    said: "초기 비용은 최소로",
    picked: "리스·렌트는 취등록세 같은 초기 목돈 없이 시작해요",
  },
};

const DIM_ORDER = ["powertrain", "payment", "purpose"] as const;

export function AnswerRecap() {
  const [answers, setAnswers] = useState<Answer[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(ANSWERS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Answer[];
      if (Array.isArray(parsed) && parsed.length > 0) setAnswers(parsed);
    } catch { /* ignore */ }
  }, []);

  if (!answers) return null;

  const rows: Array<Mapping & { dim: string; key: string }> = [];
  for (const dim of DIM_ORDER) {
    if (dim === "payment") {
      // 금융 관련 특정 문항(F)에 대한 교육형 문구를 우선 노출
      const eduRows = answers
        .filter((a) => a.dimension === "payment" && a.maps === "F" && PAYMENT_EDU[a.questionId])
        .map((a) => ({ dim, key: `p-${a.questionId}`, ...PAYMENT_EDU[a.questionId] }));
      if (eduRows.length > 0) {
        rows.push(...eduRows);
        continue;
      }
      const first = answers.find((a) => a.dimension === "payment");
      const m = first ? MAP.payment[first.maps] : null;
      if (m) rows.push({ dim, key: "p", ...m });
      continue;
    }
    const first = answers.find((a) => a.dimension === dim);
    if (!first) continue;
    const m = MAP[dim]?.[first.maps];
    if (m) rows.push({ dim, key: dim, ...m });
  }

  if (rows.length === 0) return null;

  return (
    <section
      className="mb-4 rounded-2xl p-5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--hairline)", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="mb-4"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        당신의 선택이 말해준 것
      </div>
      <ul className="space-y-3.5">
        {rows.map((r) => (
          <li key={r.key} className="flex gap-3">
            <div
              className="w-0.5 flex-shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: "var(--teal)" }}
            />
            <div className="flex-1">
              <div style={{ fontSize: "13px", color: "var(--ink)", fontWeight: 500, lineHeight: 1.4 }}>
                “{r.said}”
              </div>
              <div className="mt-1" style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
                → {r.picked}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
