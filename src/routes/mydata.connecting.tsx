import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/mydata/connecting")({
  head: () => ({
    meta: [
      { title: "연결 중 · CarBTI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MydataConnectingPage,
});

const STEPS = [
  "본인 확인 중이에요…",
  "금융 정보를 불러오고 있어요…",
  "예산을 계산하고 있어요…",
];

function MydataConnectingPage() {
  const navigate = useNavigate();
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setDoneCount(i + 1), (i + 1) * 1000));
    });
    const nav = setTimeout(() => {
      void navigate({ to: "/mydata/result" });
    }, 3000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(nav);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div
            className="mb-4 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"
            style={{ fontSize: "10px" }}
          >
            데모 시뮬레이션
          </div>

          {/* 스피너 */}
          <div
            className="mb-6 h-12 w-12 rounded-full border-4 border-slate-200 border-t-brand-primary"
            style={{ animation: "carbti-spin 0.9s linear infinite" }}
          />
          <style>{`@keyframes carbti-spin { to { transform: rotate(360deg); } }`}</style>

          {/* 체크리스트 */}
          <ul className="w-full max-w-[280px] space-y-3">
            {STEPS.map((step, i) => {
              const done = i < doneCount;
              const active = i === doneCount;
              return (
                <li
                  key={step}
                  className="flex items-center gap-2.5"
                  style={{ fontSize: "13px" }}
                >
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: done ? "#10B981" : "#E2E8F0",
                      color: done ? "#fff" : "#64748B",
                      fontSize: "11px",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span
                    className={
                      done
                        ? "text-slate-900"
                        : active
                          ? "text-slate-900"
                          : "text-slate-400"
                    }
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>

          <p
            className="mt-10 text-center text-slate-500"
            style={{ fontSize: "11px" }}
          >
            🔒 모든 정보는 암호화되어 전송됩니다
          </p>
        </main>
      </div>
    </div>
  );
}