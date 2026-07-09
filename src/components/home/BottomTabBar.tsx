import { Link, useRouterState } from "@tanstack/react-router";

type Tab = { icon: string; label: string; to: "/" | "/cars" | "/consult" | "/me"; disabled?: boolean };

const tabs: Tab[] = [
  { icon: "🏠", label: "홈",     to: "/" },
  { icon: "🚙", label: "차량",   to: "/cars" },
  { icon: "💬", label: "상담",   to: "/consult" },
  { icon: "👤", label: "내정보", to: "/me", disabled: true },
];

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-40 flex border-t border-border bg-background">
      {tabs.map((t) => {
        const isActive =
          t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
        const cls = `flex flex-1 flex-col items-center gap-0.5 py-2 ${
          isActive ? "font-medium text-brand-primary" : "font-normal text-muted-foreground"
        } ${t.disabled ? "opacity-50" : ""}`;
        if (t.disabled) {
          return (
            <button key={t.to} type="button" disabled className={cls}>
              <span style={{ fontSize: "14px" }}>{t.icon}</span>
              <span style={{ fontSize: "10px" }}>{t.label}</span>
            </button>
          );
        }
        return (
          <Link key={t.to} to={t.to} className={cls}>
            <span style={{ fontSize: "14px" }}>{t.icon}</span>
            <span style={{ fontSize: "10px" }}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}