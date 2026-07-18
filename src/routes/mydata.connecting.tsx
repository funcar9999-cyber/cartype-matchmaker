import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";

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
    <div className="min-h-screen" style={{ backgroundColor: "var(--midnight)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ background: "var(--gradient-hero)", color: "var(--ivory)" }}
      >
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div
            className="mb-6 inline-flex items-center rounded-full px-3 py-1"
            style={{
              fontSize: "10px",
              letterSpacing: "0.15em",
              color: "var(--gold)",
              fontWeight: 700,
              border: "1px solid var(--gold)",
            }}
          >
            DEMO SIMULATION
          </div>

          {/* 골드 링 스피너 */}
          <div
            className="mb-8 h-14 w-14 rounded-full"
            style={{
              border: "3px solid rgba(201,169,106,0.2)",
              borderTopColor: "var(--gold)",
              animation: "carbti-spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes carbti-spin { to { transform: rotate(360deg); } }`}</style>

          <div
            className="mb-6"
            style={{ fontSize: "10.5px", letterSpacing: "0.3em", color: "var(--gold)", fontWeight: 700 }}
          >
            C O N N E C T I N G
          </div>

          <ul className="w-full max-w-[300px] space-y-3">
            {STEPS.map((step, i) => {
              const done = i < doneCount;
              const active = i === doneCount;
              return (
                <li key={step} className="flex items-center gap-3" style={{ fontSize: "13px" }}>
                  <span
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: done ? "var(--gold)" : "transparent",
                      border: done ? "none" : "1px solid rgba(245,244,240,0.25)",
                      color: "var(--midnight)",
                    }}
                  >
                    {done && <Check size={13} strokeWidth={2.5} />}
                  </span>
                  <span
                    style={{
                      color: done || active ? "var(--ivory)" : "rgba(245,244,240,0.4)",
                      fontWeight: done || active ? 700 : 400,
                    }}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 flex items-center gap-2" style={{ fontSize: "11px", color: "rgba(245,244,240,0.6)" }}>
            <Lock size={12} color="var(--gold-soft)" strokeWidth={1.75} />
            모든 정보는 암호화되어 전송돼요
          </div>
        </main>
      </div>
    </div>
  );
}