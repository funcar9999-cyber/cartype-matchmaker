import { ArrowLeft, Share2 } from "lucide-react";

type Props = { onShareClick: () => void };

export function ResultTopBar({ onShareClick }: Props) {
  return (
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
      <button
        type="button"
        onClick={onShareClick}
        className="flex items-center gap-1.5"
        style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)" }}
      >
        공유 <Share2 size={13} color="var(--gold)" strokeWidth={2} />
      </button>
    </header>
  );
}
