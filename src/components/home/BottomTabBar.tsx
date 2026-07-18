import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Car, MessageCircle, User, type LucideIcon } from "lucide-react";

type Tab = { Icon: LucideIcon; label: string; to: "/" | "/cars" | "/consult" | "/me" };

const tabs: Tab[] = [
  { Icon: Home,          label: "홈",     to: "/" },
  { Icon: Car,           label: "차량",   to: "/cars" },
  { Icon: MessageCircle, label: "상담",   to: "/consult" },
  { Icon: User,          label: "내정보", to: "/me" },
];

export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="sticky bottom-0 z-40 flex border-t"
      style={{ borderColor: "var(--hairline)", backgroundColor: "var(--surface)" }}
    >
      {tabs.map(({ Icon, label, to }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        const color = active ? "var(--ink)" : "var(--warm-gray)";
        return (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-1 py-2.5"
            style={{ color }}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.5} />
            <span style={{ fontSize: "10px", fontWeight: active ? 700 : 400 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
