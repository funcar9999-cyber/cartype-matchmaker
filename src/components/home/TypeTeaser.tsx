import { useNavigate } from "@tanstack/react-router";

import { CARBTI_TYPES } from "@/lib/carbti-types";

export function TypeTeaser() {
  const navigate = useNavigate();
  const codes = Object.keys(CARBTI_TYPES);

  const go = () => {
    void navigate({ to: "/diagnosis/onboarding" });
  };

  return (
    <section className="mb-3">
      <h2 className="pl-1 font-medium" style={{ fontSize: "13px" }}>
        당신은 어떤 유형일까요?
      </h2>
      <p
        className="mb-2 pl-1 text-slate-500"
        style={{ fontSize: "10px" }}
      >
        16가지 유형 · 눌러서 진단으로 확인해요
      </p>
      <div className="-mx-4 overflow-x-auto">
        <div className="flex gap-1.5 px-4 pb-1">
          {codes.map((c) => {
            const t = CARBTI_TYPES[c];
            return (
              <button
                key={c}
                type="button"
                onClick={go}
                className="flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition-colors hover:bg-accent"
                style={{ fontSize: "11px" }}
              >
                <span>{t.emoji}</span>
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}