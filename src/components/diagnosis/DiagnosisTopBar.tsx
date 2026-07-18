import { X } from "lucide-react";

type Props = { current: number; total: number; onClose: () => void };

export function DiagnosisTopBar({ current, total, onClose }: Props) {
  return (
    <div className="flex items-center justify-between p-1 pb-4">
      <button
        type="button"
        aria-label="진단 나가기"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center"
        style={{ color: "var(--ink)" }}
      >
        <X size={18} strokeWidth={1.75} />
      </button>
      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--warm-gray)", letterSpacing: "0.1em" }}>
        {current} / {total}
      </span>
    </div>
  );
}
