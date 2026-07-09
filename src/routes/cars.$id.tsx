import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";

import { CAR_DB, CAR_LEGAL_DISCLAIMER, findCarByName } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { KAKAO_CHANNEL_URL, TIER_CARS } from "@/lib/mydata-tiers";

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
          <span className="w-7" />
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
                {matchingTypes.map((t) => (
                  <Link
                    key={t.code}
                    to="/result/$typeCode"
                    params={{ typeCode: t.code }}
                    className="rounded-full border border-brand-primary/40 bg-white px-2.5 py-1 text-brand-primary"
                    style={{ fontSize: "11px" }}
                  >
                    {t.code} · {t.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={() =>
              void navigate({ to: "/compare", search: { car: car.id } })
            }
            className="mt-4 w-full rounded-xl bg-brand-primary py-3 font-medium text-white"
            style={{ fontSize: "13px" }}
          >
            이 차, 3방식으로 비교하기
          </button>
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full rounded-xl border border-border bg-white py-3 text-center font-medium text-slate-900"
            style={{ fontSize: "13px" }}
          >
            상담사에게 물어보기
          </a>

          <p
            className="mt-4 px-1 text-slate-400"
            style={{ fontSize: "10px", lineHeight: 1.6 }}
          >
            {CAR_LEGAL_DISCLAIMER}
          </p>
        </main>
      </div>
    </div>
  );
}
