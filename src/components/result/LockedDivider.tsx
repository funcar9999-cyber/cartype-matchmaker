export function LockedDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="flex-1 border-t" style={{ borderColor: "var(--hairline)" }} />
      <span
        style={{
          fontSize: "10px",
          letterSpacing: "0.25em",
          color: "var(--warm-gray)",
          fontWeight: 700,
        }}
      >
        LOCKED
      </span>
      <div className="flex-1 border-t" style={{ borderColor: "var(--hairline)" }} />
    </div>
  );
}
