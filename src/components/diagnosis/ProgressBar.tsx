import { progressLabel } from "@/lib/carbti-questions";

type Props = { current: number; total: number };

export function ProgressBar({ current, total }: Props) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="pb-5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #0F7FFF, #6B47FF)",
          }}
        />
      </div>
      <p
        className="mt-1 text-right text-slate-400"
        style={{ fontSize: "10px" }}
      >
        {progressLabel(current)}
      </p>
    </div>
  );
}