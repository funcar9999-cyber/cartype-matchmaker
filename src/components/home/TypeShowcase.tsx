const tags = ["감성적", "유동성", "전기차 선호"];

export function TypeShowcase() {
  return (
    <section className="mb-3">
      <h2 className="pl-1 font-medium" style={{ fontSize: "13px" }}>
        지금 가장 많은 유형
      </h2>
      <button
        type="button"
        onClick={() => console.log("navigate:/types/CTEF")}
        className="mt-2 block w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
      >
        <div
          className="mb-1 text-muted-foreground"
          style={{ fontSize: "10px" }}
        >
          이번 주 TOP · 상위 12%
        </div>
        <div className="font-medium" style={{ fontSize: "12px" }}>
          CTEF · 도시의 트렌드세터 🔋
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-gray-100 px-2 py-0.5"
              style={{ fontSize: "9px" }}
            >
              {t}
            </span>
          ))}
        </div>
      </button>
    </section>
  );
}