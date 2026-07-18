import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Heart, ChevronRight, MessageCircle } from "lucide-react";

import { BottomTabBar } from "@/components/home/BottomTabBar";
import { useMyCarbti } from "@/hooks/use-my-carbti";
import { CAR_DB } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { listMyFavorites } from "@/lib/carbti-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "내정보 · CarBTI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MePage,
});

function MePage() {
  const navigate = useNavigate();
  const { user, status, code, nickname } = useMyCarbti();
  const loading = status === "loading";
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    void listMyFavorites(user.id).then((rows) =>
      setFavIds(rows.map((r) => r.car_id as string)),
    );
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast("로그아웃 되었어요");
    void navigate({ to: "/" });
  };

  const cardStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--hairline)",
    boxShadow: "var(--shadow-card)",
  } as const;
  const sectionLabel = {
    fontSize: "10.5px",
    letterSpacing: "0.25em",
    color: "var(--warm-gray)",
    fontWeight: 700,
  } as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <header
          className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--hairline)", backgroundColor: "rgba(245,244,240,0.9)" }}
        >
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--ink)" }}>내정보</div>
        </header>

        <main className="flex-1 px-4 py-4">
          {loading ? null : !user ? (
            <section className="rounded-2xl p-6 text-center" style={cardStyle}>
              <div
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--midnight)" }}
              >
                <User size={24} color="var(--gold)" strokeWidth={1.75} />
              </div>
              <p className="mb-4" style={{ fontSize: "13px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
                로그인하고 내 카BTI와 찜 목록을 저장하세요
              </p>
              <Link
                to="/diagnosis/gate"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 transition active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--midnight)",
                  color: "var(--ivory)",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                <MessageCircle size={14} color="var(--gold)" strokeWidth={1.75} />
                카카오로 시작하기
              </Link>
            </section>
          ) : (
            <>
              <section
                className="mb-3 rounded-2xl p-5"
                style={{
                  backgroundColor: "var(--navy)",
                  color: "var(--ivory)",
                  boxShadow: "var(--shadow-dark)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.25em",
                    color: "var(--gold)",
                    fontWeight: 700,
                  }}
                >
                  안녕하세요
                </div>
                <div className="mt-1" style={{ fontSize: "18px", fontWeight: 800 }}>
                  {nickname ?? "카BTI 사용자"} 님
                </div>
              </section>

              {code && CARBTI_TYPES[code] && (
                <Link
                  to="/result/$typeCode"
                  params={{ typeCode: code }}
                  className="mb-3 block rounded-2xl p-4 transition active:scale-[0.99]"
                  style={cardStyle}
                >
                  <div style={sectionLabel}>내 카BTI</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      style={{
                        fontSize: "20px",
                        letterSpacing: "0.2em",
                        color: "var(--gold)",
                        fontWeight: 800,
                      }}
                    >
                      {code}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                      · {CARBTI_TYPES[code].name}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1" style={{ fontSize: "11px", color: "var(--warm-gray)" }}>
                    결과지 다시 보기 <ChevronRight size={12} color="var(--gold)" strokeWidth={2} />
                  </div>
                </Link>
              )}

              <section className="mb-3 rounded-2xl p-4" style={cardStyle}>
                <div className="mb-3 flex items-center gap-2" style={sectionLabel}>
                  <Heart size={12} color="var(--gold)" strokeWidth={2} />
                  찜한 차량
                </div>
                {favIds.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
                    아직 찜한 차량이 없어요
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {favIds.map((cid) => {
                      const c = CAR_DB.find((x) => x.id === cid);
                      if (!c) return null;
                      return (
                        <li key={cid}>
                          <Link
                            to="/cars/$id"
                            params={{ id: cid }}
                            className="flex items-center justify-between rounded-xl px-3 py-3 transition active:scale-[0.99]"
                            style={{
                              backgroundColor: "var(--ivory)",
                              border: "1px solid var(--hairline)",
                            }}
                          >
                            <div>
                              <div style={{ fontSize: "10px", color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
                                {c.brand}
                              </div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                                {c.name}
                              </div>
                            </div>
                            <ChevronRight size={16} color="var(--gold)" strokeWidth={2} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="mt-2 w-full rounded-xl py-3 transition active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  color: "var(--warm-gray)",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                로그아웃
              </button>
            </>
          )}
        </main>

        <BottomTabBar />
      </div>
    </div>
  );
}