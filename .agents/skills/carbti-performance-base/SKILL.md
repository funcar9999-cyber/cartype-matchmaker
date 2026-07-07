---
name: CarBTI 성능 기반 규칙
description: CarBTI 앱에 새 화면/기능을 추가할 때 지켜야 할 성능·인터랙션 규칙. 페이지·라우트·버튼·로딩 UI를 만들 때마다 자동 적용.
---

# CarBTI 성능 기반 규칙

새 화면·기능 추가 시 아래 규칙을 항상 따를 것. 기반 세팅(router preload, 페이지 전환 애니메이션, 폰트, 스크롤 복원)은 이미 전역에 적용되어 있으니 재작업하지 말 것.

## 1. 페이지 이동은 항상 `<Link>` 사용
- `@tanstack/react-router`의 `Link` 컴포넌트로만 라우팅.
- `<a href>`, `window.location`, 수동 `navigate()` 금지 (프리페치가 안 걸림).
- 프로그래매틱 이동이 꼭 필요할 때만 `useNavigate()`.

## 2. 버튼은 항상 shadcn `Button` 사용
- `src/components/ui/button.tsx`의 `Button` 컴포넌트 사용.
- `active:scale-[0.98]` 마이크로 인터랙션이 자동 적용됨.
- 커스텀 `<button>`을 직접 쓰지 말 것. 꼭 필요하면 동일한 `active:scale-[0.98] transition-transform duration-100` 유틸을 붙일 것.

## 3. 로딩 상태는 shadcn `Skeleton` 사용
- `src/components/ui/skeleton.tsx`의 `Skeleton` 컴포넌트로 스켈레톤 UI 구성.
- 스피너·"로딩중..." 텍스트만 두지 말 것 (체감 속도 저하).
- 데이터 페치는 TanStack Query loader + `useSuspenseQuery` 패턴 우선.

## 4. 이미지
- 대형 이미지는 `loading="lazy"` + `decoding="async"` 기본 적용.
- Above-the-fold 히어로 이미지에는 `fetchpriority="high"`.

## 5. 새 라우트 생성 시
- `src/routes/` 아래 파일 기반 라우팅 규칙만 사용 (`src/pages/` 금지).
- 각 라우트에 고유한 `head()` (title, description, og:title, og:description) 설정.
- 페이지 전환 애니메이션은 `__root.tsx`에서 이미 전역 적용됨 — 개별 라우트에 중복 추가 금지.

## 6. 하지 말 것
- `useEffect` + `fetch` 로 초기 데이터 로드 금지 → loader + Query.
- 무거운 라이브러리(예: framer-motion) 추가 전 CSS `animate-in`으로 대체 가능한지 검토.
- 다크모드/신규 폰트/커스텀 컬러를 요구 없이 추가하지 말 것.
