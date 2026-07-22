export function BrandHero() {
  return (
    <section
      className="relative mb-4 overflow-hidden rounded-2xl p-6"
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
        자동차 살 땐 야차
      </h1>
      <p
        className="mt-2"
        style={{ fontSize: "13px", opacity: 0.75, lineHeight: 1.6 }}
      >
        내게 맞는 차와 금융, 여기서 한 번에
      </p>
    </section>
  );
}