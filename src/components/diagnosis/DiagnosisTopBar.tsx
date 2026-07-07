type Props = { current: number; total: number; onClose: () => void };

export function DiagnosisTopBar({ current, total, onClose }: Props) {
  return (
    <div className="flex items-center justify-between p-1 pb-4">
      <button
        type="button"
        aria-label="진단 나가기"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center text-slate-500"
        style={{ fontSize: "18px" }}
      >
        ✕
      </button>
      <span
        className="font-medium text-slate-700"
        style={{ fontSize: "12px" }}
      >
        {current} / {total}
      </span>
    </div>
  );
}