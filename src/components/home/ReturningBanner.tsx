import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { CARBTI_TYPES } from "@/lib/carbti-types";

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
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div
        className="mb-2 text-slate-900"
        style={{ fontSize: "12px" }}
      >
        🎯 내 유형:{" "}
        <span className="font-medium text-brand-primary">{type.code}</span>
        {" · "}
        {type.name}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            void navigate({
              to: "/result/$typeCode",
              params: { typeCode: code },
            })
          }
          className="rounded-lg border border-slate-200 bg-white py-2 font-medium text-slate-700"
          style={{ fontSize: "12px" }}
        >
          결과지 다시 보기
        </button>
        <button
          type="button"
          onClick={onOpenQuote}
          className="rounded-lg bg-brand-primary py-2 font-medium text-white"
          style={{ fontSize: "12px" }}
        >
          견적 받기
        </button>
      </div>
    </section>
  );
}