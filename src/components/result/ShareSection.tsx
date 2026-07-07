import { forwardRef } from "react";

const BUTTONS = [
  { label: "💛 카카오톡", channel: "kakao" },
  { label: "📷 인스타", channel: "instagram" },
  { label: "🔗 링크", channel: "link" },
];

export const ShareSection = forwardRef<HTMLElement>((_, ref) => {
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
            onClick={() => console.log(`share:${b.channel}`)}
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