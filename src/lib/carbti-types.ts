export type PaymentMethod = "리스" | "장기렌트" | "할부" | "현금+할부";

export type CarbtiType = {
  code: string;
  name: string;           // nickname
  tagline: string;
  emoji: string;
  powertrainBadge: string;
  description: string;
  rarityPercent: number;
  topCars: [string, string, string];
  bestPayment: { method: PaymentMethod; reason: string };
  benefits: [string, string, string];
};

export const CARBTI_TYPES: Record<string, CarbtiType> = {
  CTEF: { code: "CTEF", name: "얼리어답터", emoji: "🔋", tagline: "도심을 조용히 질주하는 트렌드 리더",
    description: "새로운 것은 일단 내가 먼저. 도심 생활에 최적화된 전기차를 부담 없이 갈아타며, 차가 곧 라이프스타일의 일부인 타입.",
    powertrainBadge: "🔋 전기", rarityPercent: 12,
    topCars: ["기아 EV3", "현대 캐스퍼 일렉트릭", "현대 아이오닉5"],
    bestPayment: { method: "리스", reason: "전기차는 모델 교체 주기가 빠르고 중고값 변동이 커서, 잔가 부담을 금융사에 넘기고 3~4년마다 갈아타는 리스가 유리한 경향이 있어요." },
    benefits: ["전기차 보조금 실시간 알림", "리스 vs 렌트 견적 비교", "내 신용 기준 예상 월납입금"] },
  CTES: { code: "CTES", name: "시티 퍼스트무버", emoji: "⚡", tagline: "전기차를 '내 것'으로 만드는 도심의 선구자",
    description: "트렌드를 좇지만 소유의 만족도 포기 못 한다. 보조금 받고 내 명의로 등록한 전기차를 5년 이상 탈 계획까지 이미 세워둔 타입.",
    powertrainBadge: "🔋 전기", rarityPercent: 5,
    topCars: ["현대 아이오닉5", "기아 EV3 GT라인", "테슬라 모델3"],
    bestPayment: { method: "할부", reason: "장기 보유 계획이면 보조금을 직접 받고 연료비 절감을 온전히 누리는 소유가 유리한 경향이 있어요." },
    benefits: ["보조금 잔여 물량 알림", "캐피탈사별 할부 금리 비교", "승인 가능성 사전 예측"] },
  CTGF: { code: "CTGF", name: "시티 트렌드세터", emoji: "🥂", tagline: "지금 가장 핫한 차를 가장 가볍게 타는 법을 아는 타입",
    description: "차는 패션이다. 목돈 묶이는 건 질색, 2~3년마다 신상으로 갈아타야 직성이 풀린다. 도심 어디서든 존재감 있는 디자인이 최우선.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 9,
    topCars: ["기아 셀토스", "쉐보레 트랙스 크로스오버", "MINI 쿠퍼"],
    bestPayment: { method: "장기렌트", reason: "보험·정비 포함 월정액으로 관리 부담 없이, 계약 만기마다 신차로 교체하는 패턴에 잘 맞아요." },
    benefits: ["신차 출시 캘린더 알림", "렌트 vs 리스 총비용 비교", "보험경력 무관 견적"] },
  CTGS: { code: "CTGS", name: "어반 스타일리스트", emoji: "🏙️", tagline: "디자인은 타협 못 해, 그래도 내 명의로",
    description: "시내 주행이 대부분이지만 차의 스타일만큼은 포기 없다. 마음에 든 차는 오래 아껴 타는, 감각과 애착을 겸비한 타입.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 8,
    topCars: ["현대 아반떼", "기아 K5", "기아 셀토스"],
    bestPayment: { method: "할부", reason: "보유 기간이 길수록 렌트·리스 대비 총비용이 낮아지는 경향이 있어요. 선수금을 높여 이자 부담을 줄이는 게 포인트." },
    benefits: ["할부 금리 한눈 비교", "내 예산 맞춤 트림 추천", "승인률 사전 체크"] },
  CKEF: { code: "CKEF", name: "실속 그린라이더", emoji: "🌱", tagline: "유지비 계산 끝. 그래서 전기차, 그래서 리스",
    description: "전기차를 고른 이유가 '멋'이 아니라 '연료비 엑셀 계산'인 타입. 검증된 보급형 전기차를 가장 가벼운 방식으로 탄다.",
    powertrainBadge: "🔋 전기", rarityPercent: 4,
    topCars: ["현대 코나 일렉트릭", "기아 레이 EV", "현대 캐스퍼 일렉트릭"],
    bestPayment: { method: "리스", reason: "배터리 성능 저하·중고값 걱정 없이 확정 월비용으로 이용하는 방식이 실속형에 잘 맞아요." },
    benefits: ["전기 vs 내연 유지비 시뮬레이션", "리스 견적 비교", "월납입금 예측"] },
  CKES: { code: "CKES", name: "계획형 전기 오너", emoji: "🔌", tagline: "10년 타면 전기차가 무조건 이득이라는 걸 아는 사람",
    description: "구매 전 스프레드시트부터 여는 신중파. 보조금·연료비·감가까지 다 계산한 뒤 확신을 갖고 전기차를 '소유'하는 타입.",
    powertrainBadge: "🔋 전기", rarityPercent: 5,
    topCars: ["현대 코나 일렉트릭", "현대 아이오닉6", "기아 EV3"],
    bestPayment: { method: "할부", reason: "장기 보유 전제면 소유가 총비용 최저인 경향. 초기 목돈이 부담이면 원금균등 할부로 이자를 최소화하세요." },
    benefits: ["10년 총비용 리포트", "금융사별 금리 비교", "승인 가능성 예측"] },
  CKGF: { code: "CKGF", name: "미니멀 통근러", emoji: "☕", tagline: "차는 필요할 때 있으면 되는 것 — 신경은 쓰기 싫은 것",
    description: "차에 큰 의미 부여 없이 출퇴근 도구로 쓰는 합리주의자. 보험·정비 챙기는 시간이 아까워 월정액에 다 맡기는 타입.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 7,
    topCars: ["기아 레이", "현대 캐스퍼", "현대 아반떼"],
    bestPayment: { method: "장기렌트", reason: "보험·정비·세금이 월 요금에 포함되어 관리 제로. 사고 이력이 내 보험료에 영향 없는 점도 통근족에 유리해요." },
    benefits: ["관리 포함 월정액 견적", "렌트 vs 소유 비교 리포트", "즉시 출고 가능 차량 알림"] },
  CKGS: { code: "CKGS", name: "알뜰 실속파", emoji: "🧮", tagline: "감가·유지비·보험까지 다 계산 끝난 정통 실속형",
    description: "차는 사는 순간부터 감가라는 걸 알기에, 검증된 모델을 최대한 합리적으로 사서 오래 탄다. 대한민국 표준에 가장 가까운 타입.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 10,
    topCars: ["현대 아반떼", "현대 캐스퍼", "기아 셀토스"],
    bestPayment: { method: "현금+할부", reason: "이자 비용을 최소화하는 정공법. 신용점수 관리를 겸해 일부만 단기 할부로 가져가는 것도 방법이에요." },
    benefits: ["실구매가 최저 조합 계산", "금리 비교", "중고 시세 기반 감가 리포트"] },
  WTEF: { code: "WTEF", name: "테크 로드러너", emoji: "🚀", tagline: "최신 전기차로 전국을 달리는 신기술 순례자",
    description: "항속거리와 초급속 충전 스펙을 줄줄 외운다. 전기차 기술이 1년마다 뛰는 걸 알기에, 소유 대신 최신 모델 순환 탑승을 택한 타입.",
    powertrainBadge: "🔋 전기", rarityPercent: 4,
    topCars: ["현대 아이오닉6", "기아 EV6", "테슬라 모델Y"],
    bestPayment: { method: "리스", reason: "기술 발전 속도가 빠른 전기차일수록 교체 유연성이 큰 리스가 잘 맞아요." },
    benefits: ["신형 EV 출시·보조금 알림", "리스 승계·중도 교체 조건 비교", "월납입금 예측"] },
  WTES: { code: "WTES", name: "테크 익스플로러", emoji: "🛰️", tagline: "플래그십 전기차의 오너가 되는 게 곧 취미",
    description: "장거리 여행과 첨단 기술 둘 다 놓칠 수 없다. 대형 전기 SUV를 내 명의로 소유하고 OTA로 진화시키는 재미를 아는 타입.",
    powertrainBadge: "🔋 전기", rarityPercent: 5,
    topCars: ["기아 EV9", "현대 아이오닉9", "테슬라 모델Y"],
    bestPayment: { method: "할부", reason: "고가 차량은 리스료도 높아, 5년 이상 보유 계획이면 할부 소유가 총비용에서 유리해지는 경향이 있어요." },
    benefits: ["고가 차량 승인률 사전 예측", "금리 비교", "보조금·세제 혜택 정리"] },
  WTGF: { code: "WTGF", name: "프리스타일 로버", emoji: "🏄", tagline: "이번 주말도 어디론가 — 차는 가볍게, 여행은 진하게",
    description: "차박·서핑·스키, 계절마다 노는 물이 다르다. 라이프스타일이 바뀌면 차도 바꾸는 게 당연한, 자유도 최우선 타입.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 6,
    topCars: ["현대 투싼", "기아 스포티지", "KGM 토레스"],
    bestPayment: { method: "장기렌트", reason: "2~3년 단위로 라이프스타일에 맞춰 차종을 바꾸는 유연함이 강점이에요." },
    benefits: ["아웃도어 특화 차량 큐레이션", "단기 계약 조건 비교", "보험 포함 견적"] },
  WTGS: { code: "WTGS", name: "퍼포먼스 오너", emoji: "🏁", tagline: "달리는 맛을 아는 사람 — 그 차는 반드시 내 차여야 한다",
    description: "고속도로 진입로에서 기분이 좋아지는 타입. 주행 질감과 브랜드에 진심이라, 아끼는 차를 직접 관리하며 오래 타는 오너 드라이버.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 5,
    topCars: ["제네시스 GV70", "현대 아반떼 N", "기아 쏘렌토"],
    bestPayment: { method: "할부", reason: "애착이 큰 차는 보유 기간이 길어져 소유가 유리한 경향. 선수금·기간 조합으로 월부담을 최적화하세요." },
    benefits: ["프리미엄 브랜드 금리 비교", "승인률 예측", "트림·옵션 가성비 분석"] },
  WKEF: { code: "WKEF", name: "그린 노마드", emoji: "🌿", tagline: "조용하고 검증된 전기차로 전국을 흐르듯 다니는 타입",
    description: "유행과 무관하게 '검증된 전기차 + 가벼운 이용'이라는 자기만의 답을 찾은 소수파. 16유형 중 가장 희귀한 조합.",
    powertrainBadge: "🔋 전기", rarityPercent: 3,
    topCars: ["현대 아이오닉6", "기아 EV5", "현대 코나 일렉트릭"],
    bestPayment: { method: "장기렌트", reason: "장거리 주행이 많을수록 연료비 절감이 커지고, 렌트라면 배터리 걱정도 렌트사 몫이에요." },
    benefits: ["장거리 유지비 시뮬레이션", "렌트 견적 비교", "충전 인프라 리포트"] },
  WKES: { code: "WKES", name: "장거리 플래너", emoji: "🗺️", tagline: "연간 3만km — 전기차 소유가 답이라는 걸 계산으로 아는 사람",
    description: "주행거리가 길수록 전기차 소유의 경제성이 커진다는 걸 정확히 아는 타입. 검증된 항속형 모델을 골라 10년 플랜으로 탄다.",
    powertrainBadge: "🔋 전기", rarityPercent: 4,
    topCars: ["현대 아이오닉6", "기아 EV5", "기아 EV6"],
    bestPayment: { method: "할부", reason: "주행거리가 길수록 소유 시 연료비 절감 효과가 극대화돼요. 보조금 직접 수령 + 저리 할부 조합이 정석." },
    benefits: ["주행거리 기반 손익분기 계산", "금리 비교", "승인 예측"] },
  WKGF: { code: "WKGF", name: "패밀리 플렉서", emoji: "👨‍👩‍👧", tagline: "가족의 차는 크게, 가계의 부담은 작게",
    description: "가족이 우선이라 공간은 타협 불가, 대신 목돈은 교육비·내집마련에 아껴둔다. 큰 차를 월정액으로 현명하게 굴리는 타입.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 5,
    topCars: ["기아 카니발", "기아 쏘렌토 하이브리드", "현대 팰리세이드"],
    bestPayment: { method: "장기렌트", reason: "가족 운전자 다수 등록·보험 포함으로 관리가 단순하고, 목돈을 묶지 않아도 돼요." },
    benefits: ["패밀리카 월납입 비교", "다인 운전자 보험 조건 안내", "승인 예측"] },
  WKGS: { code: "WKGS", name: "베테랑 오너", emoji: "🛡️", tagline: "검증된 차를 내 명의로, 10년을 함께 — 자동차 구매의 정석",
    description: "차는 신뢰다. 판매량으로 검증된 스테디셀러를 꼼꼼히 비교해 사고, 정비 이력까지 직접 관리하는 전통의 오너 타입.",
    powertrainBadge: "⛽ 가솔린·하이브리드", rarityPercent: 8,
    topCars: ["기아 쏘렌토 하이브리드", "현대 그랜저", "현대 싼타페"],
    bestPayment: { method: "현금+할부", reason: "10년 보유 전제에서 총비용 최저의 정공법. 선수금을 최대로 해 이자 비용을 최소화하세요." },
    benefits: ["총 소유비용(TCO) 리포트", "금리 비교", "하이브리드 세제 혜택 정리"] },
};

const CIRCLED = ["①", "②", "③", "④", "⑤"];
export const circled = (n: number) => CIRCLED[n - 1] ?? `${n}.`;

// "CTEF" → "C · T · E · F"
export const formatTypeCode = (code: string) =>
  code.includes("·") ? code.replace(/·/g, " · ") : code.split("").join(" · ");

export const LEGAL_DISCLAIMER =
  "본 결과는 성향 진단에 따른 일반적 안내이며, 실제 금리·승인 여부·월 납입금은 금융사 심사에 따라 달라질 수 있습니다.";