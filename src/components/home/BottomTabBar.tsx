type Tab = { icon: string; label: string; key: string };

const tabs: Tab[] = [
  { icon: "🏠", label: "홈", key: "home" },
  { icon: "🚙", label: "차량", key: "vehicles" },
  { icon: "💬", label: "상담", key: "chat" },
  { icon: "👤", label: "내정보", key: "me" },
];

export function BottomTabBar() {
  const active = "home";
  return (
    <nav className="sticky bottom-0 z-40 flex border-t border-border bg-background">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${
              isActive
                ? "font-medium text-brand-primary"
                : "font-normal text-muted-foreground"
            }`}
          >
            <span style={{ fontSize: "14px" }}>{t.icon}</span>
            <span style={{ fontSize: "10px" }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}