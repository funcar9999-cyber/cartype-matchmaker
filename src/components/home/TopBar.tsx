export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
      <div
        className="font-medium text-brand-primary"
        style={{ fontSize: "15px" }}
      >
        🚗 CarBTI
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="알림"
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md border border-border text-[12px]"
        >
          🔔
        </button>
        <button
          type="button"
          aria-label="프로필"
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md border border-border text-[12px]"
        >
          👤
        </button>
      </div>
    </header>
  );
}