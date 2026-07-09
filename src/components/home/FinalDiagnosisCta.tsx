import { useNavigate } from "@tanstack/react-router";

export function FinalDiagnosisCta() {
  const navigate = useNavigate();
  return (
    <section
      className="mt-4 rounded-2xl p-4 text-center text-white"
      style={{
        background: "linear-gradient(90deg, #0F7FFF, #6B47FF)",
      }}
    >
      <div className="mb-3 font-medium" style={{ fontSize: "13px" }}>
        1분이면 내 유형과 예산 구간까지 나와요
      </div>
      <button
        type="button"
        onClick={() => void navigate({ to: "/diagnosis/onboarding" })}
        className="w-full rounded-xl bg-white py-3 font-medium text-brand-primary"
        style={{ fontSize: "13px" }}
      >
        카BTI 진단 시작하기
      </button>
    </section>
  );
}