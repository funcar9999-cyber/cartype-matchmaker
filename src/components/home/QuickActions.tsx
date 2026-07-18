import { useNavigate } from "@tanstack/react-router";
import { Search, Scale, type LucideIcon } from "lucide-react";

type Item = {
  Icon: LucideIcon;
  title: string;
  desc: string;
  route: "/cars" | "/compare";
};

const items: Item[] = [
  { Icon: Search, title: "차량 둘러보기", desc: "시세 · 옵션 · 비교", route: "/cars" },
  { Icon: Scale, title: "3방식 비교", desc: "할부 · 리스 · 렌트", route: "/compare" },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <section className="mb-4">
      <h2
        className="pl-1"
        style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}
      >
        이미 사고 싶은 차가 있으신가요?
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map(({ Icon, title, desc, route }) => (
          <button
            key={route}
            type="button"
            onClick={() => void navigate({ to: route })}
            className="rounded-2xl border p-4 text-left transition active:scale-[0.98]"
            style={{
              borderColor: "var(--hairline)",
              backgroundColor: "var(--surface)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Icon size={20} color="var(--teal)" strokeWidth={1.75} />
            <div className="mt-2" style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
              {title}
            </div>
            <div className="mt-0.5" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
              {desc}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}