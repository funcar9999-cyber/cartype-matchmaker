import { milestoneMessage } from "@/lib/carbti-questions";

export function MilestoneBanner({ current }: { current: number }) {
  const msg = milestoneMessage(current);
  if (!msg) return null;
  return (
    <div
      className="mb-5 rounded-lg bg-blue-50 p-2 text-center font-medium text-brand-primary"
      style={{ fontSize: "11px" }}
    >
      {msg}
    </div>
  );
}