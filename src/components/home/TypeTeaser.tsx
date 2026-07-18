import { useNavigate } from "@tanstack/react-router";
import { Zap, Cog } from "lucide-react";

import { CARBTI_TYPES } from "@/lib/carbti-types";

export function TypeTeaser() {
  const navigate = useNavigate();
  const codes = Object.keys(CARBTI_TYPES);
  const go = () => void navigate({ to: "/diagnosis/onboarding" });

  return (
    <section className="mb-4">
      <h2 className="pl-1" style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
        당신은 어떤 유형일까요?
      </h2>
      <p className="mb-2 pl-1" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
        16가지 유형 · 눌러서 진단으로 확인해요
      </p>
      <div className="-mx-4 overflow-x-auto">
        <div className="flex gap-1.5 px-4 pb-1">
          {codes.map((c) => {
            const t = CARBTI_TYPES[c];
            const isE = c[2] === "E";
            const Icon = isE ? Zap : Cog;
            const accent = isE ? "var(--teal)" : "var(--copper)";
            return (
              <button
                key={c}
                type="button"
                onClick={go}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 transition active:scale-[0.98]"
                style={{
                  fontSize: "11px",
                  borderColor: "var(--hairline)",
                  backgroundColor: "var(--surface)",
                  color: "var(--ink)",
                }}
              >
                <Icon size={12} color={accent} strokeWidth={2} />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}