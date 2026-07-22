export type Dimension =
  | "purpose"
  | "ownership"
  | "powertrain"
  | "payment"
  | "value";

export type QuestionOption = {
  icon: string;
  title: string;
  desc: string;
  maps: string;
  weight?: number;
  valueScoreDelta?: number;
};

export type Question = {
  id: number;
  dimension: Dimension;
  label: string;
  question: string;
  subtitle: string;
  options: [QuestionOption, QuestionOption];
  milestone?: string;
};

// v1.3 · 8문항 가중 채점
// 축: C/W(주행 무대), T/K(차량 취향), E/G(파워트레인), F/S(소유 성향)
const AXIS: Record<Exclude<Dimension, "value">, [string, string]> = {
  purpose: ["C", "W"],
  ownership: ["T", "K"],
  powertrain: ["E", "G"],
  payment: ["F", "S"],
};

const AXIS_ORDER: Exclude<Dimension, "value">[] = [
  "purpose",
  "ownership",
  "powertrain",
  "payment",
];

const LETTER_TO_AXIS: Record<string, Exclude<Dimension, "value">> = {
  C: "purpose", W: "purpose",
  T: "ownership", K: "ownership",
  E: "powertrain", G: "powertrain",
  F: "payment", S: "payment",
};

const SUBTITLE = "정답은 없어요. 지금 마음에 가까운 쪽을 선택하세요.";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    dimension: "purpose",
    label: "P1 · 주행 무대",
    question: "주말에 차가 생기면, 어디부터 갈까요?",
    subtitle: SUBTITLE,
    options: [
      { icon: "🏙️", title: "시내 카페·마트", desc: "가까운 곳 위주로 자주", maps: "C", weight: 1 },
      { icon: "🛣️", title: "바다·교외", desc: "멀리 떠나는 게 좋아요", maps: "W", weight: 1 },
    ],
  },
  {
    id: 2,
    dimension: "purpose",
    label: "P2 · 주행 무대",
    question: "차를 타게 될 시간을 상상해 보면?",
    subtitle: SUBTITLE,
    options: [
      { icon: "🏙️", title: "출퇴근·장보기처럼 매일 짧게", desc: "짧지만 자주 타요", maps: "C", weight: 2 },
      { icon: "🛣️", title: "여행·먼 거리처럼 가끔 길게", desc: "가끔이지만 길게 타요", maps: "W", weight: 2 },
    ],
  },
  {
    id: 3,
    dimension: "ownership",
    label: "P3 · 차량 취향",
    question: "차를 사면 몇 년 정도 탈 것 같아요?",
    subtitle: SUBTITLE,
    options: [
      { icon: "🔄", title: "3~4년 타고 새 차로 갈아탈래요", desc: "새로운 감성을 자주 경험하고 싶어요", maps: "T", weight: 1 },
      { icon: "🏠", title: "한 번 사면 7년 이상 오래오래", desc: "애착 있는 차를 관리하며 타는 편이에요", maps: "K", weight: 1 },
    ],
  },
  {
    id: 4,
    dimension: "ownership",
    label: "P4 · 차량 취향",
    question: "통유리 지붕, 은은한 실내조명, 자동 주차… 이런 기능들 어때요?",
    subtitle: SUBTITLE,
    options: [
      { icon: "✨", title: "다 있으면 좋겠어요", desc: "있는 만큼 만족", maps: "T", weight: 2, valueScoreDelta: -10 },
      { icon: "🎯", title: "없어도 그만", desc: "안전 기능만 확실하면 돼요", maps: "K", weight: 2, valueScoreDelta: 10 },
    ],
  },
  {
    id: 5,
    dimension: "powertrain",
    label: "P5 · 파워트레인",
    question: "다음 차로 전기차, 어때요?",
    subtitle: SUBTITLE,
    milestone: "절반 왔어요! 🚗",
    options: [
      { icon: "🔋", title: "충전만 해결되면 타보고 싶어요", desc: "전기차 라인업이 궁금해요", maps: "E", weight: 1 },
      { icon: "⛽", title: "아직은 기름 넣는 차가 편해요", desc: "하이브리드 포함", maps: "G", weight: 1 },
    ],
  },
  {
    id: 6,
    dimension: "payment",
    label: "P6 · 소유 성향",
    question: "3년 뒤의 나, 어느 쪽이 더 좋아요?",
    subtitle: SUBTITLE,
    options: [
      { icon: "🔄", title: "새 차로 갈아타고 또 새 차 기분", desc: "새로운 차의 감성을 자주 경험하고 싶어요", maps: "F", weight: 1 },
      { icon: "🏠", title: "내 차와 정들어서 오래오래 함께", desc: "한 차를 오래 타는 편이에요", maps: "S", weight: 1 },
    ],
  },
  {
    id: 7,
    dimension: "payment",
    label: "P7 · 소유 성향",
    question: "차를 가지면 보험 가입, 정기 정비, 세금 내기 같은 일이 생겨요. 나는?",
    subtitle: SUBTITLE,
    options: [
      { icon: "🔄", title: "신경 쓰고 싶지 않아요", desc: "월 요금에 다 포함되면 좋겠어요", maps: "F", weight: 2 },
      { icon: "🏠", title: "직접 알아보고 챙겨야 마음 편해요", desc: "그래야 진짜 내 차죠", maps: "S", weight: 2 },
    ],
  },
  {
    id: 8,
    dimension: "value",
    label: "P8 · 나의 기준",
    question: "마지막! 차를 고르는 나의 진짜 기준은?",
    subtitle: SUBTITLE,
    milestone: "마지막! 곧 유형 공개 ✨",
    options: [
      { icon: "💭", title: "마음에 쏙 드는 차", desc: "기분이 절반이에요", maps: "A", valueScoreDelta: -15 },
      { icon: "💡", title: "부담 없는 차", desc: "들어가는 돈이 결국 답이에요", maps: "B", valueScoreDelta: 15 },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export type Answer = {
  questionId: number;
  dimension: Dimension;
  maps: string;
  weight?: number;
  valueScoreDelta?: number;
};

export function computeCode(answers: Answer[]): string {
  const tally: Record<string, Record<string, number>> = {
    purpose: {}, ownership: {}, powertrain: {}, payment: {},
  };
  const lastByDim: Record<string, string | undefined> = {};
  for (const a of answers) {
    const dim = LETTER_TO_AXIS[a.maps];
    if (!dim) continue;
    const w = a.weight ?? 1;
    tally[dim][a.maps] = (tally[dim][a.maps] ?? 0) + w;
    lastByDim[dim] = a.maps;
  }
  return AXIS_ORDER.map((dim) => {
    const [a, b] = AXIS[dim];
    const ca = tally[dim][a] ?? 0;
    const cb = tally[dim][b] ?? 0;
    if (ca === cb) return lastByDim[dim] ?? a;
    return ca > cb ? a : b;
  }).join("");
}

// 내부 전용: 0=감성, 100=실용. UI 노출 금지.
export function computeValueScore(answers: Answer[]): number {
  const raw = answers.reduce((sum, a) => sum + (a.valueScoreDelta ?? 0), 50);
  return Math.max(0, Math.min(100, raw));
}

export function progressLabel(current: number): string {
  if (current <= 2) return "거의 시작이에요";
  if (current <= 4) return "약 1분 남음";
  if (current <= 6) return "거의 반 왔어요";
  return "곧 결과가 나와요";
}

export function milestoneMessage(current: number): string | null {
  return QUESTIONS[current - 1]?.milestone ?? null;
}

export const ANSWERS_STORAGE_KEY = "carbti:diagnosis:answers";
export const VALUE_SCORE_STORAGE_KEY = "carbti:diagnosis:valueScore";
