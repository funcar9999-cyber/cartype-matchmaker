import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BottomTabBar } from "@/components/home/BottomTabBar";
import { useSession } from "@/hooks/use-session";
import { CAR_DB } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import {
  getMyLatestDiagnosis,
  listMyFavorites,
} from "@/lib/carbti-data";
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
  const { user, loading } = useSession();
  const [nickname, setNickname] = useState<string | null>(null);
  const [diag, setDiag] = useState<{ id: string; code: string } | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("kakao_nickname")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setNickname((data?.kakao_nickname as string) ?? null));
    void getMyLatestDiagnosis(user.id).then((d) => {
      if (d) setDiag({ id: d.id as string, code: d.code as string });
    });
    void listMyFavorites(user.id).then((rows) =>
      setFavIds(rows.map((r) => r.car_id as string)),
    );
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast("로그아웃 되었어요");
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
          <div className="font-medium" style={{ fontSize: "14px" }}>
            내정보
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          {loading ? null : !user ? (
            <section className="rounded-2xl bg-slate-50 p-6 text-center">
              <div className="mb-3" style={{ fontSize: "36px" }}>👤</div>
              <p className="mb-4 text-slate-600" style={{ fontSize: "13px" }}>
                로그인하고 내 카BTI와 찜 목록을 저장하세요
              </p>
              <Link
                to="/diagnosis/gate"
                className="inline-block w-full rounded-xl py-3 font-medium"
                style={{ backgroundColor: "#FEE500", color: "#191600", fontSize: "13px" }}
              >
                💬 카카오로 시작하기
              </Link>
            </section>
          ) : (
            <>
              <section className="mb-3 rounded-2xl bg-slate-50 p-4">
                <div className="text-slate-500" style={{ fontSize: "10px" }}>
                  안녕하세요
                </div>
                <div className="mt-0.5 font-medium text-slate-900" style={{ fontSize: "16px" }}>
                  {nickname ?? "카BTI 사용자"} 님
                </div>
              </section>

              {diag && CARBTI_TYPES[diag.code] && (
                <Link
                  to="/result/$typeCode"
                  params={{ typeCode: diag.code }}
                  className="mb-3 block rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="text-slate-500" style={{ fontSize: "10px" }}>
                    내 카BTI
                  </div>
                  <div className="mt-1 font-medium" style={{ fontSize: "16px" }}>
                    <span className="text-brand-primary">{diag.code}</span>
                    <span className="text-slate-900"> · {CARBTI_TYPES[diag.code].name}</span>
                  </div>
                  <div className="mt-1 text-slate-500" style={{ fontSize: "11px" }}>
                    결과지 다시 보기 →
                  </div>
                </Link>
              )}

              <section className="mb-3 rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 text-slate-500" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
                  ❤️ 찜한 차량
                </div>
                {favIds.length === 0 ? (
                  <p className="text-slate-500" style={{ fontSize: "12px" }}>
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
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                          >
                            <div>
                              <div className="text-slate-500" style={{ fontSize: "10px" }}>
                                {c.brand}
                              </div>
                              <div className="font-medium text-slate-900" style={{ fontSize: "13px" }}>
                                {c.name}
                              </div>
                            </div>
                            <span style={{ fontSize: "14px" }}>→</span>
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white py-3 text-slate-600"
                style={{ fontSize: "12px" }}
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