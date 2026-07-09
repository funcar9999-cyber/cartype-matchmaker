import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "회사 소개 · CarBTI" },
      {
        name: "description",
        content:
          "내 신용과 취향에 맞춰 가장 유리한 자동차 구매 방법을 찾는 CarBTI. 등록 사업자·상담팀·금융사 제휴 네트워크.",
      },
      { property: "og:title", content: "회사 소개 · CarBTI" },
      {
        property: "og:description",
        content:
          "내 신용과 취향에 맞춰 가장 유리한 방법으로 차를 사도록 돕습니다.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
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
            회사 소개
          </div>
          <span className="w-7" />
        </header>

        <main className="flex-1 px-4 py-5">
          <h1 className="font-medium" style={{ fontSize: "20px", lineHeight: 1.4 }}>
            CarBTI를 만드는 사람들
          </h1>

          <section className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              미션
            </div>
            <p
              className="text-slate-900"
              style={{ fontSize: "14px", lineHeight: 1.6 }}
            >
              내 신용과 취향에 맞춰, 가장 유리한 방법으로 차를 사도록 돕습니다.
            </p>
          </section>

          <section className="mt-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              신뢰의 근거
            </div>
            <ul>
              {[
                "금융상품판매대리·중개업 등록 사업자",
                "월 수십 건의 렌트·리스 계약을 처리해온 상담팀",
                "다수 금융사와의 제휴 네트워크",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 py-1.5">
                  <span
                    className="flex-shrink-0"
                    style={{ fontSize: "12px", color: "#10B981" }}
                  >
                    ✓
                  </span>
                  <span className="text-slate-900" style={{ fontSize: "12px" }}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              수수료 구조
            </div>
            <p
              className="text-slate-900"
              style={{ fontSize: "12px", lineHeight: 1.6 }}
            >
              상담·견적 확인은 소비자에게 완전 무료입니다. 계약이 성사되면
              금융사(캐피탈·리스사·렌트사)가 저희에게 수수료를 지급하며, 이
              금액은 소비자의 월 납입금이나 초기 비용에 추가되지 않습니다.
            </p>
          </section>

          <section className="mt-3 rounded-2xl bg-slate-50 p-4">
            <div
              className="mb-2 uppercase text-slate-500"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              사업자 정보
            </div>
            {/* TODO: 정식 표기 예정 — 상호·등록번호·주소·연락처 확정 후 업데이트 */}
            <dl
              className="space-y-1.5 text-slate-500"
              style={{ fontSize: "11px" }}
            >
              <div className="flex gap-3">
                <dt className="w-16">상호</dt>
                <dd>정식 표기 예정</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16">등록번호</dt>
                <dd>정식 표기 예정</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16">주소</dt>
                <dd>정식 표기 예정</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16">연락처</dt>
                <dd>정식 표기 예정</dd>
              </div>
            </dl>
          </section>

          <Link
            to="/"
            className="mt-5 block text-center text-brand-primary"
            style={{ fontSize: "12px" }}
          >
            홈으로 →
          </Link>
        </main>
      </div>
    </div>
  );
}