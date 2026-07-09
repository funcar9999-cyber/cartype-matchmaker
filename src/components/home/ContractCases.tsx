const CASES = [
  {
    who: "30대 직장인",
    car: "쏘렌토 하이브리드",
    method: "장기렌트",
    quote: "보험 포함 월정액으로 관리 걱정을 덜었어요",
    emoji: "🚐",
    gradient: "from-slate-200 to-stone-300",
  },
  {
    who: "20대 사회초년생",
    car: "아반떼",
    method: "할부",
    quote: "첫 차, 무리 없는 선수금으로 시작했어요",
    emoji: "🚘",
    gradient: "from-sky-200 to-cyan-300",
  },
  {
    who: "40대 개인사업자",
    car: "카니발",
    method: "리스",
    quote: "비용처리까지 고려한 선택이었어요",
    emoji: "🚌",
    gradient: "from-neutral-200 to-stone-300",
  },
];

export function ContractCases() {
  return (
    <section className="mb-3">
      <h2 className="pl-1 font-medium" style={{ fontSize: "13px" }}>
        이렇게 계약하고 있어요
      </h2>
      <div className="mt-2 -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1" style={{ minWidth: "min-content" }}>
          {CASES.map((c) => (
            <article
              key={c.who + c.car}
              className="w-[220px] flex-shrink-0 rounded-xl border border-border bg-card p-3"
            >
              <div
                className={`mb-2 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient}`}
              >
                <span style={{ fontSize: "28px" }}>{c.emoji}</span>
              </div>
              <div className="text-slate-500" style={{ fontSize: "10px" }}>
                {c.who}
              </div>
              <div className="mt-0.5 font-medium" style={{ fontSize: "12px" }}>
                {c.car} · {c.method}
              </div>
              <p
                className="mt-1.5 text-slate-600"
                style={{ fontSize: "11px", lineHeight: 1.5 }}
              >
                "{c.quote}"
              </p>
              <div
                className="mt-2 text-slate-400"
                style={{ fontSize: "9px" }}
              >
                실제 상담 사례 기반 재구성
              </div>
            </article>
          ))}
        </div>
      </div>
      <p
        className="mt-2 pl-1 font-medium text-brand-primary"
        style={{ fontSize: "11px" }}
      >
        수수료는 금융사가 부담해요 — 상담·견적은 소비자 무료
      </p>
    </section>
  );
}