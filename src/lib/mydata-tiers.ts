export const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_BrxkQn/chat";

export type TierCar = {
  car: string;
  method: string;
  monthly: string;
};

export type TierBundle = {
  stable: TierCar;
  standard: TierCar;
  dream: TierCar;
};

export const TIER_CARS: Record<string, TierBundle> = {
  CTEF: {
    stable:   { car: "캐스퍼 일렉트릭", method: "리스",     monthly: "월 30만원대" },
    standard: { car: "EV3",             method: "리스",     monthly: "월 40만원대" },
    dream:    { car: "아이오닉5",       method: "리스",     monthly: "월 50만원대" },
  },
  CTES: {
    stable:   { car: "EV3",             method: "할부",     monthly: "월 40만원대" },
    standard: { car: "아이오닉5",       method: "할부",     monthly: "월 50만원대" },
    dream:    { car: "테슬라 모델3",    method: "할부",     monthly: "월 60만원대" },
  },
  CTGF: {
    stable:   { car: "트랙스 크로스오버", method: "장기렌트", monthly: "월 30만원대" },
    standard: { car: "셀토스",           method: "장기렌트", monthly: "월 40만원대" },
    dream:    { car: "MINI 쿠퍼",         method: "장기렌트", monthly: "월 60만원대" },
  },
  CTGS: {
    stable:   { car: "아반떼",           method: "할부",     monthly: "월 30만원대" },
    standard: { car: "K5",               method: "할부",     monthly: "월 40만원대" },
    dream:    { car: "제네시스 G70",     method: "할부",     monthly: "월 60만원대" },
  },
  CKEF: {
    stable:   { car: "레이 EV",          method: "리스",     monthly: "월 20만원대" },
    standard: { car: "코나 일렉트릭",    method: "리스",     monthly: "월 40만원대" },
    dream:    { car: "아이오닉6",        method: "리스",     monthly: "월 50만원대" },
  },
  CKES: {
    stable:   { car: "코나 일렉트릭",    method: "할부",     monthly: "월 40만원대" },
    standard: { car: "아이오닉6",        method: "할부",     monthly: "월 50만원대" },
    dream:    { car: "아이오닉5",        method: "할부",     monthly: "월 50만원대" },
  },
  CKGF: {
    stable:   { car: "레이",             method: "장기렌트", monthly: "월 20만원대" },
    standard: { car: "캐스퍼",           method: "장기렌트", monthly: "월 30만원대" },
    dream:    { car: "아반떼",           method: "장기렌트", monthly: "월 40만원대" },
  },
  CKGS: {
    stable:   { car: "캐스퍼",           method: "할부",     monthly: "월 20만원대" },
    standard: { car: "아반떼",           method: "할부",     monthly: "월 30만원대" },
    dream:    { car: "셀토스",           method: "할부",     monthly: "월 40만원대" },
  },
  WTEF: {
    stable:   { car: "EV3",              method: "리스",     monthly: "월 40만원대" },
    standard: { car: "아이오닉6",        method: "리스",     monthly: "월 50만원대" },
    dream:    { car: "테슬라 모델Y",     method: "리스",     monthly: "월 70만원대" },
  },
  WTES: {
    stable:   { car: "EV6",              method: "할부",     monthly: "월 50만원대" },
    standard: { car: "EV9",              method: "할부",     monthly: "월 70만원대" },
    dream:    { car: "아이오닉9",        method: "할부",     monthly: "월 80만원대" },
  },
  WTGF: {
    stable:   { car: "KGM 토레스",       method: "장기렌트", monthly: "월 30만원대" },
    standard: { car: "투싼",             method: "장기렌트", monthly: "월 40만원대" },
    dream:    { car: "팰리세이드",       method: "장기렌트", monthly: "월 60만원대" },
  },
  WTGS: {
    stable:   { car: "아반떼 N",         method: "할부",     monthly: "월 40만원대" },
    standard: { car: "쏘렌토",           method: "할부",     monthly: "월 50만원대" },
    dream:    { car: "제네시스 GV70",    method: "할부",     monthly: "월 70만원대" },
  },
  WKEF: {
    stable:   { car: "코나 일렉트릭",    method: "장기렌트", monthly: "월 40만원대" },
    standard: { car: "아이오닉6",        method: "장기렌트", monthly: "월 50만원대" },
    dream:    { car: "EV6",              method: "장기렌트", monthly: "월 60만원대" },
  },
  WKES: {
    stable:   { car: "코나 일렉트릭",    method: "할부",     monthly: "월 40만원대" },
    standard: { car: "아이오닉6",        method: "할부",     monthly: "월 50만원대" },
    dream:    { car: "EV9",              method: "할부",     monthly: "월 70만원대" },
  },
  WKGF: {
    stable:   { car: "쏘렌토 하이브리드", method: "장기렌트", monthly: "월 50만원대" },
    standard: { car: "카니발",            method: "장기렌트", monthly: "월 60만원대" },
    dream:    { car: "팰리세이드",        method: "장기렌트", monthly: "월 70만원대" },
  },
  WKGS: {
    stable:   { car: "싼타페 하이브리드", method: "할부",     monthly: "월 40만원대" },
    standard: { car: "쏘렌토 하이브리드", method: "할부",     monthly: "월 50만원대" },
    dream:    { car: "그랜저 하이브리드", method: "할부",     monthly: "월 60만원대" },
  },
};

export const TIER_LABELS = {
  stable:   { name: "안정형", tagline: "무리 없이 여유로운 선택" },
  standard: { name: "표준형", tagline: "내 조건에 균형 잡힌 선택" },
  dream:    { name: "드림형", tagline: "조금 욕심낸 선택" },
} as const;

export const MYDATA_DEMO_DISCLAIMER =
  "데모 화면의 수치는 서비스 이해를 돕기 위한 예시입니다.";