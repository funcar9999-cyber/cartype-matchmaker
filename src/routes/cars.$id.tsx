import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Check } from "lucide-react";

import { CAR_DB, CAR_LEGAL_DISCLAIMER, findCarByName } from "@/lib/car-db";
import { CARBTI_TYPES } from "@/lib/carbti-types";
import { TIER_CARS } from "@/lib/mydata-tiers";
import { QuoteRequestSheet } from "@/components/consult/QuoteRequestSheet";
import { useMyCarbti } from "@/hooks/use-my-carbti";
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
    <div
      className="flex min-h-screen items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--ivory)", color: "var(--ink)" }}
    >
      <div>
        <h1 style={{ fontSize: "16px", fontWeight: 700 }}>차량을 찾을 수 없습니다</h1>
        <p className="mt-2" style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
          목록에서 다시 선택해 주세요.
        </p>
        <Link to="/cars" className="mt-4 inline-block" style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700 }}>
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
  const { user, code: myTypeCode } = useMyCarbti();
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

  const sectionLabel = {
    fontSize: "10.5px",
    letterSpacing: "0.25em",
    color: "var(--warm-gray)",
    fontWeight: 700,
  } as const;
  const cardStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--hairline)",
    boxShadow: "var(--shadow-card)",
  } as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)" }}>
      <div
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col"
        style={{ backgroundColor: "var(--ivory)" }}
      >
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
          style={{ borderColor: "var(--hairline)", backgroundColor: "rgba(245,244,240,0.9)" }}
        >
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => window.history.back()}
            className="flex h-7 w-7 items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <ArrowLeft size={18} strokeWidth={1.75} />
          </button>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>차량 상세</div>
          <button
            type="button"
            onClick={() => void handleFavClick()}
            aria-label={fav ? "찜 해제" : "찜하기"}
            className="flex h-7 w-7 items-center justify-center"
          >
            <Heart
              size={18}
              strokeWidth={1.75}
              color={fav ? "var(--copper)" : "var(--ink)"}
              fill={fav ? "var(--copper)" : "none"}
            />
          </button>
        </header>

        <main className="flex-1 px-4 py-4">
          {/* 히어로 — 다크 네이비 쇼룸 */}
          <div
            className="flex h-44 flex-col items-center justify-center rounded-2xl px-6 text-center"
            style={{
              backgroundColor: "var(--navy)",
              color: "var(--ivory)",
              boxShadow: "var(--shadow-dark)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.3em",
                color: "var(--gold-soft)",
                fontWeight: 700,
                textTransform: "lowercase",
              }}
            >
              {car.brand}
            </div>
            <div
              className="mt-2"
              style={{
                fontSize: "clamp(26px, 8vw, 34px)",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {car.name.replace(car.brand, "").trim() || car.name}
            </div>
            <div className="mt-3 flex gap-1.5">
              <span
                className="rounded-full px-2 py-0.5"
                style={{ fontSize: "10px", backgroundColor: "rgba(245,244,240,0.12)", color: "var(--ivory)" }}
              >
                {car.segment}
              </span>
              <span
                className="rounded-full px-2 py-0.5"
                style={{ fontSize: "10px", backgroundColor: "rgba(245,244,240,0.12)", color: "var(--ivory)" }}
              >
                {car.powertrain}
              </span>
            </div>
          </div>

          {/* 주 CTA */}
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="mt-3 w-full rounded-xl py-3.5 transition active:scale-[0.98]"
            style={{
              backgroundColor: "var(--midnight)",
              color: "var(--ivory)",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "var(--shadow-dark)",
            }}
          >
            이 차로 견적 받기
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/compare", search: { car: car.id } })}
            className="mt-2 w-full rounded-xl py-3 text-center transition active:scale-[0.98]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--hairline)",
              color: "var(--ink)",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            방식별 자세히 비교 →
          </button>

          {/* 가격대 */}
          <section className="mt-4 rounded-2xl p-5" style={cardStyle}>
            <div className="mb-1" style={sectionLabel}>가격대</div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {car.priceRange}
            </div>
            <p className="mt-1" style={{ fontSize: "10px", lineHeight: 1.5, color: "var(--warm-gray)" }}>
              예시 가격 · 트림별 상이 · 공식 가격표 기준 업데이트 예정
            </p>
          </section>

          {/* highlights */}
          <section className="mt-3 rounded-2xl p-5" style={cardStyle}>
            <div className="mb-2" style={sectionLabel}>한눈에 보기</div>
            <ul>
              {car.highlights.map((h: string) => (
                <li key={h} className="flex items-start gap-2 py-1.5">
                  <Check size={14} color="var(--teal)" strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
                  <span style={{ fontSize: "12.5px", color: "var(--ink)", lineHeight: 1.5 }}>{h}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 방식별 월납입 */}
          <section className="mt-3 rounded-2xl p-5" style={cardStyle}>
            <div className="mb-3" style={sectionLabel}>이 차, 방식별 월납입</div>
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
                    className="relative rounded-xl p-3 text-center"
                    style={{
                      backgroundColor: isBest ? "var(--navy)" : "var(--ivory)",
                      border: `1px solid ${isBest ? "var(--navy)" : "var(--hairline)"}`,
                      color: isBest ? "var(--ivory)" : "var(--ink)",
                      minHeight: 84,
                    }}
                  >
                    {isBest && (
                      <span
                        className="absolute -top-2 left-1/2 inline-block -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5"
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          backgroundColor: "var(--gold)",
                          color: "var(--midnight)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        내 유형 최적
                      </span>
                    )}
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.15em",
                        color: isBest ? "var(--gold-soft)" : "var(--warm-gray)",
                        fontWeight: 700,
                      }}
                    >
                      {col.label}
                    </div>
                    <div
                      className="mt-1.5"
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {col.value}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3" style={{ fontSize: "10px", lineHeight: 1.5, color: "var(--warm-gray)" }}>
              통상 조건 기준 예시예요. 내 조건 기준 실제 견적은 위에서 받아보세요.
            </p>
          </section>

          {/* 어울리는 유형 */}
          {matchingTypes.length > 0 && (
            <section className="mt-3 rounded-2xl p-5" style={cardStyle}>
              <div className="mb-3" style={sectionLabel}>이 차와 어울리는 카BTI 유형</div>
              <div className="flex flex-wrap gap-1.5">
                {matchingTypes.map((t) => {
                  const isMine = t.code === myTypeCode;
                  const acc = t.code[2] === "E" ? "var(--teal)" : "var(--copper)";
                  return (
                    <Link
                      key={t.code}
                      to="/result/$typeCode"
                      params={{ typeCode: t.code }}
                      className="rounded-full px-2.5 py-1 transition active:scale-[0.98]"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "var(--surface)",
                        border: `1.5px solid ${isMine ? "var(--gold)" : acc}`,
                        color: isMine ? "var(--gold)" : acc,
                      }}
                    >
                      {t.code} · {t.name}
                      {isMine && <span className="ml-1">✓</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <p className="mt-4 px-1" style={{ fontSize: "10px", lineHeight: 1.6, color: "var(--warm-gray)" }}>
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
