import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function FinalDiagnosisCta() {
  const navigate = useNavigate();
  return (
    <section
      className="mt-4 rounded-2xl p-5 text-center"
      style={{
        background: "var(--gradient-hero)",
        color: "var(--ivory)",
        boxShadow: "var(--shadow-dark)",
      }}
    >
      <div className="mb-3" style={{ fontSize: "13px", opacity: 0.85 }}>
        1분이면 내 유형과 예산 구간까지 나와요
      </div>
      <button
        type="button"
        onClick={() => void navigate({ to: "/diagnosis/onboarding" })}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-transform active:scale-[0.98]"
        style={{ backgroundColor: "var(--ivory)", color: "var(--midnight)", fontSize: "13px" }}
      >
        카BTI 진단 시작하기
        <ArrowRight size={15} color="var(--gold)" />
      </button>
    </section>
  );
}
