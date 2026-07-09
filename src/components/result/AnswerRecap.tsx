import { useEffect, useState } from "react";

import { ANSWERS_STORAGE_KEY, type Answer } from "@/lib/carbti-questions";

type Mapping = { icon: string; said: string; picked: string };

// 축·값별 대표 문장 (§2 표 기반)
const MAP: Record<string, Record<string, Mapping>> = {
  powertrain: {
    E: {
      icon: "🔋",
      said: "\"전기차 갈 준비 완료\"라고 하셨어요",
      picked: "→ 전기차 라인업을 추천했어요",
    },
    G: {
      icon: "⛽",
      said: "\"주유가 아직은 편하다\"라고 하셨어요",
      picked: "→ 가솔린·하이브리드를 추천했어요",
    },
  },
  payment: {
    F: {
      icon: "🔄",
      said: "\"월 요금에 다 포함이면 좋겠다\"라고 하셨어요",
      picked: "→ 리스·장기렌트를 추천했어요",
    },
    S: {
      icon: "🏠",
      said: "\"내 손으로 챙겨야 진짜 내 차\"라고 하셨어요",
      picked: "→ 할부·소유 방식을 추천했어요",
    },
  },
  purpose: {
    C: {
      icon: "🏙️",
      said: "\"도심·출퇴근 위주로 탄다\"라고 하셨어요",
      picked: "→ 도심에 편한 차종을 추천했어요",
    },
    W: {
      icon: "🛣️",
      said: "\"장거리·여행이 잦다\"라고 하셨어요",
      picked: "→ 장거리에 강한 차종을 추천했어요",
    },
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
    } catch {
      /* ignore */
    }
  }, []);

  if (!answers) return null;

  const rows = DIM_ORDER.map((dim) => {
    const first = answers.find((a) => a.dimension === dim);
    if (!first) return null;
    const m = MAP[dim]?.[first.maps];
    return m ? { dim, ...m } : null;
  }).filter(Boolean) as Array<Mapping & { dim: string }>;

  if (rows.length === 0) return null;

  return (
    <section className="mb-3 rounded-2xl bg-slate-50 p-4">
      <div
        className="mb-2 uppercase text-slate-500"
        style={{ fontSize: "10px", letterSpacing: "0.1em" }}
      >
        이렇게 답하셨죠?
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.dim} className="flex items-start gap-2">
            <span className="flex-shrink-0" style={{ fontSize: "14px" }}>
              {r.icon}
            </span>
            <span className="text-slate-900" style={{ fontSize: "12px", lineHeight: 1.5 }}>
              {r.said} <span className="text-slate-500">{r.picked}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}