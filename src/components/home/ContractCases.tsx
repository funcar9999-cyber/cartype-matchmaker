const CASES = [
  {
    who: "30대 직장인",
    car: "쏘렌토 하이브리드",
    method: "장기렌트",
    quote: "보험 포함 월정액으로 관리 걱정을 덜었어요",
  },
  {
    who: "20대 사회초년생",
    car: "아반떼",
    method: "할부",
    quote: "첫 차, 무리 없는 선수금으로 시작했어요",
  },
  {
    who: "40대 개인사업자",
    car: "카니발",
    method: "리스",
    quote: "비용처리까지 고려한 선택이었어요",
  },
];

export function ContractCases() {
  return (
    <section className="mb-4">
      <div
        className="pl-1"
        style={{ fontSize: "10.5px", letterSpacing: "0.25em", color: "var(--warm-gray)", fontWeight: 700 }}
      >
        REAL CONTRACTS
      </div>
      <h2 className="mt-1 pl-1" style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
        이렇게 계약하고 있어요
      </h2>
      <div className="mt-2 -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1" style={{ minWidth: "min-content" }}>
          {CASES.map((c) => (
            <article
              key={c.who + c.car}
              className="w-[220px] flex-shrink-0 rounded-2xl border p-4"
              style={{
                borderColor: "var(--hairline)",
                backgroundColor: "var(--surface)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ fontSize: "10px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
                {c.who}
              </div>
              <div className="mt-1" style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                {c.car}
              </div>
              <div className="mt-0.5" style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 500 }}>
                {c.method}
              </div>
              <p className="mt-2" style={{ fontSize: "11px", color: "var(--ink)", opacity: 0.75, lineHeight: 1.5 }}>
                "{c.quote}"
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
