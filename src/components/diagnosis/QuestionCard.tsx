import type { Question, QuestionOption } from "@/lib/carbti-questions";

type Props = {
  question: Question;
  selectedMaps: string | null;
  onSelect: (option: QuestionOption) => void;
};

export function QuestionCard({ question, selectedMaps, onSelect }: Props) {
  return (
    <section className="pb-6">
      <p
        className="mb-2 font-medium text-brand-primary"
        style={{ fontSize: "11px", letterSpacing: "0.06em" }}
      >
        {question.label}
      </p>
      <h1
        className="mb-2 font-medium leading-snug text-foreground"
        style={{ fontSize: "20px" }}
      >
        {question.question}
      </h1>
      <p className="mb-5 text-slate-500" style={{ fontSize: "12px" }}>
        {question.subtitle}
      </p>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => {
          const selected = selectedMaps === opt.maps;
          return (
            <button
              key={opt.maps}
              type="button"
              onClick={() => onSelect(opt)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-brand-primary bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50"
                style={{ fontSize: "20px" }}
              >
                {opt.icon}
              </span>
              <span className="flex flex-col gap-0.5">
                <span
                  className="font-medium text-foreground"
                  style={{ fontSize: "14px" }}
                >
                  {opt.title}
                </span>
                <span className="text-slate-500" style={{ fontSize: "12px" }}>
                  {opt.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}