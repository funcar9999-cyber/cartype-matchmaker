export function LockedDivider() {
  return (
    <div className="relative my-5 border-t-2 border-dashed border-slate-300">
      <span
        className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-slate-500"
        style={{
          top: "-10px",
          fontSize: "10px",
          letterSpacing: "0.1em",
        }}
      >
        ━━━ 잠긴 정보 ━━━
      </span>
    </div>
  );
}