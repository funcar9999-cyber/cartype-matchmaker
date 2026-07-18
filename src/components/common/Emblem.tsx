import { Zap, Cog, Building2, Route } from "lucide-react";

type Props = {
  code: string;
  size?: number;
  blurred?: boolean;
};

/**
 * CarBTI Crest Emblem · v1.2
 * Double gold ring · dark center · powertrain icon · "CARBTI" microtext.
 * Center color = type accent (E=teal, G=copper). Secondary chip = C/W.
 */
export function Emblem({ code, size = 96, blurred = false }: Props) {
  const powertrain = code[2] ?? "E"; // 3rd char: E/G
  const purpose = code[0] ?? "C";    // 1st char: C/W
  const centerColor = powertrain === "E" ? "var(--teal)" : "var(--copper)";
  const centerDeep = powertrain === "E" ? "var(--teal-deep)" : "var(--copper-deep)";
  const PowerIcon = powertrain === "E" ? Zap : Cog;
  const PurposeIcon = purpose === "C" ? Building2 : Route;

  const s = size;
  const cx = s / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        width: s,
        height: s,
        filter: blurred ? "blur(10px)" : undefined,
      }}
      aria-hidden
    >
      <svg width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <radialGradient id={`emb-center-${code}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={centerColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={centerDeep} stopOpacity="1" />
          </radialGradient>
        </defs>
        {/* outer ring */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
        {/* inner ring */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gold-soft)" strokeWidth="0.6" />
        {/* dark center */}
        <circle cx="50" cy="50" r="38" fill="var(--midnight)" />
        {/* accent center dome */}
        <circle cx="50" cy="50" r="30" fill={`url(#emb-center-${code})`} opacity="0.85" />
        {/* microtext arc "CARBTI" */}
        <path id={`arc-${code}`} d="M 15,50 A 35,35 0 1 1 85,50" fill="none" />
        <text fill="var(--gold)" fontSize="4.4" letterSpacing="3">
          <textPath href={`#arc-${code}`} startOffset="14%">C A R B T I</textPath>
        </text>
      </svg>
      {/* powertrain icon center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PowerIcon size={s * 0.28} color="var(--gold-soft)" strokeWidth={2} />
      </div>
      {/* purpose chip bottom */}
      <div
        className="absolute"
        style={{ bottom: s * 0.08, left: cx - s * 0.09 }}
      >
        <PurposeIcon size={s * 0.14} color="var(--gold)" strokeWidth={2} />
      </div>
    </div>
  );
}