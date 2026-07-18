import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CARBTI_TYPES } from "@/lib/carbti-types";
import { Emblem } from "@/components/common/Emblem";

export function ReturningBanner({
  onOpenQuote,
}: {
  onOpenQuote: () => void;
}) {
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = sessionStorage.getItem("carbti:diagnosis:code");
    if (c && CARBTI_TYPES[c]) setCode(c);
  }, []);

  if (!code) return null;
  const type = CARBTI_TYPES[code];

  return (
    <section
      className="mb-4 rounded-2xl p-4"
      style={{
        backgroundColor: "var(--navy)",
        color: "var(--ivory)",
        boxShadow: "var(--shadow-dark)",
      }}
    >
      <div className="flex items-center gap-3">
        <Emblem code={code} size={48} />
        <div className="flex-1">
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--gold)" }}>
            YOUR CARBTI
          </div>
          <div className="mt-0.5" style={{ fontSize: "14px", fontWeight: 700 }}>
            {type.code} · {type.name}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void navigate({ to: "/result/$typeCode", params: { typeCode: code } })}
          className="rounded-xl border py-2.5 transition active:scale-[0.98]"
          style={{
            fontSize: "12px",
            borderColor: "rgba(245,244,240,0.2)",
            color: "var(--ivory)",
            fontWeight: 500,
          }}
        >
          결과지 다시 보기
        </button>
        <button
          type="button"
          onClick={onOpenQuote}
          className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition active:scale-[0.98]"
          style={{
            fontSize: "12px",
            backgroundColor: "var(--ivory)",
            color: "var(--midnight)",
            fontWeight: 700,
          }}
        >
          견적 받기 <ArrowRight size={13} color="var(--gold)" />
        </button>
      </div>
    </section>
  );
}