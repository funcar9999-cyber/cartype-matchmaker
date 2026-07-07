export type Dimension = "purpose" | "ownership" | "powertrain" | "payment";

export type QuestionOption = {
  icon: string;
  title: string;
  desc: string;
  maps: string;
};

export type Question = {
  id: number;
  dimension: Dimension;
  label: string;
  question: string;
  subtitle: string;
  options: [QuestionOption, QuestionOption];
};

// 축별 letter pair (첫 글자가 CTEF 기본형)
// purpose: C(도시) vs W(주말/장거리)
// ownership: T(자주 교체) vs K(오래 보유)
// powertrain: E(전기/하이브리드) vs G(가솔린/디젤)
// payment: F(유연 · 리스/렌트) vs S(안정 · 할부/현금)
const AXIS: Record<Dimension, [string, string]> = {
  purpose: ["C", "W"],
  ownership: ["T", "K"],
  powertrain: ["E", "G"],
  payment: ["F", "S"],
};

const AXIS_ORDER: Dimension[] = ["purpose", "ownership", "powertrain", "payment"];

const placeholder = (
  id: number,
  dimension: Dimension,
  label: string,
): Question => {
  const [a, b] = AXIS[dimension];
  return {
    id,
    dimension,
    label: `Q${id} · ${label}`,
    question: `Q${id} 질문 자리표시자 (콘텐츠팀 준비 중)`,
    subtitle: "정답은 없어요. 지금 마음에 가까운 쪽을 선택하세요.",
    options: [
      { icon: "🅰️", title: "선택지 A", desc: "설명이 들어갈 자리예요", maps: a },
      { icon: "🅱️", title: "선택지 B", desc: "설명이 들어갈 자리예요", maps: b },
    ],
  };
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    dimension: "purpose",
    label: "Q1 · 주행 목적",
    question: "차를 주로 어떤 상황에서 탈 것 같나요?",
    subtitle: "정답은 없어요. 지금 마음에 가까운 쪽을 선택하세요.",
    options: [
      {
        icon: "🏙️",
        title: "매일 출퇴근 · 시내 위주",
        desc: "연비와 편의성이 중요해요",
        maps: "C",
      },
      {
        icon: "🏞️",
        title: "주말 여행 · 장거리 위주",
        desc: "넓은 공간과 주행 성능이 필요해요",
        maps: "W",
      },
    ],
  },
  {
    id: 2,
    dimension: "ownership",
    label: "Q2 · 소유 관점",
    question: "차를 산다면 몇 년 정도 탈 생각인가요?",
    subtitle: "정답은 없어요. 지금 마음에 가까운 쪽을 선택하세요.",
    options: [
      {
        icon: "🏠",
        title: "한 번 사면 오래 · 5년 이상",
        desc: "애착 있는 차를 관리하며 오래 타는 편이에요",
        maps: "K",
      },
      {
        icon: "🔄",
        title: "3~4년마다 갈아탈래요",
        desc: "새로운 차의 감성과 최신 기능을 자주 경험하고 싶어요",
        maps: "T",
      },
    ],
  },
  placeholder(3, "powertrain", "파워트레인 선호"),
  placeholder(4, "payment", "결제 스타일"),
  placeholder(5, "purpose", "주행 상황 2"),
  placeholder(6, "ownership", "차량 관리 성향"),
  placeholder(7, "powertrain", "연료/충전 편의"),
  placeholder(8, "payment", "월 지출 여유"),
  placeholder(9, "purpose", "동승자 구성"),
  placeholder(10, "ownership", "중고차 판매 관점"),
  placeholder(11, "powertrain", "환경 · 신기술 관심"),
  placeholder(12, "payment", "잔가 · 리스크 성향"),
  placeholder(13, "purpose", "주행 즐거움"),
  placeholder(14, "ownership", "차량 변경 주기"),
  placeholder(15, "powertrain", "충전/주유 접근성"),
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export type Answer = {
  questionId: number;
  dimension: Dimension;
  maps: string;
};

export function computeCode(answers: Answer[]): string {
  const tally: Record<Dimension, Record<string, number>> = {
    purpose: {},
    ownership: {},
    powertrain: {},
    payment: {},
  };
  for (const a of answers) {
    tally[a.dimension][a.maps] = (tally[a.dimension][a.maps] ?? 0) + 1;
  }
  return AXIS_ORDER.map((dim) => {
    const [a, b] = AXIS[dim];
    const ca = tally[dim][a] ?? 0;
    const cb = tally[dim][b] ?? 0;
    return ca >= cb ? a : b;
  }).join("");
}

export function progressLabel(current: number): string {
  if (current <= 3) return "거의 시작이에요";
  if (current <= 7) return "약 1분 남음";
  if (current <= 11) return "거의 반 왔어요 · 약 1분 남음";
  return "곧 결과가 나와요";
}

export function milestoneMessage(current: number): string | null {
  if (current === 8) return "🎯 절반 통과 · 곧 당신의 유형이 나옵니다";
  if (current === 12) return "✨ 마지막 스퍼트 · 곧 결과가 공개돼요";
  return null;
}

export const ANSWERS_STORAGE_KEY = "carbti:diagnosis:answers";