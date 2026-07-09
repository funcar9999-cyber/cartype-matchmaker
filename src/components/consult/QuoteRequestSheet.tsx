import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CAR_DB } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { KAKAO_CHANNEL_URL } from "@/lib/mydata-tiers";

type PayMethodChip = "할부" | "리스" | "장기렌트";
const PAY_METHODS: PayMethodChip[] = ["할부", "리스", "장기렌트"];

function normalizeMethod(m: string | undefined): PayMethodChip {
  if (m === "리스") return "리스";
  if (m === "장기렌트") return "장기렌트";
  return "할부"; // 할부 / 현금+할부 / undefined
}

export type QuoteContext = {
  /** 페이지 문맥의 기본 차량 이름 (S10/S11 = 보던 차, 결과지/S8 = 대표 차량). 없으면 "미정" */
  defaultCarName?: string;
};

export function QuoteRequestSheet({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  context: QuoteContext;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [carName, setCarName] = useState<string>(context.defaultCarName ?? "미정");
  const [method, setMethod] = useState<PayMethodChip>("할부");
  const [contactPref, setContactPref] = useState<"kakao" | "phone">("kakao");

  // 세션에서 유형·예산 로드, 오픈될 때마다 최신 컨텍스트 반영
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const c = sessionStorage.getItem("carbti:diagnosis:code");
    const t = c && CARBTI_TYPES[c] ? c : null;
    setCode(t);
    setMethod(normalizeMethod(t ? CARBTI_TYPES[t].bestPayment.method : undefined));
    const b = sessionStorage.getItem("carbti:budget");
    setBudget(b ? Number(b) : null);
    setCarName(context.defaultCarName ?? "미정");
  }, [open, context.defaultCarName]);

  const type = code ? CARBTI_TYPES[code] : null;

  const requestText = useMemo(() => {
    const lines: string[] = ["📋 CarBTI 견적 요청서"];
    if (type) lines.push(`• 유형: ${type.code} · ${type.name}`);
    lines.push(`• 관심 차량: ${carName}`);
    lines.push(`• 선호 방식: ${method}`);
    lines.push(`• 월 예산: ${budget ? `${budget}만원` : "미정"}`);
    lines.push(
      `• 요청 방식: ${contactPref === "kakao" ? "카톡으로 견적만 받아볼게요" : "전화 상담도 괜찮아요"}`,
    );
    return lines.join("\n");
  }, [type, carName, method, budget, contactPref]);

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      await navigator.clipboard.writeText(requestText);
    } catch {
      /* 무시 — 클립보드 실패해도 카톡 열기는 진행 */
    }
    window.open(KAKAO_CHANNEL_URL, "_blank", "noopener,noreferrer");
    toast("요청서가 복사됐어요 — 채팅창에 붙여넣기만 하면 끝!");
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="견적 요청서"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-white p-4"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
        <div className="mb-1 font-medium" style={{ fontSize: "15px" }}>
          📋 견적 요청서
        </div>
        <div className="mb-4 text-slate-500" style={{ fontSize: "11px" }}>
          자동으로 채워드렸어요
        </div>

        {type && (
          <Row label="유형">
            <span className="text-slate-900" style={{ fontSize: "12px" }}>
              <span className="font-medium text-brand-primary">{type.code}</span>
              {" · "}
              {type.name}
            </span>
          </Row>
        )}

        <Row label="관심 차량">
          <select
            value={carName}
            onChange={(e) => setCarName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-900"
            style={{ fontSize: "12px" }}
          >
            <option value="미정">미정</option>
            {CAR_DB.map((c) => {
              const display = c.name.startsWith(c.brand)
                ? c.name
                : `${c.brand} ${c.name}`;
              return (
                <option key={c.id} value={display}>
                  {display}
                </option>
              );
            })}
          </select>
        </Row>

        <Row label="선호 방식">
          <div className="flex flex-wrap gap-1.5">
            {PAY_METHODS.map((m) => {
              const active = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-full border px-3 py-1 ${
                    active
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                  style={{ fontSize: "11px" }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </Row>

        <Row label="월 예산">
          <span className="text-slate-900" style={{ fontSize: "12px" }}>
            {budget ? `${budget}만원` : "미정"}
          </span>
        </Row>

        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-slate-500" style={{ fontSize: "11px" }}>
            요청 방식
          </div>
          <label className="mb-1.5 flex items-start gap-2">
            <input
              type="radio"
              name="contact-pref"
              className="mt-0.5"
              checked={contactPref === "kakao"}
              onChange={() => setContactPref("kakao")}
            />
            <span className="text-slate-900" style={{ fontSize: "12px" }}>
              카톡으로 견적만 받아볼게요 (전화 부담 없이)
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="contact-pref"
              className="mt-0.5"
              checked={contactPref === "phone"}
              onChange={() => setContactPref("phone")}
            />
            <span className="text-slate-900" style={{ fontSize: "12px" }}>
              전화 상담도 괜찮아요
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          className="mt-4 w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
          style={{ fontSize: "13px" }}
        >
          요청서 복사하고 카카오톡 열기
        </button>
        <p
          className="mt-2 text-center text-slate-500"
          style={{ fontSize: "10px", lineHeight: 1.5 }}
        >
          견적 확인은 무료예요. 수수료는 금융사가 부담하고 소비자에게 청구되지 않아요.
        </p>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-slate-600"
          style={{ fontSize: "12px" }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 grid grid-cols-[80px_1fr] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-slate-500" style={{ fontSize: "11px" }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}