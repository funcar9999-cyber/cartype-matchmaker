import { MessageCircle } from "lucide-react";

export function FloatingChatButton() {
  return (
    <button
      type="button"
      aria-label="상담"
      onClick={() => alert("상담 예약 페이지 준비 중")}
      className="absolute bottom-20 right-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95"
      style={{
        backgroundColor: "var(--midnight)",
        color: "var(--ivory)",
        boxShadow: "var(--shadow-dark)",
      }}
    >
      <MessageCircle size={20} strokeWidth={1.75} />
    </button>
  );
}
