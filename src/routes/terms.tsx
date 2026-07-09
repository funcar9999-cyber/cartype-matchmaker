import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "서비스 이용약관 · CarBTI" },
      { name: "description", content: "CarBTI 서비스 이용약관" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto min-h-screen max-w-[480px] bg-background">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="text-slate-600"
            style={{ fontSize: "18px" }}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="font-medium" style={{ fontSize: "14px" }}>
            서비스 이용약관
          </h1>
        </div>
        <div className="px-4 py-8 text-center text-slate-500" style={{ fontSize: "13px" }}>
          정식 문서 준비 중입니다
        </div>
      </div>
    </div>
  );
}