import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { formatTypeCode } from "@/lib/carbti-types";

const searchSchema = z.object({
  code: z.string().min(1).catch("CTEF"),
});

export const Route = createFileRoute("/diagnosis/gate")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "진단 완료 · 결과 잠금 해제" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GatePage,
});

function GatePage() {
  const { code } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background px-4 py-6">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span
            className="rounded-full bg-blue-50 px-3 py-1 font-medium text-brand-primary"
            style={{ fontSize: "11px", letterSpacing: "0.08em" }}
          >
            YOUR CARBTI
          </span>
          <h1
            className="font-medium tracking-tight text-foreground"
            style={{ fontSize: "28px" }}
          >
            {formatTypeCode(code)}
          </h1>
          <p className="text-slate-500" style={{ fontSize: "13px" }}>
            결과를 저장하고 이어보려면 회원가입이 필요해요.
            <br />
            지금은 미리보기로 확인할 수 있어요.
          </p>
          <div className="mt-4 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => alert("회원가입 화면 준비 중")}
              className="w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
              style={{ fontSize: "14px" }}
            >
              회원가입하고 결과 저장
            </button>
            <button
              type="button"
              onClick={() =>
                void navigate({
                  to: "/result/$typeCode",
                  params: { typeCode: code },
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-3 font-medium text-foreground"
              style={{ fontSize: "14px" }}
            >
              결과 미리보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}