// 정밀 매칭(7문항) 데이터 · sessionStorage 단일 소스
// - situation: P1~P4 + swap_cycle (본진단 Q2에서 자동 채움)
// - condition: P5~P7

export type LoanPlan = "yes" | "no" | "unsure";
export type AnnualKm = "low" | "mid" | "high";
export type BizType = "personal" | "sole" | "corp";
export type InsPenalty = "yes" | "no";
export type SwapCycle = "long" | "short";
export type Passengers = "solo" | "family" | "gear";
export type BodyPref = "suv" | "sedan" | "any";

export type PrecisionSituation = {
  loan_plan?: LoanPlan;
  annual_km?: AnnualKm;
  biz_type?: BizType;
  ins_penalty?: InsPenalty;
  swap_cycle?: SwapCycle;
};

export type PrecisionCondition = {
  monthly_budget?: number;
  passengers?: Passengers;
  body_pref?: BodyPref;
};

export type PrecisionData = PrecisionSituation & PrecisionCondition;

export const PRECISION_KEY = "carbti_precision";

export function readPrecision(): PrecisionData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(PRECISION_KEY);
    return raw ? (JSON.parse(raw) as PrecisionData) : {};
  } catch {
    return {};
  }
}

export function writePrecision(next: PrecisionData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PRECISION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function patchPrecision(patch: Partial<PrecisionData>): PrecisionData {
  const merged = { ...readPrecision(), ...patch };
  writePrecision(merged);
  return merged;
}

export function splitPrecision(data: PrecisionData): {
  situation: PrecisionSituation;
  condition: PrecisionCondition;
} {
  const { loan_plan, annual_km, biz_type, ins_penalty, swap_cycle } = data;
  const { monthly_budget, passengers, body_pref } = data;
  return {
    situation: { loan_plan, annual_km, biz_type, ins_penalty, swap_cycle },
    condition: { monthly_budget, passengers, body_pref },
  };
}

// 본진단 Q2 응답(maps) → swap_cycle 매핑
// "한 번 사면 오래" → K → long, "3~4년마다 갈아탈래요" → T → short
export function swapCycleFromQ2(maps: string): SwapCycle | undefined {
  if (maps === "K") return "long";
  if (maps === "T") return "short";
  return undefined;
}

// ---------- 정밀 매칭 7문항 정의 ----------

export type PrecisionChoiceOption<V extends string> = {
  value: V;
  title: string;
  desc?: string;
};

export type PrecisionChoiceQuestion<K extends keyof PrecisionData, V extends string> = {
  id: string;
  kind: "choice";
  field: K;
  label: string;
  question: string;
  subtitle?: string;
  options: PrecisionChoiceOption<V>[];
};

export type PrecisionBudgetQuestion = {
  id: "P5";
  kind: "budget";
  field: "monthly_budget";
  label: string;
  question: string;
  subtitle?: string;
};

export type PrecisionQuestion =
  | PrecisionChoiceQuestion<"loan_plan", LoanPlan>
  | PrecisionChoiceQuestion<"annual_km", AnnualKm>
  | PrecisionChoiceQuestion<"biz_type", BizType>
  | PrecisionChoiceQuestion<"ins_penalty", InsPenalty>
  | PrecisionBudgetQuestion
  | PrecisionChoiceQuestion<"passengers", Passengers>
  | PrecisionChoiceQuestion<"body_pref", BodyPref>;

export const PRECISION_QUESTIONS: PrecisionQuestion[] = [
  {
    id: "P1",
    kind: "choice",
    field: "loan_plan",
    label: "P1 · 자금 계획",
    question: "앞으로 3년 안에 큰 대출 계획이 있나요?",
    subtitle: "주택·전세·사업자금 등",
    options: [
      { value: "yes", title: "있어요" },
      { value: "no", title: "없어요" },
      { value: "unsure", title: "아직 모르겠어요" },
    ],
  },
  {
    id: "P2",
    kind: "choice",
    field: "annual_km",
    label: "P2 · 주행 거리",
    question: "1년에 어느 정도 달리시나요?",
    options: [
      { value: "low", title: "1만km 이하" },
      { value: "mid", title: "1.5만km 안팎" },
      { value: "high", title: "2만km 이상" },
    ],
  },
  {
    id: "P3",
    kind: "choice",
    field: "biz_type",
    label: "P3 · 이용 명의",
    question: "사업자(개인·법인)로 이용할 수 있나요?",
    options: [
      { value: "personal", title: "아니요, 개인이에요" },
      { value: "sole", title: "개인사업자예요" },
      { value: "corp", title: "법인이에요" },
    ],
  },
  {
    id: "P4",
    kind: "choice",
    field: "ins_penalty",
    label: "P4 · 보험 이력",
    question: "최근 3년 사이, 사고로 보험료가 오른 적 있나요?",
    options: [
      { value: "yes", title: "있어요" },
      { value: "no", title: "없어요" },
    ],
  },
  {
    id: "P5",
    kind: "budget",
    field: "monthly_budget",
    label: "P5 · 월 납입",
    question: "월 납입, 어느 정도가 편하세요?",
  },
  {
    id: "P6",
    kind: "choice",
    field: "passengers",
    label: "P6 · 탑승 구성",
    question: "차에 주로 누가 타나요?",
    options: [
      { value: "solo", title: "혼자 또는 둘이" },
      { value: "family", title: "아이·가족 (4인 이상)" },
      { value: "gear", title: "짐·레저 장비가 많아요" },
    ],
  },
  {
    id: "P7",
    kind: "choice",
    field: "body_pref",
    label: "P7 · 형태",
    question: "끌리는 형태가 있나요?",
    options: [
      { value: "suv", title: "SUV" },
      { value: "sedan", title: "세단·해치백" },
      { value: "any", title: "상관없어요" },
    ],
  },
];

export const PRECISION_TOTAL = PRECISION_QUESTIONS.length;