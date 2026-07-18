import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function HeroCard() {
  const navigate = useNavigate();

  return (
    <section
      className="relative mb-4 overflow-hidden rounded-2xl p-6"
      style={{
        background: "var(--gradient-hero)",
        boxShadow: "var(--shadow-dark)",
        color: "var(--ivory)",
      }}
    >
      <span
        className="inline-flex items-center rounded-full border px-2 py-0.5"
        style={{
          fontSize: "10px",
          letterSpacing: "0.15em",
          borderColor: "rgba(201,169,106,0.4)",
          color: "var(--gold)",
        }}
      >
        NEW
      </span>
      <h1
        className="mt-4 leading-[1.15]"
        style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.01em" }}
      >
        1분 만에 발견하는
        <br />
        나의 자동차 DNA
      </h1>
      <p
        className="mt-2"
        style={{ fontSize: "12px", opacity: 0.75, lineHeight: 1.6 }}
      >
        나에게 맞는 차부터, 할부·리스·렌트 중 뭐가 유리한지까지
      </p>
      <button
        type="button"
        onClick={() => void navigate({ to: "/diagnosis/onboarding" })}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-transform active:scale-[0.98]"
        style={{
          backgroundColor: "var(--ivory)",
          color: "var(--midnight)",
          fontSize: "14px",
        }}
      >
        지금 카BTI 진단 시작
        <ArrowRight size={16} color="var(--gold)" />
      </button>
      <p
        className="mt-3 text-center"
        style={{ fontSize: "10px", opacity: 0.55, letterSpacing: "0.05em" }}
      >
        평균 2분 · 회원가입 없이 바로 시작
      </p>
    </section>
  );
}
