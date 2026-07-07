export type CarbtiType = {
  code: string;
  name: string;
  powertrainBadge: string;
  description: string;
  rarityPercent: number;
  recommendedCars: { rank: number; model: string; priceFrom: number }[];
  optimalPayment: string;
  subtitle: string;
};

export const CARBTI_TYPES: Record<string, CarbtiType> = {
  CTEF: {
    code: "C·T·E·F",
    name: "도시의 트렌드세터",
    powertrainBadge: "🔋 얼리어답터",
    description:
      "매일 스마트하게 도시를 누비지만 3~4년마다 새로운 감성을 원하는 당신",
    rarityPercent: 12,
    recommendedCars: [
      { rank: 1, model: "BMW 1시리즈", priceFrom: 3890 },
      { rank: 2, model: "벤츠 A클래스", priceFrom: 4290 },
      { rank: 3, model: "아우디 A3", priceFrom: 4100 },
    ],
    optimalPayment: "36개월 리스 · 잔가 40% 옵션",
    subtitle: "감성과 유동성의 조합",
  },
};

const CIRCLED = ["①", "②", "③", "④", "⑤"];
export const circled = (n: number) => CIRCLED[n - 1] ?? `${n}.`;

export const formatManwon = (n: number) =>
  `${n.toLocaleString("ko-KR")}만원~`;

export const formatTypeCode = (code: string) =>
  code.replace(/·/g, " · ");