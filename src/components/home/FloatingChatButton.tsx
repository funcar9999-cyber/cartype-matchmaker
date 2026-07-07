export function FloatingChatButton() {
  return (
    <button
      type="button"
      aria-label="상담"
      onClick={() => alert("상담 예약 페이지 준비 중")}
      className="absolute bottom-20 right-4 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: "var(--brand-amber)", fontSize: "20px" }}
    >
      💬
    </button>
  );
}