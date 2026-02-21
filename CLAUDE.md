# CLAUDE.md - Baby Memo 프로젝트 지침서

## 프로젝트 개요
아기 활동(이유식, 음료, 영양제, 기저귀, 수면)을 가족이 함께 실시간으로 기록하는 모바일 우선 웹앱.
**가족 코드 + 비밀번호** 기반으로 같은 방에 연결되어 Supabase Realtime으로 동기화.

## 기술 스택
- **프레임워크**: React 19 + TypeScript 5.9 (strict mode)
- **빌드**: Vite 7
- **스타일링**: Tailwind CSS 4 + shadcn/ui (new-york 스타일)
- **상태관리**: Zustand 5
- **라우팅**: React Router DOM 7
- **백엔드**: Supabase (DB + Realtime only, Auth 미사용)
- **차트**: Recharts 3
- **아이콘**: Lucide React
- **날짜**: date-fns 4
- **PWA**: vite-plugin-pwa

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
    activity/        # 활동 기록 (ActivityButton, ActivityCard, DateNavigator,
                     #   MonthlyCalendar, TimePicker, SolidFoodSheet, DrinkSheet,
                     #   SupplementSheet, DiaperSheet, SleepSheet)
    family/          # FamilyGuard (가족방 인증 가드)
    layout/          # AppShell, BottomNav, InstallPrompt
    stats/           # 통계 차트 (ActivityCountChart, DrinkIntakeChart,
                     #   SleepDurationChart, StatsSummaryCard, StatsDateNavigator, PeriodTabs)
    ui/              # shadcn/ui (alert-dialog, badge, button, card, checkbox,
                     #   input, label, separator, sheet, tabs, textarea)
  hooks/             # useFamily, useActivitySubscription, useTheme
  lib/               # supabase, constants, deviceUtils, utils, activityConfig,
                     #   timeGrouping, statsUtils, babyUtils, dataExport
  pages/             # JoinPage, HomePage, TimelinePage, StatsPage, SettingsPage
  stores/            # familyStore, activityStore, babyStore, supplementStore,
                     #   statsStore, defaultsStore, themeStore
  test/              # 테스트 셋업 및 헬퍼
  types/             # database.ts (Family, Device, Activity, Baby, SupplementPreset)
                     # stats.ts (StatsPeriod, DateRange, DailyActivityCount 등)
supabase/
  migrations/        # SQL 마이그레이션 (00001~00007)
docs/                # PRD, 아키텍처, 개발 플로우, Git 워크플로우
.github/
  workflows/         # CI 워크플로우 (ci.yml)
```

## 라우팅
```
/join       → JoinPage (공개)
/           → HomePage (인증 필요)
/timeline   → TimelinePage (인증 필요)
/stats      → StatsPage (인증 필요)
/settings   → SettingsPage (인증 필요)
```

## 코딩 컨벤션

### TypeScript
- `strict: true` 필수. `any` 사용 금지.
- `noUnusedLocals`, `noUnusedParameters` 활성화 — 미사용 변수/매개변수 금지.
- 인터페이스는 `src/types/database.ts`, `src/types/stats.ts`에 정의.
- `verbatimModuleSyntax` 사용 중 — 타입 import 시 `import type` 사용.

### React
- 함수형 컴포넌트만 사용 (화살표 함수).
- `export default`로 페이지/컴포넌트 내보내기.
- 경로 alias: `@/` = `src/` (예: `@/components/ui/button`).

### 스타일링
- Tailwind 유틸리티 클래스 사용. 인라인 스타일 금지.
- `cn()` 헬퍼로 조건부 클래스 병합 (`src/lib/utils.ts`).
- 모바일 우선: `max-w-lg` 컨테이너 기준.
- oklch 색상 시스템 (CSS 변수, `src/index.css`).
- 따뜻한 로즈 핑크 컬러 테마 (hue 350).
- Nunito Sans 구글 폰트.

### 상태관리
- Zustand store는 `src/stores/`에 위치 (7개 스토어).
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
- 기존 가족방 참여 시 4자리 비밀번호 필요.
- 기기 식별: `crypto.randomUUID()` → localStorage 저장.
- RLS 미사용. 앱 레벨에서 `family_id` 필터링.

## Supabase
- 클라이언트: `src/lib/supabase.ts`
- 환경변수: `.env.local`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- 마이그레이션: `supabase/migrations/` 디렉토리에 순번 prefix (00001~00007)
- Realtime 활성 테이블: `activities`, `babies`, `supplement_presets`

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

### 현황
- 37개 테스트 파일, 329개 테스트

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

## CI
- **GitHub Actions**: `.github/workflows/ci.yml`
- PR 생성/업데이트 시 자동 실행: typecheck → lint → test → build

## 주의사항
- `.env.local`은 절대 커밋하지 않음 (.gitignore에 포함됨).
- 빌드 전 반드시 `npm run typecheck` 통과 확인.
- 한국어 UI 텍스트 사용.
- 보안: 사용자 입력은 항상 검증. SQL injection, XSS 방지.
