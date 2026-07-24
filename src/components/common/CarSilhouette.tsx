import type { CSSProperties } from "react";

import type { Segment } from "@/lib/car-db";

export type SilhouetteType = "city" | "sedan" | "suv" | "mpv" | "pickup";

export function segmentToSilhouette(segment: Segment | string | undefined): SilhouetteType {
  switch (segment) {
    case "경형":
    case "소형":
      return "city";
    case "SUV":
      return "suv";
    case "MPV":
      return "mpv";
    case "준중형":
    case "중형":
    case "준대형":
    case "대형":
      return "sedan";
    default:
      return "sedan";
  }
}

type Def = {
  body: string;
  glass: string;
  wheels: [number, number]; // cx1, cx2
  wheelR: number;
  shadowRx: number;
};

const DEFS: Record<SilhouetteType, Def> = {
  city: {
    body:
      "M52 112 L52 96 Q53 82 68 78 L86 74 Q98 50 126 46 L182 46 Q212 48 226 62 L240 72 Q254 78 255 92 L255 112 Z",
    glass: "M104 72 L122 52 L196 52 L214 68 Z",
    wheels: [96, 222],
    wheelR: 16,
    shadowRx: 115,
  },
  sedan: {
    body:
      "M24 112 L24 100 Q26 90 40 88 L92 82 Q104 62 128 58 L186 56 Q210 56 224 70 L252 80 Q284 84 292 96 L293 106 Q293 112 286 112 Z",
    glass: "M106 80 L128 62 L208 62 L226 78 Z",
    wheels: [92, 240],
    wheelR: 16,
    shadowRx: 128,
  },
  suv: {
    body:
      "M26 112 L26 94 Q27 82 40 80 L78 74 Q92 52 118 48 L210 46 Q238 46 248 60 L276 70 Q288 74 289 88 L289 112 Z",
    glass: "M96 74 L116 54 L238 54 L250 68 Z",
    wheels: [90, 242],
    wheelR: 17,
    shadowRx: 128,
  },
  mpv: {
    body:
      "M30 112 L30 92 Q31 80 44 76 L66 72 Q88 46 122 44 L226 44 Q262 44 272 58 L280 70 Q286 76 286 90 L286 112 Z",
    glass: "M80 70 L108 50 L262 50 L270 66 Z",
    wheels: [86, 246],
    wheelR: 16,
    shadowRx: 130,
  },
  pickup: {
    body:
      "M26 112 L26 94 Q27 82 40 80 L76 74 Q90 52 116 48 L170 46 Q192 46 200 60 L204 70 L288 70 L292 74 L292 112 Z",
    glass: "M94 74 L114 54 L182 54 L194 70 Z",
    wheels: [88, 248],
    wheelR: 17,
    shadowRx: 130,
  },
};

export function CarSilhouette({
  segment,
  className,
  style,
}: {
  segment: SilhouetteType | Segment | string | undefined;
  className?: string;
  style?: CSSProperties;
}) {
  const type: SilhouetteType =
    segment === "city" ||
    segment === "sedan" ||
    segment === "suv" ||
    segment === "mpv" ||
    segment === "pickup"
      ? segment
      : segmentToSilhouette(segment);
  const def = DEFS[type];
  const [cx1, cx2] = def.wheels;
  return (
    <svg
      viewBox="0 0 320 150"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-hidden="true"
    >
      <ellipse cx={160} cy={132} rx={def.shadowRx} ry={7} fill="rgba(0,0,0,0.28)" />
      <path d={def.body} fill="#22364F" />
      <path d={def.glass} fill="#31486B" />
      {[cx1, cx2].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={112} r={def.wheelR} fill="#0A0F1C" stroke="#46618A" strokeWidth={3} />
          <circle cx={cx} cy={112} r={5} fill="#46618A" />
        </g>
      ))}
    </svg>
  );
}