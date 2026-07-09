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

// 축 정의 (확정 · 옵션 C)
//  1축 C/W  주행 무대   City / Wide
//  2축 T/K  차량 취향   Trendy / Klassic
//  3축 E/G  파워트레인  Electric / Gasoline·HEV
//  4축 F/S  소유 성향   Flex(리스·렌트) / Stable(할부·현금)
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

const AXIS_ICON: Record<string, string> = {
  C: "🏙️", W: "🛣️",
  T: "✨", K: "🎯",
  E: "🔋", G: "⛽",
  F: "🔄", S: "🏠",
};

const AXIS_LABEL: Record<Dimension, string> = {
  purpose: "주행 무대",
  ownership: "차량 취향",
  powertrain: "파워트레인",
  payment: "소유 성향",
  value: "나의 기준",
};

const AXIS_KEY_TO_DIMENSION: Record<string, Dimension> = {
  CW: "purpose",
  TK: "ownership",
  EG: "powertrain",
  FS: "payment",
  VALUE: "value",
};

type RawOption = {
  label: "A" | "B";
  text: string;
  axisValue?: string;
  valueScoreDelta?: number;
};

type RawQuestion = {
  id: string;
  axis: "CW" | "TK" | "EG" | "FS" | "VALUE";
  text: string;
  options: [RawOption, RawOption];
  milestone?: string;
};

// Q3~Q15 · 업로드된 카BTI 콘텐츠 v1.0
const RAW_QUESTIONS: RawQuestion[] = [
  { id: "Q3", axis: "CW", text: "주말 아침, 차 키를 잡았다. 오늘의 목적지는?", options: [
    { label: "A", text: "시내 새로 생긴 브런치 카페 — 주차 편한 게 최고", axisValue: "C" },
    { label: "B", text: "편도 2시간 바다 — 고속도로 올라탈 때가 제일 행복", axisValue: "W" },
  ]},
  { id: "Q4", axis: "CW", text: "내가 운전대를 제일 오래 잡는 시간은?", options: [
    { label: "A", text: "출퇴근과 시내 볼일 — 짧지만 매일", axisValue: "C" },
    { label: "B", text: "여행과 장거리 — 가끔이지만 길게", axisValue: "W" },
  ]},
  { id: "Q5", axis: "TK", text: "신차 공개 영상이 피드에 떴다. 나의 반응은?", options: [
    { label: "A", text: "바로 클릭. 디자인부터 옵션까지 정주행", axisValue: "T", valueScoreDelta: -5 },
    { label: "B", text: "출시 1년 뒤 실오너 후기가 진짜지", axisValue: "K", valueScoreDelta: 5 },
  ]},
  { id: "Q6", axis: "TK", text: "옵션 선택 화면 앞에서 나는?", options: [
    { label: "A", text: "파노라마 선루프, 앰비언트 라이트… 이왕이면 풀옵션", axisValue: "T", valueScoreDelta: -10 },
    { label: "B", text: "안전 옵션만 확실하게. 나머지는 거품", axisValue: "K", valueScoreDelta: 10 },
  ]},
  { id: "Q7", axis: "TK", text: "친구의 \"차 뭐 샀어?\"에 내가 듣고 싶은 반응은?", options: [
    { label: "A", text: "\"와, 그거 요즘 제일 핫한 차잖아!\"", axisValue: "T" },
    { label: "B", text: "\"오~ 진짜 잘 골랐네. 실속 있다\"", axisValue: "K" },
  ]},
  { id: "Q8", axis: "EG", text: "충전 vs 주유, 솔직한 내 마음은?", milestone: "절반 왔어요! 🚗", options: [
    { label: "A", text: "집이나 회사 근처에 충전기 있음 — 전기차 갈 준비 완료", axisValue: "E" },
    { label: "B", text: "5분 주유가 아직은 편하다 — 기름차·하이브리드파", axisValue: "G" },
  ]},
  { id: "Q9", axis: "EG", text: "나에게 자동차의 '소리'란?", options: [
    { label: "A", text: "조용할수록 럭셔리 — 전기차 정숙성이 최고의 옵션", axisValue: "E" },
    { label: "B", text: "엔진 사운드도 감성이다 — 부릉 소리에 심장이 뛴다", axisValue: "G", valueScoreDelta: -5 },
  ]},
  { id: "Q10", axis: "EG", text: "OTA 업데이트·반자율주행 같은 신기술, 나는?", options: [
    { label: "A", text: "업데이트 알림이 설레는 얼리어답터", axisValue: "E" },
    { label: "B", text: "남들이 충분히 써본 다음에 — 검증이 먼저", axisValue: "G", valueScoreDelta: 5 },
  ]},
  { id: "Q11", axis: "FS", text: "3년 뒤의 나, 어느 쪽이 더 좋아?", options: [
    { label: "A", text: "새 차로 갈아타고 또 새 차 기분 내기", axisValue: "F" },
    { label: "B", text: "내 차와 정들어서 오래오래 함께", axisValue: "S" },
  ]},
  { id: "Q12", axis: "FS", text: "보험·정비·세금 챙기기, 나는?", milestone: "거의 다 왔어요! 🏁", options: [
    { label: "A", text: "신경 쓰기 싫다 — 월 요금에 다 포함돼 있으면 좋겠어", axisValue: "F" },
    { label: "B", text: "내 손으로 직접 챙겨야 진짜 내 차지", axisValue: "S" },
  ]},
  { id: "Q13", axis: "FS", text: "목돈 vs 월 납입, 나의 선택은?", options: [
    { label: "A", text: "초기 비용은 최소로, 월 고정비로 깔끔하게", axisValue: "F" },
    { label: "B", text: "이자가 아깝다 — 목돈 모아서 내 명의로", axisValue: "S", valueScoreDelta: 5 },
  ]},
  { id: "Q14", axis: "VALUE", text: "차를 고르는 나의 최종 기준 한 가지는?", options: [
    { label: "A", text: "타는 순간의 만족감 — 기분이 절반이다", valueScoreDelta: -15 },
    { label: "B", text: "총 소유비용 — 결국 숫자가 답이다", valueScoreDelta: 15 },
  ]},
  { id: "Q15", axis: "VALUE", text: "마지막 질문! 나에게 자동차란…", options: [
    { label: "A", text: "나를 표현하는 두 번째 자아", valueScoreDelta: -10 },
    { label: "B", text: "삶을 편하게 만드는 최고의 도구", valueScoreDelta: 10 },
  ]},
];

function splitTitleDesc(text: string): { title: string; desc: string } {
  const idx = text.indexOf(" — ");
  if (idx === -1) return { title: text, desc: "" };
  return { title: text.slice(0, idx), desc: text.slice(idx + 3) };
}

function convertRaw(raw: RawQuestion, id: number): Question {
  const dimension = AXIS_KEY_TO_DIMENSION[raw.axis];
  const label = `Q${id} · ${AXIS_LABEL[dimension]}`;
  const toOption = (o: RawOption): QuestionOption => {
    const { title, desc } = splitTitleDesc(o.text);
    const icon = o.axisValue
      ? AXIS_ICON[o.axisValue] ?? "•"
      : o.label === "A" ? "💭" : "💡";
    return {
      icon,
      title,
      desc,
      maps: o.axisValue ?? o.label,
      valueScoreDelta: o.valueScoreDelta,
    };
  };
  return {
    id,
    dimension,
    label,
    question: raw.text,
    subtitle: "정답은 없어요. 지금 마음에 가까운 쪽을 선택하세요.",
    options: [toOption(raw.options[0]), toOption(raw.options[1])],
    milestone: raw.milestone,
  };
}

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
  ...RAW_QUESTIONS.map((raw, i) => convertRaw(raw, i + 3)),
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export type Answer = {
  questionId: number;
  dimension: Dimension;
  maps: string;
  valueScoreDelta?: number;
};

export function computeCode(answers: Answer[]): string {
  const tally: Record<string, Record<string, number>> = {
    purpose: {}, ownership: {}, powertrain: {}, payment: {},
  };
  for (const a of answers) {
    if (!tally[a.dimension]) continue;
    tally[a.dimension][a.maps] = (tally[a.dimension][a.maps] ?? 0) + 1;
  }
  return AXIS_ORDER.map((dim) => {
    const [a, b] = AXIS[dim];
    const ca = tally[dim][a] ?? 0;
    const cb = tally[dim][b] ?? 0;
    return ca >= cb ? a : b;
  }).join("");
}

// 내부 전용: 0=감성, 100=실용. UI 노출 금지.
export function computeValueScore(answers: Answer[]): number {
  const raw = answers.reduce((sum, a) => sum + (a.valueScoreDelta ?? 0), 50);
  return Math.max(0, Math.min(100, raw));
}

export function progressLabel(current: number): string {
  if (current <= 3) return "거의 시작이에요";
  if (current <= 7) return "약 1분 남음";
  if (current <= 11) return "거의 반 왔어요 · 약 1분 남음";
  return "곧 결과가 나와요";
}

export function milestoneMessage(current: number): string | null {
  return QUESTIONS[current - 1]?.milestone ?? null;
}

export const ANSWERS_STORAGE_KEY = "carbti:diagnosis:answers";
export const VALUE_SCORE_STORAGE_KEY = "carbti:diagnosis:valueScore";