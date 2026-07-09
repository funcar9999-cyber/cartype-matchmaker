import { useNavigate } from "@tanstack/react-router";

type Item = {
  icon: string;
  title: string;
  desc: string;
  route: "/cars" | "/compare";
};

const items: Item[] = [
  { icon: "🔍", title: "차량 둘러보기", desc: "시세 · 옵션 · 비교", route: "/cars" },
  { icon: "💰", title: "3방식 비교", desc: "할부 · 리스 · 렌트", route: "/compare" },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <section className="mb-3">
      <h2 className="pl-1 font-medium" style={{ fontSize: "13px" }}>
        이미 사고 싶은 차가 있으신가요?
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <button
            key={it.route}
            type="button"
            onClick={() => void navigate({ to: it.route })}
            className="rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[14px]">
              {it.icon}
            </div>
            <div className="font-medium" style={{ fontSize: "12px" }}>
              {it.title}
            </div>
            <div className="text-muted-foreground" style={{ fontSize: "10px" }}>
              {it.desc}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}