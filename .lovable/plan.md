# CarBTI 홈 화면 구현 계획

프리미엄 핀테크 톤의 모바일 우선 홈 화면을 TanStack Start 라우트로 구축합니다.

## 1. 디자인 토큰 (`src/styles.css`)
- `:root`에 브랜드 컬러 추가 (oklch 변환)
  - `--brand-primary`: #0F7FFF
  - `--brand-accent`: #6B47FF
  - `--brand-amber`: #F59E0B
- `@theme inline`에 매핑 (`--color-brand-primary` 등) → `bg-brand-primary`, `text-brand-primary` 유틸 사용 가능
- Pretendard 웹폰트 `<link>`는 `__root.tsx` head에 추가, `--font-sans`에 Pretendard 우선 지정

## 2. 라우트 구조
- `src/routes/index.tsx`를 CarBTI 홈으로 교체 (기존 placeholder 제거)
- 홈 화면 UI는 컴포넌트로 분리:
  - `src/components/home/TopBar.tsx`
  - `src/components/home/HeroCard.tsx`
  - `src/components/home/TrustStrip.tsx`
  - `src/components/home/QuickActions.tsx` (서브 옵션 2카드)
  - `src/components/home/TypeShowcase.tsx`
  - `src/components/home/BottomTabBar.tsx`
  - `src/components/home/FloatingChatButton.tsx`
- `index.tsx`는 이들을 조립하고 `head()`로 SEO 메타 설정
  - title: "CarBTI · 1분 자동차 DNA 진단", description, og:title/description, twitter:card

## 3. 레이아웃 셸
- 최상위 컨테이너: `mx-auto max-w-[480px] min-h-screen bg-background relative`
- TopBar는 `sticky top-0 z-40`, BottomTabBar는 `sticky bottom-0 z-40`
- 콘텐츠 영역 `px-4 py-4 pb-24 space-y-3` (탭바 겹침 방지 패딩)
- FloatingChatButton은 `fixed bottom-20 right-4`이되, 480px 컨테이너 안쪽 정렬을 위해 컨테이너 내부에서 `absolute`로 배치하거나 `left-1/2 translate-x-[...]` 계산 → **컨테이너 내부 `absolute bottom-20 right-4`** 방식 채택 (데스크톱에서도 카드 안쪽에 뜨도록)

## 4. 각 섹션 상세
- **TopBar**: 로고 텍스트 파란색 15px/500, 우측 알림·프로필 22px border rounded-md 버튼
- **HeroCard**: `bg-gradient-to-br from-[#0F7FFF] to-[#6B47FF]` 대신 스타일 토큰 사용 (`--gradient-hero`), 흰색 텍스트, NEW 배지, 2줄 타이틀, CTA 흰버튼(파란 텍스트), 메타 텍스트
- **TrustStrip**: bg-slate-50, 2줄 안내
- **QuickActions**: `grid grid-cols-2 gap-2`, 각 카드 border + 아이콘 박스
- **TypeShowcase**: 단일 카드, 라벨/제목/태그 3개
- **BottomTabBar**: 4탭 flex-1, 홈만 active(파란색)
- **FloatingChatButton**: 앰버 원형, 💬 이모지, shadow-lg, onClick alert

## 5. 인터랙션
- CTA/카드 클릭 핸들러는 `console.log(route)` (아직 실제 라우트 없음)
- 플로팅 버튼은 `alert('상담 예약 페이지 준비 중')`

## 6. 범위 외 (후속)
- 실제 `/diagnosis/onboarding`, `/vehicles`, `/compare`, `/types/CTEF` 라우트 파일
- 다크 모드 토큰 튜닝
- 실제 알림/프로필 페이지

## 기술 노트
- `<a>`가 아닌 임시 버튼 사용 (라우트 미존재 시 TanStack `<Link>` 타입 에러 방지)
- 컬러는 인라인 hex 대신 `styles.css` 토큰 → 컴포넌트에서 `bg-brand-primary` 등으로 사용
- 그라디언트는 `--gradient-hero: linear-gradient(135deg, #0F7FFF, #6B47FF)` 정의 후 `style={{ background: 'var(--gradient-hero)' }}`
- 이모지는 그대로 사용 (사양서에 명시)
