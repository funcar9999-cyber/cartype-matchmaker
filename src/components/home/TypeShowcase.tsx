import { Emblem } from "@/components/common/Emblem";

const tags = ["도심형", "트렌드", "전기차"];

export function TypeShowcase() {
  return (
    <section className="mb-4">
      <div
        className="pl-1"
        style={{
          fontSize: "10.5px",
          letterSpacing: "0.25em",
          color: "var(--warm-gray)",
          fontWeight: 700,
        }}
      >
        THIS WEEK
      </div>
      <h2
        className="mt-1 pl-1"
        style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}
      >
        지금 가장 많은 유형
      </h2>
      <div
        className="mt-2 flex items-center gap-3 rounded-2xl border p-4"
        style={{
          borderColor: "var(--hairline)",
          backgroundColor: "var(--surface)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Emblem code="CTEF" size={56} />
        <div className="flex-1">
          <div style={{ fontSize: "10px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
            이번 주 TOP · <span style={{ color: "var(--gold)", fontWeight: 700 }}>상위 12%</span>
          </div>
          <div className="mt-0.5" style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
            CTEF · 얼리어답터
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5"
                style={{
                  fontSize: "9px",
                  border: "1px solid var(--hairline)",
                  color: "var(--teal)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}