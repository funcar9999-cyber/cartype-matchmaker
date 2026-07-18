import { ShieldCheck } from "lucide-react";

export function TrustStrip() {
  return (
    <section
      className="mb-3 flex items-center gap-3 rounded-2xl border p-3"
      style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}
    >
      <ShieldCheck size={18} color="var(--teal)" strokeWidth={1.75} />
      <div className="flex-1">
        <p style={{ fontSize: "11px", color: "var(--ink)" }}>
          NICE 마이데이터 안전 연동 · 조회 이력 없음
        </p>
        <p className="mt-0.5" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
          금융상품 대리중개업 등록 정식 사업자
        </p>
      </div>
    </section>
  );
}