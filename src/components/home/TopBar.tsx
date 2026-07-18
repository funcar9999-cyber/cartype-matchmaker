import { Bell, User } from "lucide-react";

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
      style={{
        borderColor: "var(--hairline)",
        backgroundColor: "rgba(245,244,240,0.9)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 800,
          letterSpacing: "0.02em",
          color: "var(--ink)",
        }}
      >
        CarBTI
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="알림"
          className="flex h-7 w-7 items-center justify-center rounded-md"
        >
          <Bell size={16} color="var(--ink)" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="프로필"
          className="flex h-7 w-7 items-center justify-center rounded-md"
        >
          <User size={16} color="var(--ink)" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}