import { useNavigate } from "@tanstack/react-router";

export function HeroCard() {
  const navigate = useNavigate();

  const handleStart = () => {
    void navigate({ to: "/diagnosis/onboarding" });
  };

  return (
    <section
      className="mb-3 rounded-2xl p-5 text-white shadow-[0_12px_30px_-12px_rgba(15,127,255,0.55)]"
      style={{ background: "var(--gradient-hero)" }}
    >
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
        style={{
          fontSize: "10px",
          backgroundColor: "rgba(255,255,255,0.2)",
        }}
      >
        ✨ NEW
      </span>
      <h1
        className="mt-3 font-medium leading-snug"
        style={{ fontSize: "20px" }}
      >
        1분 만에 발견하는
        <br />
        나의 자동차 DNA
      </h1>
      <p className="mt-1.5" style={{ fontSize: "12px", opacity: 0.9 }}>
        나에게 맞는 차부터, 할부·리스·렌트 중 뭐가 유리한지까지
      </p>
      <button
        type="button"
        onClick={handleStart}
        className="mt-4 w-full rounded-xl bg-white py-3 font-medium text-brand-primary transition-opacity hover:opacity-95"
        style={{ fontSize: "14px" }}
      >
        지금 카BTI 진단 시작 →
      </button>
      <p
        className="mt-2 text-center"
        style={{ fontSize: "10px", opacity: 0.8 }}
      >
        평균 2분 · 회원가입 없이 바로 시작
      </p>
    </section>
  );
}
