type Props = { onShareClick: () => void };

export function ResultTopBar({ onShareClick }: Props) {
  return (
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
      <button
        type="button"
        onClick={onShareClick}
        className="font-medium text-brand-primary"
        style={{ fontSize: "12px" }}
      >
        공유 ↗
      </button>
    </header>
  );
}