import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CAR_DB, CAR_LEGAL_DISCLAIMER, findCarByName } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";
import { useSession } from "@/hooks/use-session";
import { isFavorite, toggleFavorite } from "@/lib/carbti-data";
import { toast } from "sonner";

export const Route = createFileRoute("/cars/$id")({
  head: ({ params }) => {
    const car = CAR_DB.find((c) => c.id === params.id);
    const title = car ? `${car.brand} ${car.name} · CarBTI` : "차량 상세 · CarBTI";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: car ? `${car.name} 예시 가격·3방식 비교를 한 번에 확인하세요.` : "차량 상세",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const car = CAR_DB.find((c) => c.id === params.id);
    if (!car) throw notFound();
    return { car };
  },
  component: CarDetail,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-lg font-medium">차량을 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">목록에서 다시 선택해 주세요.</p>
        <Link to="/cars" className="mt-4 inline-block text-brand-primary" style={{ fontSize: "12px" }}>
          차량 목록으로 →
        </Link>
      </div>
    </div>
  ),
});

function CarDetail() {
  const { car } = Route.useLoaderData();
  const navigate = useNavigate();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [myTypeCode, setMyTypeCode] = useState<string | null>(null);
  const { user } = useSession();
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!user) {
      setFav(false);
      return;
    }
    void isFavorite(user.id, car.id).then(setFav);
  }, [user, car.id]);

  const handleFavClick = async () => {
    if (!user) {
      toast("카카오 로그인하면 찜 목록이 저장돼요");
      void navigate({ to: "/diagnosis/gate" });
      return;
    }
    const next = !fav;
    setFav(next);
    await toggleFavorite(user.id, car.id, next);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("carbti:diagnosis:code");
    if (stored && CARBTI_TYPES[stored]) setMyTypeCode(stored);
  }, []);

  // 이 차와 어울리는 CarBTI 유형 역참조
  const matchingTypes = Object.values(CARBTI_TYPES).filter((t) => {
    const inTop = t.topCars.some((n) => findCarByName(n)?.id === car.id);
    const tiers = TIER_CARS[t.code];
    const inTier = tiers
      ? [tiers.stable.car, tiers.standard.car, tiers.dream.car].some(
          (n) => findCarByName(n)?.id === car.id,
        )
      : false;
    return inTop || inTier;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-background">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
            className="flex h-7 w-7 items-center justify-center text-foreground"
            style={{ fontSize: "16px" }}
          >
            ←
          </button>
          <div className="font-medium" style={{ fontSize: "13px" }}>
            차량 상세
          </div>
          <button
            type="button"
            onClick={() => void handleFavClick()}
            aria-label={fav ? "찜 해제" : "찜하기"}
            className="flex h-7 w-7 items-center justify-center"
            style={{ fontSize: "16px" }}
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 히어로 썸네일 */}
          <div
            className={`flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br ${car.gradient}`}
          >
            <span style={{ fontSize: "72px" }}>{car.emoji}</span>
          </div>

          <div className="mt-3">
            <div className="text-slate-500" style={{ fontSize: "11px" }}>
              {car.brand}
            </div>
            <h1 className="mt-0.5 font-medium" style={{ fontSize: "18px" }}>
              {car.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span
                className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700"
                style={{ fontSize: "10px" }}
              >
                {car.segment}
              </span>
              <span
                className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700"
                style={{ fontSize: "10px" }}
              >
                {car.powertrain}
              </span>
            </div>
          </div>

          {/* 가격대 */}
          <section className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-1 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              가격대
            </div>
            <div className="font-medium text-slate-900" style={{ fontSize: "16px" }}>
              {car.priceRange}
            </div>
            <p className="mt-1 text-slate-400" style={{ fontSize: "10px", lineHeight: 1.5 }}>
              예시 가격 · 트림별 상이 · 공식 가격표 기준 업데이트 예정
            </p>
          </section>

          {/* highlights */}
          <section className="mt-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              한눈에 보기
            </div>
            <ul>
              {car.highlights.map((h: string) => (
                <li key={h} className="flex items-start gap-2 py-1.5">
                  <span className="flex-shrink-0" style={{ fontSize: "12px", color: "#10B981" }}>
                    ✓
                  </span>
                  <span className="text-slate-900" style={{ fontSize: "12px" }}>
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 방식별 월납입 */}
          <section className="mt-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              이 차, 방식별 월납입
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "installment" as const, label: "할부", value: car.monthlyDemo.installment },
                { key: "lease" as const, label: "리스", value: car.monthlyDemo.lease },
                { key: "rent" as const, label: "장기렌트", value: car.monthlyDemo.rent },
              ].map((col) => {
                const myType = myTypeCode ? CARBTI_TYPES[myTypeCode] : null;
                const best = myType?.bestPayment.method;
                const bestKey =
                  best === "리스"
                    ? "lease"
                    : best === "장기렌트"
                      ? "rent"
                      : best === "할부" || best === "현금+할부"
                        ? "installment"
                        : null;
                const isBest = bestKey === col.key;
                return (
                  <div
                    key={col.key}
                    className={`rounded-xl border bg-white p-3 text-center ${
                      isBest ? "border-brand-primary" : "border-slate-200"
                    }`}
                  >
                    {isBest && (
                      <span
                        className="mb-1 inline-block rounded bg-brand-primary px-1.5 py-0.5 text-white"
                        style={{ fontSize: "9px" }}
                      >
                        내 유형 최적
                      </span>
                    )}
                    <div
                      className="text-slate-500"
                      style={{ fontSize: "10px" }}
                    >
                      {col.label}
                    </div>
                    <div
                      className="mt-0.5 font-medium text-slate-900"
                      style={{ fontSize: "12px" }}
                    >
                      {col.value}
                    </div>
                  </div>
                );
              })}
            </div>
            <p
              className="mt-2 text-slate-400"
              style={{ fontSize: "10px", lineHeight: 1.5 }}
            >
              통상 조건 기준 예시예요. 내 조건 기준 실제 견적은 아래에서 받아보세요.
            </p>
          </section>

          {/* 어울리는 유형 */}
          {matchingTypes.length > 0 && (
            <section className="mt-3 rounded-2xl bg-slate-50 p-4">
              <div
                className="mb-2 uppercase text-slate-500"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                이 차와 어울리는 카BTI 유형
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchingTypes.map((t) => {
                  const isMine = t.code === myTypeCode;
                  return (
                    <Link
                      key={t.code}
                      to="/result/$typeCode"
                      params={{ typeCode: t.code }}
                      className={`rounded-full border px-2.5 py-1 ${
                        isMine
                          ? "border-brand-primary bg-brand-primary text-white"
                          : "border-brand-primary/40 bg-white text-brand-primary"
                      }`}
                      style={{ fontSize: "11px" }}
                    >
                      {t.code} · {t.name}
                      {isMine && (
                        <span className="ml-1" style={{ fontSize: "10px" }}>
                          · 내 유형 ✓
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 주 CTA */}
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="mt-4 w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
            style={{ fontSize: "13px" }}
          >
            이 차로 견적 받기
          </button>

          {/* 보조 CTA */}
          <button
            type="button"
            onClick={() =>
              void navigate({ to: "/compare", search: { car: car.id } })
            }
            className="mt-2 w-full rounded-xl border border-border bg-white py-3 text-center font-medium text-slate-900"
            style={{ fontSize: "13px" }}
          >
            방식별 자세히 비교 →
          </button>

          <p
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {CAR_LEGAL_DISCLAIMER}
          </p>
        </main>
        <QuoteRequestSheet
          open={quoteOpen}
          onOpenChange={setQuoteOpen}
          context={{ defaultCarName: `${car.brand} ${car.name}`, source: "car_detail" }}
        />
      </div>
    </div>
  );
}
