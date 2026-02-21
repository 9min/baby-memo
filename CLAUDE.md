# CLAUDE.md - Baby Memo 프로젝트 지침서

## 프로젝트 개요
아기 활동(수유, 수면, 기저귀 등)을 가족이 함께 실시간으로 기록하는 모바일 우선 웹앱.
**가족 코드** 기반으로 같은 방에 연결되어 Supabase Realtime으로 동기화.

## 기술 스택
- **프레임워크**: React 19 + TypeScript 5.9 (strict mode)
- **빌드**: Vite 7
- **스타일링**: Tailwind CSS 4 + shadcn/ui (new-york 스타일)
- **상태관리**: Zustand 5
- **라우팅**: React Router DOM 7
- **백엔드**: Supabase (DB + Realtime only, Auth 미사용)
- **아이콘**: Lucide React
- **날짜**: date-fns 4

## 핵심 명령어
```bash
npm run dev           # 개발 서버 (Vite)
npm run build         # tsc -b && vite build (타입체크 + 빌드)
npm run typecheck     # tsc -b (타입체크만)
npm run lint          # ESLint
npm run preview       # 프로덕션 빌드 미리보기
npm test              # 전체 테스트 실행 (vitest run)
npm run test:watch    # 테스트 워치 모드 (vitest)
npm run test:coverage # 테스트 커버리지 리포트
```

## 프로젝트 구조
```
src/
  components/
    family/          # FamilyGuard (가족방 인증 가드)
    layout/          # AppShell, BottomNav
    ui/              # shadcn/ui 컴포넌트 (button, input, label)
  hooks/             # useFamily (familyStore 래퍼)
  lib/               # supabase 클라이언트, constants, deviceUtils, utils, timeGrouping
  pages/             # JoinPage, HomePage, TimelinePage, SettingsPage
  stores/            # familyStore (Zustand)
  test/              # 테스트 셋업 및 헬퍼
  types/             # database.ts (Family, Device 인터페이스)
supabase/
  migrations/        # SQL 마이그레이션 파일
docs/                # PRD, 아키텍처, 개발 플로우, Git 워크플로우
```

## 코딩 컨벤션

### TypeScript
- `strict: true` 필수. `any` 사용 금지.
- `noUnusedLocals`, `noUnusedParameters` 활성화 — 미사용 변수/매개변수 금지.
- 인터페이스는 `src/types/database.ts`에 정의.
- `verbatimModuleSyntax` 사용 중 — 타입 import 시 `import type` 사용.

### React
- 함수형 컴포넌트만 사용 (화살표 함수).
- `export default`로 페이지/컴포넌트 내보내기.
- 경로 alias: `@/` = `src/` (예: `@/components/ui/button`).

### 스타일링
- Tailwind 유틸리티 클래스 사용. 인라인 스타일 금지.
- `cn()` 헬퍼로 조건부 클래스 병합 (`src/lib/utils.ts`).
- 모바일 우선: `max-w-lg` 컨테이너 기준.

### 상태관리
- Zustand store는 `src/stores/`에 위치.
- 컴포넌트에서는 개별 selector로 구독 (리렌더링 최소화).
  ```ts
  // Good
  const familyId = useFamilyStore((s) => s.familyId)
  // Bad
  const store = useFamilyStore()
  ```

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx` (예: `FamilyGuard.tsx`)
- 유틸/훅: `camelCase.ts` (예: `useFamily.ts`, `deviceUtils.ts`)
- 페이지: `PascalCase.tsx` (예: `JoinPage.tsx`)

## 인증 모델 (중요)
- Supabase Auth를 **사용하지 않음**.
- 가족 코드(6-8자리, 영대문자+숫자)로 입장.
- 기기 식별: `crypto.randomUUID()` → localStorage 저장.
- RLS 미사용. 앱 레벨에서 `family_id` 필터링.

## Supabase
- 클라이언트: `src/lib/supabase.ts`
- 환경변수: `.env.local`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- 마이그레이션: `supabase/migrations/` 디렉토리에 순번 prefix

## shadcn/ui 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]
```
설정: `components.json` (new-york 스타일, `@/components/ui` 경로)

## 테스팅

### 스택
- **테스트 프레임워크**: Vitest 4 (globals 활성화)
- **렌더링**: @testing-library/react + @testing-library/user-event
- **DOM 단언**: @testing-library/jest-dom
- **환경**: jsdom

### 명령어
```bash
npm test              # 전체 테스트 (CI용)
npm run test:watch    # 워치 모드 (개발용)
npm run test:coverage # 커버리지 리포트
```

### 파일 규칙
- 테스트 파일은 소스 파일 옆에 co-locate: `Component.test.tsx`, `utils.test.ts`
- 테스트 헬퍼/셋업: `src/test/` 디렉토리
  - `setup.ts` — jest-dom, 전역 mock (Supabase, localStorage, crypto)
  - `helpers/renderWithRouter.tsx` — MemoryRouter 래퍼
  - `helpers/mockActivity.ts` — Activity 객체 팩토리
  - `helpers/mockSupabase.ts` — Supabase 체이닝 mock
  - `helpers/zustandTestUtils.ts` — 스토어 리셋/상태 주입

### 작성 규칙
- `describe` / `it` 패턴 사용, 한국어 또는 영어 테스트 이름.
- `vi.useFakeTimers()` + `vi.setSystemTime()` 으로 날짜/시간 고정.
- 컴포넌트 테스트는 `@testing-library/react`의 `screen` 쿼리 사용.
- `userEvent.setup()` 으로 유저 인터랙션 테스트 (fake timers 사용 시 `advanceTimers` 옵션 추가).

### 모킹 전략
- **Supabase**: `src/test/setup.ts`에서 전역 `vi.mock('@/lib/supabase')`. 테스트별로 `mockFrom.mockReturnValue()` 등으로 응답 조정.
- **localStorage**: jsdom 기본 제공, `afterEach`에서 `localStorage.clear()`.
- **crypto.randomUUID**: `setup.ts`에서 고정값 mock.
- **Zustand**: `store.setState()`로 직접 상태 주입, `resetAllStores()`로 테스트 간 정리.
- **React Router**: `renderWithRouter()` 헬퍼로 `MemoryRouter` 래핑.

## 주의사항
- `.env.local`은 절대 커밋하지 않음 (.gitignore에 포함됨).
- 빌드 전 반드시 `npm run typecheck` 통과 확인.
- 한국어 UI 텍스트 사용.
- 보안: 사용자 입력은 항상 검증. SQL injection, XSS 방지.
