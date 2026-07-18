import { milestoneMessage } from "@/lib/carbti-questions";

export function MilestoneBanner({ current }: { current: number }) {
  const msg = milestoneMessage(current);
  if (!msg) return null;
  return (
    <div
      className="mb-5 rounded-xl border p-2.5 text-center"
      style={{
        fontSize: "11px",
        color: "var(--gold)",
        borderColor: "rgba(201,169,106,0.4)",
        backgroundColor: "rgba(201,169,106,0.06)",
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      {msg}
    </div>
  );
}
