// Phase 1: hardcoded car catalog. No pricing API, no live values.
// Prices are illustrative ranges; monthly figures are demo simulations.

export type Powertrain = "전기" | "하이브리드" | "가솔린" | "디젤";
export type Segment =
  | "경형"
  | "소형"
  | "준중형"
  | "중형"
  | "준대형"
  | "대형"
  | "SUV"
  | "MPV"
  | "프리미엄";

export interface Car {
  id: string;
  name: string;
  brand: string;
  segment: Segment;
  powertrain: Powertrain;
  emoji: string;
  gradient: string; // tailwind gradient classes for thumbnail
  priceRange: string; // "3,200~3,900만원"
  priceMinManwon: number; // for filtering
  priceMaxManwon: number;
  monthlyDemo: {
    installment: string; // "월 40만원대"
    lease: string;
    rent: string;
  };
  highlights: [string, string, string];
  aliases?: string[];
  isImport?: boolean;
  image_url?: string;
}

const IMPORT_BRANDS = new Set(["테슬라", "MINI", "BMW", "벤츠", "아우디", "볼보", "폭스바겐", "포르쉐", "렉서스", "토요타"]);
export function isImportBrand(brand: string): boolean {
  return IMPORT_BRANDS.has(brand);
}

const CAR_DB_RAW: Car[] = [
  { id: "casper-ev", name: "캐스퍼 일렉트릭", brand: "현대", segment: "경형", powertrain: "전기",
    emoji: "🔋", gradient: "from-sky-200 to-blue-300",
    priceRange: "2,700~3,150만원 (예시)", priceMinManwon: 2700, priceMaxManwon: 3150,
    monthlyDemo: { installment: "월 40만원대 (예시)", lease: "월 30만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["도심 주차에 유리한 경형 사이즈", "국고·지자체 보조금 대상", "1회 충전 315km급 인증"],
    aliases: ["현대 캐스퍼 일렉트릭"] },
  { id: "ray-ev", name: "레이 EV", brand: "기아", segment: "경형", powertrain: "전기",
    emoji: "🔌", gradient: "from-emerald-200 to-teal-300",
    priceRange: "2,700~3,000만원 (예시)", priceMinManwon: 2700, priceMaxManwon: 3000,
    monthlyDemo: { installment: "월 30만원대 (예시)", lease: "월 20만원대 (예시)", rent: "월 30만원대 (예시)" },
    highlights: ["박스형 실내로 적재 활용도 높음", "경형 EV 보조금 상위권", "도심 단거리 주행에 적합"],
    aliases: ["기아 레이 EV"] },
  { id: "ev3", name: "EV3", brand: "기아", segment: "SUV", powertrain: "전기",
    emoji: "⚡", gradient: "from-indigo-200 to-purple-300",
    priceRange: "4,200~4,900만원 (예시)", priceMinManwon: 4200, priceMaxManwon: 4900,
    monthlyDemo: { installment: "월 50만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 50만원대 (예시)" },
    highlights: ["소형 SUV 전기차 인기권", "1회 충전 500km 안팎 인증", "e-GMP 기반 초급속 충전 지원"],
    aliases: ["기아 EV3", "기아 EV3 GT라인", "EV3 GT라인"] },
  { id: "kona-ev", name: "코나 일렉트릭", brand: "현대", segment: "SUV", powertrain: "전기",
    emoji: "🌿", gradient: "from-lime-200 to-green-300",
    priceRange: "4,300~4,900만원 (예시)", priceMinManwon: 4300, priceMaxManwon: 4900,
    monthlyDemo: { installment: "월 50만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["소형 전기 SUV 스테디셀러", "가족용으로도 무난한 실용 공간", "보조금·저리 할부 프로그램 활발"],
    aliases: ["현대 코나 일렉트릭"] },
  { id: "ev5", name: "EV5", brand: "기아", segment: "SUV", powertrain: "전기",
    emoji: "🚙", gradient: "from-cyan-200 to-sky-300",
    priceRange: "4,900~5,700만원 (예시)", priceMinManwon: 4900, priceMaxManwon: 5700,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["중형 전기 SUV 신규 라인업", "패밀리 주행 공간 충분", "장거리 항속 지향 세팅"],
    aliases: ["기아 EV5"] },
  { id: "ioniq5", name: "아이오닉5", brand: "현대", segment: "SUV", powertrain: "전기",
    emoji: "🛰️", gradient: "from-blue-200 to-indigo-300",
    priceRange: "5,200~6,100만원 (예시)", priceMinManwon: 5200, priceMaxManwon: 6100,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["800V 초급속 충전 대응", "V2L 외부 급전 활용성", "국내 EV 인지도 상위권"],
    aliases: ["현대 아이오닉5"] },
  { id: "ioniq6", name: "아이오닉6", brand: "현대", segment: "준대형", powertrain: "전기",
    emoji: "🌊", gradient: "from-slate-200 to-blue-300",
    priceRange: "5,000~5,900만원 (예시)", priceMinManwon: 5000, priceMaxManwon: 5900,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 50만원대 (예시)" },
    highlights: ["세단형 전기차 항속 상위권", "낮은 공기저항 계수", "장거리 통근에 유리한 세팅"],
    aliases: ["현대 아이오닉6"] },
  { id: "ev6", name: "EV6", brand: "기아", segment: "SUV", powertrain: "전기",
    emoji: "🏎️", gradient: "from-fuchsia-200 to-purple-300",
    priceRange: "5,300~6,300만원 (예시)", priceMinManwon: 5300, priceMaxManwon: 6300,
    monthlyDemo: { installment: "월 70만원대 (예시)", lease: "월 60만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["e-GMP 기반 스포티한 주행감", "초급속 충전 대응", "GT 라인업 등 옵션 다양"],
    aliases: ["기아 EV6"] },
  { id: "ev9", name: "EV9", brand: "기아", segment: "SUV", powertrain: "전기",
    emoji: "🚐", gradient: "from-stone-200 to-slate-300",
    priceRange: "7,700~8,700만원 (예시)", priceMinManwon: 7700, priceMaxManwon: 8700,
    monthlyDemo: { installment: "월 90만원대 (예시)", lease: "월 70만원대 (예시)", rent: "월 80만원대 (예시)" },
    highlights: ["대형 전기 SUV 플래그십", "3열 6~7인승 구성", "OTA 소프트웨어 업데이트"],
    aliases: ["기아 EV9"] },
  { id: "ioniq9", name: "아이오닉9", brand: "현대", segment: "SUV", powertrain: "전기",
    emoji: "🛸", gradient: "from-indigo-200 to-slate-300",
    priceRange: "7,500~8,500만원 (예시)", priceMinManwon: 7500, priceMaxManwon: 8500,
    monthlyDemo: { installment: "월 90만원대 (예시)", lease: "월 80만원대 (예시)", rent: "월 80만원대 (예시)" },
    highlights: ["대형 전기 SUV 신규 라인업", "장거리 항속 지향", "패밀리·업무용 공간감"],
    aliases: ["현대 아이오닉9"] },
  { id: "tesla-model3", name: "모델3", brand: "테슬라", segment: "준중형", powertrain: "전기",
    emoji: "⚡", gradient: "from-neutral-200 to-slate-300",
    priceRange: "5,000~6,300만원 (예시)", priceMinManwon: 5000, priceMaxManwon: 6300,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["세단형 EV 세계 판매 상위권", "슈퍼차저 인프라 활용", "OTA 업데이트"],
    aliases: ["테슬라 모델3"] },
  { id: "tesla-modely", name: "모델Y", brand: "테슬라", segment: "SUV", powertrain: "전기",
    emoji: "🅨", gradient: "from-zinc-200 to-neutral-300",
    priceRange: "5,500~7,000만원 (예시)", priceMinManwon: 5500, priceMaxManwon: 7000,
    monthlyDemo: { installment: "월 70만원대 (예시)", lease: "월 60만원대 (예시)", rent: "월 70만원대 (예시)" },
    highlights: ["글로벌 EV SUV 판매 상위권", "슈퍼차저 인프라 활용", "가족·업무 겸용 공간"],
    aliases: ["테슬라 모델Y"] },
  { id: "casper", name: "캐스퍼", brand: "현대", segment: "경형", powertrain: "가솔린",
    emoji: "🚗", gradient: "from-yellow-200 to-orange-200",
    priceRange: "1,400~1,900만원 (예시)", priceMinManwon: 1400, priceMaxManwon: 1900,
    monthlyDemo: { installment: "월 20만원대 (예시)", lease: "월 20만원대 (예시)", rent: "월 30만원대 (예시)" },
    highlights: ["경차 취등록세 감면", "도심 주차 유리", "유지비 부담이 낮은 편"] },
  { id: "ray", name: "레이", brand: "기아", segment: "경형", powertrain: "가솔린",
    emoji: "🚙", gradient: "from-amber-200 to-yellow-200",
    priceRange: "1,400~1,900만원 (예시)", priceMinManwon: 1400, priceMaxManwon: 1900,
    monthlyDemo: { installment: "월 20만원대 (예시)", lease: "월 20만원대 (예시)", rent: "월 20만원대 (예시)" },
    highlights: ["박스형 실내 공간 활용도", "경차 취등록세 감면", "도심·근거리 이동에 적합"] },
  { id: "avante", name: "아반떼", brand: "현대", segment: "준중형", powertrain: "가솔린",
    emoji: "🚘", gradient: "from-sky-200 to-cyan-300",
    priceRange: "2,000~2,900만원 (예시)", priceMinManwon: 2000, priceMaxManwon: 2900,
    monthlyDemo: { installment: "월 30만원대 (예시)", lease: "월 30만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["국내 준중형 세단 스테디셀러", "연비·유지비 균형", "하이브리드 트림 선택 가능"],
    aliases: ["현대 아반떼"] },
  { id: "avante-n", name: "아반떼 N", brand: "현대", segment: "준중형", powertrain: "가솔린",
    emoji: "🏁", gradient: "from-red-200 to-orange-300",
    priceRange: "3,300~3,700만원 (예시)", priceMinManwon: 3300, priceMaxManwon: 3700,
    monthlyDemo: { installment: "월 40만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["국산 고성능 준중형", "N 브랜드 전용 세팅", "일상+주말 트랙 겸용"] },
  { id: "k5", name: "K5", brand: "기아", segment: "중형", powertrain: "가솔린",
    emoji: "🚗", gradient: "from-rose-200 to-pink-300",
    priceRange: "2,800~3,600만원 (예시)", priceMinManwon: 2800, priceMaxManwon: 3600,
    monthlyDemo: { installment: "월 40만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["중형 세단 인기 모델", "디자인·트림 선택폭 넓음", "하이브리드 트림 존재"] },
  { id: "seltos", name: "셀토스", brand: "기아", segment: "SUV", powertrain: "가솔린",
    emoji: "🚙", gradient: "from-orange-200 to-amber-300",
    priceRange: "2,300~3,200만원 (예시)", priceMinManwon: 2300, priceMaxManwon: 3200,
    monthlyDemo: { installment: "월 30만원대 (예시)", lease: "월 30만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["소형 SUV 인기권", "디자인·컬러 옵션 다양", "도심·근교 겸용에 적합"] },
  { id: "trax", name: "트랙스 크로스오버", brand: "쉐보레", segment: "SUV", powertrain: "가솔린",
    emoji: "🚘", gradient: "from-blue-200 to-slate-300",
    priceRange: "2,300~3,100만원 (예시)", priceMinManwon: 2300, priceMaxManwon: 3100,
    monthlyDemo: { installment: "월 30만원대 (예시)", lease: "월 30만원대 (예시)", rent: "월 30만원대 (예시)" },
    highlights: ["크로스오버 감성 디자인", "가성비 트림 구성", "국내 조립 생산"],
    aliases: ["쉐보레 트랙스 크로스오버"] },
  { id: "mini-cooper", name: "MINI 쿠퍼", brand: "MINI", segment: "소형", powertrain: "가솔린",
    emoji: "🚗", gradient: "from-pink-200 to-rose-300",
    priceRange: "3,600~4,600만원 (예시)", priceMinManwon: 3600, priceMaxManwon: 4600,
    monthlyDemo: { installment: "월 50만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["아이코닉 디자인 브랜드", "커스터마이즈 옵션 다양", "도심 주행 감성 강점"] },
  { id: "tucson", name: "투싼", brand: "현대", segment: "SUV", powertrain: "하이브리드",
    emoji: "🚙", gradient: "from-teal-200 to-emerald-300",
    priceRange: "2,900~3,900만원 (예시)", priceMinManwon: 2900, priceMaxManwon: 3900,
    monthlyDemo: { installment: "월 40만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["준중형 SUV 스테디셀러", "가솔린·하이브리드 선택 가능", "패밀리 사용성 무난"] },
  { id: "sportage", name: "스포티지", brand: "기아", segment: "SUV", powertrain: "하이브리드",
    emoji: "🚘", gradient: "from-emerald-200 to-lime-300",
    priceRange: "2,800~3,800만원 (예시)", priceMinManwon: 2800, priceMaxManwon: 3800,
    monthlyDemo: { installment: "월 40만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 40만원대 (예시)" },
    highlights: ["국내 준중형 SUV 인기권", "하이브리드 연비 우수", "패밀리·아웃도어 겸용"] },
  { id: "torres", name: "토레스", brand: "KGM", segment: "SUV", powertrain: "가솔린",
    emoji: "🛻", gradient: "from-stone-200 to-amber-200",
    priceRange: "2,900~3,500만원 (예시)", priceMinManwon: 2900, priceMaxManwon: 3500,
    monthlyDemo: { installment: "월 40만원대 (예시)", lease: "월 30만원대 (예시)", rent: "월 30만원대 (예시)" },
    highlights: ["가성비 중형 SUV", "박스형 디자인 개성", "아웃도어 컨셉 활용"],
    aliases: ["KGM 토레스"] },
  { id: "santafe-hev", name: "싼타페 하이브리드", brand: "현대", segment: "SUV", powertrain: "하이브리드",
    emoji: "🚙", gradient: "from-orange-200 to-red-200",
    priceRange: "3,900~4,900만원 (예시)", priceMinManwon: 3900, priceMaxManwon: 4900,
    monthlyDemo: { installment: "월 50만원대 (예시)", lease: "월 40만원대 (예시)", rent: "월 50만원대 (예시)" },
    highlights: ["중형 SUV 하이브리드", "패밀리 3열 옵션", "연비·정숙성 균형"] },
  { id: "sorento-hev", name: "쏘렌토 하이브리드", brand: "기아", segment: "SUV", powertrain: "하이브리드",
    emoji: "🚐", gradient: "from-slate-200 to-stone-300",
    priceRange: "3,800~4,800만원 (예시)", priceMinManwon: 3800, priceMaxManwon: 4800,
    monthlyDemo: { installment: "월 50만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 50만원대 (예시)" },
    highlights: ["국내 중형 SUV 하이브리드 인기권", "패밀리 6/7인승 옵션", "연비·안전보조 사양 개선"],
    aliases: ["기아 쏘렌토 하이브리드", "기아 쏘렌토", "쏘렌토"] },
  { id: "carnival", name: "카니발", brand: "기아", segment: "MPV", powertrain: "하이브리드",
    emoji: "🚌", gradient: "from-neutral-200 to-stone-300",
    priceRange: "3,800~5,500만원 (예시)", priceMinManwon: 3800, priceMaxManwon: 5500,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["국내 미니밴 대표 모델", "다인 가족·업무용에 적합", "하이브리드 트림 존재"],
    aliases: ["기아 카니발"] },
  { id: "palisade", name: "팰리세이드", brand: "현대", segment: "SUV", powertrain: "가솔린",
    emoji: "🚙", gradient: "from-slate-300 to-zinc-400",
    priceRange: "4,300~5,900만원 (예시)", priceMinManwon: 4300, priceMaxManwon: 5900,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 60만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["대형 SUV 플래그십", "3열 8인승까지 구성 가능", "패밀리 장거리에 적합"],
    aliases: ["현대 팰리세이드"] },
  { id: "grandeur-hev", name: "그랜저 하이브리드", brand: "현대", segment: "준대형", powertrain: "하이브리드",
    emoji: "🚗", gradient: "from-zinc-200 to-slate-400",
    priceRange: "4,300~5,500만원 (예시)", priceMinManwon: 4300, priceMaxManwon: 5500,
    monthlyDemo: { installment: "월 60만원대 (예시)", lease: "월 50만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["국내 준대형 세단 판매 상위권", "하이브리드 연비 우수", "정숙성·주행 편의 강점"],
    aliases: ["현대 그랜저", "그랜저"] },
  { id: "gv70", name: "제네시스 GV70", brand: "제네시스", segment: "프리미엄", powertrain: "가솔린",
    emoji: "🏁", gradient: "from-neutral-300 to-zinc-400",
    priceRange: "5,500~7,300만원 (예시)", priceMinManwon: 5500, priceMaxManwon: 7300,
    monthlyDemo: { installment: "월 80만원대 (예시)", lease: "월 70만원대 (예시)", rent: "월 70만원대 (예시)" },
    highlights: ["프리미엄 준중형 SUV", "국산 럭셔리 브랜드", "주행 완성도·정숙성 강점"] },
  { id: "g70", name: "제네시스 G70", brand: "제네시스", segment: "프리미엄", powertrain: "가솔린",
    emoji: "🏎️", gradient: "from-stone-300 to-neutral-400",
    priceRange: "4,700~6,300만원 (예시)", priceMinManwon: 4700, priceMaxManwon: 6300,
    monthlyDemo: { installment: "월 70만원대 (예시)", lease: "월 60만원대 (예시)", rent: "월 60만원대 (예시)" },
    highlights: ["국산 프리미엄 스포츠 세단", "후륜구동 주행감", "제네시스 브랜드 편의사양"] },
];

export const CAR_DB: Car[] = CAR_DB_RAW.map((c) => ({ ...c, isImport: isImportBrand(c.brand) }));

export function findCarByName(name: string): Car | undefined {
  const trimmed = name.trim();
  return CAR_DB.find(
    (c) =>
      c.name === trimmed ||
      `${c.brand} ${c.name}` === trimmed ||
      c.aliases?.some((a) => a === trimmed) ||
      trimmed.includes(c.name),
  );
}

export function getCarId(name: string): string | undefined {
  return findCarByName(name)?.id;
}

export const POWERTRAIN_FILTERS = [
  { key: "all", label: "전체" },
  { key: "전기", label: "전기" },
  { key: "하이브리드", label: "하이브리드" },
  { key: "가솔린", label: "가솔린" },
] as const;

export const PRICE_FILTERS = [
  { key: "all", label: "전체 가격" },
  { key: "low", label: "~3천만" },
  { key: "mid", label: "3~5천만" },
  { key: "high", label: "5천만↑" },
] as const;

export const CAR_LIST_DISCLAIMER =
  "예시 가격 · 트림별 상이 · 공식 가격표 기준 업데이트 예정";

export const COMPARE_LEGAL_NOTE =
  "월 납입 예시는 통상 조건 기준 시뮬레이션입니다. 선수금 20%·60개월 할부 / 잔가 50%·48개월 리스 / 보험포함 48개월 렌트 통상 조건 기준.";

export const CAR_LEGAL_DISCLAIMER =
  "본 정보는 일반적 안내이며, 실제 가격·금리·승인 여부·월 납입금은 트림·옵션·금융사 심사에 따라 달라질 수 있습니다.";

// 3-way structural comparison rows (S11 table)
export interface CompareRow {
  label: string;
  installment: string;
  lease: string;
  rent: string;
}

export const COMPARE_ROWS: CompareRow[] = [
  { label: "명의",           installment: "본인",              lease: "리스사",           rent: "렌트사" },
  { label: "초기 비용",       installment: "선수금·취등록세",     lease: "선수금(선택)",     rent: "보증금·선수금(선택)" },
  { label: "월 부담 구성",    installment: "원리금(이자 포함)",   lease: "리스료(잔가 반영)", rent: "렌트료(보험·정비 포함)" },
  { label: "자동차 보험",     installment: "본인 가입",          lease: "본인 가입",         rent: "렌트료에 포함" },
  { label: "세금",           installment: "본인 부담",          lease: "리스료에 포함(통상)",         rent: "렌트사 부담" },
  { label: "번호판",         installment: "일반 번호판",         lease: "일반/전용 선택",    rent: "허·하·호 등 렌트 번호판" },
  { label: "사업자 비용처리", installment: "감가상각",           lease: "리스료 손비 처리",   rent: "렌트료 손비 처리" },
  { label: "중도 해지",       installment: "잔액 상환",          lease: "위약금 발생",       rent: "위약금 발생" },
  { label: "만기 후",         installment: "완전 소유",          lease: "인수·반납·재리스",   rent: "반납(인수 옵션 상품 있음)" },
  { label: "이런 분께",       installment: "장기 보유·소유 선호", lease: "짧은 교체 주기·잔가 부담 이전", rent: "관리 부담 최소화·비용처리 필요" },
];

// FAQ (S12)
export interface FaqItem { q: string; a: string; }
export const CONSULT_FAQ: FaqItem[] = [
  { q: "상담은 무료인가요?",
    a: "네, 상담 자체는 무료이며 계약이 성사되면 제휴 금융사로부터 대리·중개 수수료를 받는 구조입니다. 소비자에게 별도 비용을 청구하지 않습니다." },
  { q: "제 신용점수가 낮아도 진행 가능한가요?",
    a: "가능한 상품 범위가 달라질 수 있어요. 상담 시 조건에 맞는 대안(공동명의·장기렌트 등)을 함께 안내드립니다." },
  { q: "카BTI 유형 결과는 왜 알려드리는 게 좋은가요?",
    a: "차량 선호·이용 패턴을 요약한 값이라 상담 시간이 줄어들고, 맞지 않는 상품을 권유받는 일을 예방할 수 있어요." },
  { q: "실제 견적은 언제 받을 수 있나요?",
    a: "차량·트림·희망 조건이 확정되면 제휴 금융사 심사를 거쳐 통상 1~2영업일 안에 실제 견적을 회신드립니다." },
  { q: "개인정보는 안전하게 관리되나요?",
    a: "상담 목적 외에는 사용하지 않으며, 마이데이터 조회 정보는 언제든 해지·삭제 요청이 가능합니다." },
];
