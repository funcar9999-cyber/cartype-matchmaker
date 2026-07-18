import { Check, Building2, Route, Sparkles, Target, Zap, Fuel, RefreshCw, Home } from "lucide-react";
import type { Question, QuestionOption } from "@/lib/carbti-questions";

type Props = {
  question: Question;
  selectedMaps: string | null;
  onSelect: (option: QuestionOption) => void;
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  "🏙️": Building2,
  "🛣️": Route,
  "🏞️": Route,
  "✨": Sparkles,
  "🎯": Target,
  "🔋": Zap,
  "⛽": Fuel,
  "🔄": RefreshCw,
  "🏠": Home,
};

function IconFor({ emoji }: { emoji: string }) {
  const I = ICON_MAP[emoji] ?? Sparkles;
  return <I size={22} color="var(--teal)" strokeWidth={1.75} />;
}

export function QuestionCard({ question, selectedMaps, onSelect }: Props) {
  return (
    <section className="pb-6">
      <p
        className="mb-3"
        style={{
          fontSize: "10.5px",
          letterSpacing: "0.25em",
          color: "var(--warm-gray)",
          fontWeight: 700,
        }}
      >
        {question.label.toUpperCase()}
      </p>
      <h1
        className="mb-2 leading-[1.3]"
        style={{ fontSize: "22px", fontWeight: 700, color: "var(--ink)" }}
      >
        {question.question}
      </h1>
      <p className="mb-5" style={{ fontSize: "12px", color: "var(--warm-gray)" }}>
        {question.subtitle}
      </p>
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const selected = selectedMaps === opt.maps;
          return (
            <button
              key={opt.maps}
              type="button"
              onClick={() => onSelect(opt)}
              className="flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.98]"
              style={{
                borderColor: selected ? "var(--teal)" : "var(--hairline)",
                borderWidth: selected ? 2 : 1,
                backgroundColor: selected ? "rgba(30,127,116,0.06)" : "var(--surface)",
                boxShadow: selected ? "none" : "var(--shadow-card)",
              }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--ivory)" }}
              >
                <IconFor emoji={opt.icon} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                  {opt.title}
                </span>
                <span style={{ fontSize: "12px", color: "var(--warm-gray)", lineHeight: 1.5 }}>
                  {opt.desc}
                </span>
              </span>
              {selected && (
                <Check size={18} color="var(--teal)" strokeWidth={2.5} className="mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
