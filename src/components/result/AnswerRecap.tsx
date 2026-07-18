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

  const rows = DIM_ORDER.map((dim) => {
    const first = answers.find((a) => a.dimension === dim);
    if (!first) return null;
    const m = MAP[dim]?.[first.maps];
    return m ? { dim, ...m } : null;
  }).filter(Boolean) as Array<Mapping & { dim: string }>;

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
          <li key={r.dim} className="flex gap-3">
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
