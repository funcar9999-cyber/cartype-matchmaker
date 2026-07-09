import { forwardRef } from "react";
import { toast } from "sonner";

const BUTTONS = [
  {
    label: "💛 카카오톡",
    channel: "kakao",
    successMsg: "링크가 복사되었어요! 카카오톡에 붙여넣어 공유하세요",
  },
  {
    label: "📷 인스타",
    channel: "instagram",
    successMsg: "링크가 복사되었어요! 인스타에 붙여넣어 공유하세요",
  },
  {
    label: "🔗 링크",
    channel: "link",
    successMsg: "링크가 복사되었어요!",
  },
];

async function copyLink(): Promise<{ ok: boolean; url: string }> {
  const url = typeof window !== "undefined" ? window.location.href : "";
  try {
    await navigator.clipboard.writeText(url);
    return { ok: true, url };
  } catch {
    return { ok: false, url };
  }
}

export const ShareSection = forwardRef<HTMLElement>((_, ref) => {
  const handleShare = async (successMsg: string) => {
    const { ok, url } = await copyLink();
    if (ok) toast.success(successMsg);
    else toast(url || "URL을 복사할 수 없어요");
  };
  return (
    <section
      ref={ref}
      className="mb-4 rounded-2xl bg-slate-50 p-3"
    >
      <div className="mb-2 font-medium" style={{ fontSize: "12px" }}>
        🎉 친구들에게 자랑하기
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {BUTTONS.map((b) => (
          <button
            key={b.channel}
            type="button"
            onClick={() => {
              void handleShare(b.successMsg);
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 text-center"
            style={{ fontSize: "10px" }}
          >
            {b.label}
          </button>
        ))}
      </div>
    </section>
  );
});
ShareSection.displayName = "ShareSection";