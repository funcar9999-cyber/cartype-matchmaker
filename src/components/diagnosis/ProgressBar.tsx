import { progressLabel } from "@/lib/carbti-questions";

type Props = { current: number; total: number };

export function ProgressBar({ current, total }: Props) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="pb-5">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--hairline)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--teal), var(--teal-deep))",
          }}
        />
      </div>
      <p className="mt-1 text-right" style={{ fontSize: "10px", color: "var(--warm-gray)" }}>
        {progressLabel(current)}
      </p>
    </div>
  );
}
