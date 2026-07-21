// 최적 금융 구조 근거 문장 풀 및 유형별 매핑
// 카피는 기획 확정본 — 임의 수정 금지.

export const REASONS = {
  R1: "리스·렌트는 차값에서 만기 잔존가치를 뺀 만큼만 나눠 내는 구조예요. 같은 차를 같은 기간 타도 월 납입이 할부보다 낮습니다. (만기 반납 기준)",
  R4s: "3~4년마다 교체하는 패턴이면, 중고값 하락을 떠안는 할부보다 리스·렌트 총비용이 낮아지는 구간이에요.",
  R5: "내 명의로 사면 사고나 예상 못 한 이슈로 인한 중고값 하락을 전부 내가 떠안아요. 리스·렌트는 잔존가치가 계약에 정해져 있어 시세 하락을 신경 쓸 필요가 없어요.",
  R5L: "리스는 사고 시 감가 패널티가 있어요. 다만 만기에 반납 대신 중고 매각으로 처리하면 상당 부분 방어되는 경우가 많아요 — 상담에서 설계해 드려요.",
  R6: "요즘은 풀체인지·페이스리프트 주기가 빨라 차 가치가 금방 내려가요. 그 하락분을 소유주가 아니라 금융사가 지는 구조가 리스·렌트예요.",
  R7: "할부·일시불은 취등록세·자동차세·보험을 각자 챙겨야 해요. 렌트는 기름만 넣으면 되고, 리스는 보험료와 자동차세만 내면 됩니다.",
  R8: "렌트는 렌트사 보험으로 운행해서 내 보험 이력과 무관하고, 사고가 나도 내 보험료가 오르지 않아요. (면책금 등 계약 조건은 있어요)",
} as const;

export type ReasonKey = keyof typeof REASONS;

export type FlexReasons = {
  kind: "flex";
  reasons: ReasonKey[];
  footnote?: ReasonKey;
};

export type StableReasons = {
  kind: "stable";
};

// F계열 8개 유형 매핑
export const TYPE_REASONS: Record<string, FlexReasons | StableReasons> = {
  CTEF: { kind: "flex", reasons: ["R1", "R5", "R6"], footnote: "R5L" },
  CTGF: { kind: "flex", reasons: ["R7", "R1", "R8"] },
  CKEF: { kind: "flex", reasons: ["R1", "R5", "R7"] },
  CKGF: { kind: "flex", reasons: ["R7", "R8", "R1"] },
  WTEF: { kind: "flex", reasons: ["R6", "R5", "R1"], footnote: "R5L" },
  WTGF: { kind: "flex", reasons: ["R4s", "R7", "R1"] },
  WKEF: { kind: "flex", reasons: ["R5", "R7", "R1"] },
  WKGF: { kind: "flex", reasons: ["R7", "R1", "R8"] },
  // S계열 8개는 stable — 기존 reason 유지 + 비교 블록 노출
  CTES: { kind: "stable" }, CKES: { kind: "stable" },
  CTGS: { kind: "stable" }, CKGS: { kind: "stable" },
  WTES: { kind: "stable" }, WTGS: { kind: "stable" },
  WKES: { kind: "stable" }, WKGS: { kind: "stable" },
};

// S계열 하단 비교 블록 카피
export const STABLE_COMPARE = {
  title: "다만, 이런 경우엔 리스·렌트도 함께 보세요",
  bullets: [
    "6년 이상 확실히 타신다면 총비용은 할부가 유리할 수 있어요. 다만 대부분 차량이 5년 전후로 보증이 끝나 수리비가 커져서, 보증기간 안에서 타고 교체하는 리스·렌트를 권해드리는 경우도 많아요.",
    REASONS.R1,
  ],
  footnote: "소유가 최종 목표라면, 리스로 타다가 만기에 인수하는 방법도 있어요 — 상담에서 설계해 드립니다.",
} as const;