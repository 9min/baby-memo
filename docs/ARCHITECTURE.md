# Architecture - Baby Memo 시스템 아키텍처

## 1. 시스템 개요

```
┌──────────────────────────────────────────────────────────┐
│                      클라이언트                             │
│  React 19 + TypeScript 5.9 + Vite 7 + PWA                │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ JoinPage │ │ HomePage │ │StatsPage │ │SettingsPage │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬──────┘  │
│       │      ┌──────┴──────┐     │              │          │
│       │      │TimelinePage │     │              │          │
│       │      └──────┬──────┘     │              │          │
│  ┌────▼─────────────▼────────────▼──────────────▼──────┐  │
│  │              Zustand Stores (7개)                     │  │
│  │  familyStore · activityStore · babyStore             │  │
│  │  supplementStore · statsStore · defaultsStore        │  │
│  │  themeStore                                          │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │           Supabase Client (JS SDK)                   │  │
│  │           REST API + Realtime WebSocket              │  │
│  └──────────────────────┬──────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase (Cloud)                           │
│                                                               │
│  ┌────────────────────┐  ┌──────────────────────────────┐   │
│  │   PostgreSQL        │  │  Realtime (WebSocket)        │   │
│  │   - families        │  │  - activities (INSERT/DELETE) │   │
│  │   - devices         │  │  - babies (INSERT/DELETE)     │   │
│  │   - activities      │  │  - supplement_presets         │   │
│  │   - babies          │  │    (INSERT/DELETE)            │   │
│  │   - supplement_     │  │  - family_id 필터 구독        │   │
│  │     presets         │  │                               │   │
│  └────────────────────┘  └──────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## 2. 인증/식별 모델

### 가족 코드 + 비밀번호 기반
```
가족 코드 입력 → families 테이블 조회
  ├── 미존재 → 가족방 생성 (비밀번호 자동 생성)
  └── 존재 → 4자리 비밀번호 입력 → 검증
                    ↓
              devices 테이블에 기기 등록
                    ↓
              localStorage에 코드 저장
                    ↓
              다음 방문 시 자동 복원
```

### 기기 식별
- `crypto.randomUUID()` → localStorage (`baby-memo-device-id`)
- 기기당 고유 UUID, 브라우저 데이터 삭제 전까지 유지
- 같은 기기에서 다른 가족방으로 이동 가능 (기존 방 나가기 → 새 코드 입력)

### 왜 Supabase Auth를 사용하지 않는가?
1. **대상 사용자**: 조부모 등 기술에 익숙하지 않은 사용자 포함
2. **진입 장벽 최소화**: 이메일/비밀번호, OAuth 모두 불필요
3. **MVP 단순화**: 인증 복잡도를 제거하고 핵심 기능에 집중
4. **가족 단위 공유**: 개인 계정이 아닌 가족방 단위로 데이터 관리

## 3. 데이터 모델

### ERD
```
families
├── id          UUID (PK, auto)
├── code        TEXT (UNIQUE, 6-8자, ^[A-Z0-9]+$)
├── password    TEXT (4자리 숫자, nullable)
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ

devices
├── id          UUID (PK, auto)
├── device_id   TEXT (UNIQUE)
├── family_id   UUID (FK → families.id, CASCADE)
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ

activities
├── id          UUID (PK, auto)
├── family_id   UUID (FK → families.id, CASCADE)
├── device_id   TEXT
├── type        TEXT (solid_food | drink | supplement | diaper | sleep | memo)
├── recorded_at TIMESTAMPTZ
├── metadata    JSONB (타입별 상세 데이터)
└── created_at  TIMESTAMPTZ

babies
├── id          UUID (PK, auto)
├── family_id   UUID (FK → families.id, CASCADE)
├── name        TEXT
├── birth_date  DATE
└── created_at  TIMESTAMPTZ

supplement_presets
├── id          UUID (PK, auto)
├── family_id   UUID (FK → families.id, CASCADE)
├── name        TEXT
├── sort_order  INTEGER (DEFAULT 0)
└── created_at  TIMESTAMPTZ
```

### 관계
- `families` 1:N `devices` (하나의 가족방에 여러 기기)
- `families` 1:N `activities` (하나의 가족방에 여러 활동 기록)
- `families` 1:N `babies` (하나의 가족방에 여러 아기)
- `families` 1:N `supplement_presets` (가족별 영양제 프리셋)
- `device_id`는 UNIQUE — 하나의 기기는 하나의 가족방에만 소속

### 활동 메타데이터 (JSONB)
```typescript
// solid_food
{ menu?: string, amount?: 'lots' | 'normal' | 'little' | 'refused', memo?: string }

// drink
{ drinkType: 'formula' | 'breast_milk' | 'water' | 'juice' | 'tea', amount?: number, memo?: string }

// supplement
{ items: string[], memo?: string }

// diaper
{ diaperType: 'pee' | 'poop' | 'mixed', amount?: 'lots' | 'normal' | 'little', memo?: string }

// sleep
{ startTime: string, endTime?: string, memo?: string }

// memo
{ content?: string }
```

### 보안 (MVP)
- RLS 비활성화 — 앱 레벨에서 `family_id` 필터링
- 가족방 접근에 4자리 비밀번호 필요
- Supabase anon key는 클라이언트에 노출되나, 테이블 구조가 단순하여 위험도 낮음

## 4. 프론트엔드 아키텍처

### 라우팅
```
/join           → JoinPage (공개, 가족 코드 입력)
/               → FamilyGuard → AppShell → HomePage
/timeline       → FamilyGuard → AppShell → TimelinePage
/stats          → FamilyGuard → AppShell → StatsPage
/settings       → FamilyGuard → AppShell → SettingsPage
```

### FamilyGuard 플로우
```
FamilyGuard 렌더링
  ├── initialized === false → 로딩 스피너
  ├── familyId === null → Navigate to /join
  └── familyId 존재 → <Outlet /> (자식 라우트 렌더링)
```

### 상태 관리 (Zustand — 7개 스토어)

```
familyStore
├── State: familyId, familyCode, familyPassword, deviceId, initialized
├── Actions: initialize, checkFamilyExists, joinOrCreate, updatePassword, leave, deleteFamily

activityStore
├── State: activities, selectedDate, loading, monthlyActivityDates
├── Actions: setSelectedDate, fetchActivities, fetchMonthlyActivityDates,
│            recordActivity, updateActivity, deleteActivity, subscribe, unsubscribe

babyStore
├── State: babies, loading
├── Actions: fetchBabies, addBaby, deleteBaby, subscribe, unsubscribe

supplementStore
├── State: presets, loading
├── Actions: fetchPresets, addPreset, deletePreset, subscribe, unsubscribe

statsStore
├── State: period, dateRange, activityCounts, drinkIntakes, sleepDurations, loading
├── Actions: setPeriod, navigatePrev, navigateNext, goToToday, fetchStats

defaultsStore (localStorage 영속)
├── State: defaults (familyId별 활동 기본값)
├── Actions: getDefaults, setSolidFoodDefaults, setDrinkDefaults,
│            setSupplementDefaults, setDiaperDefaults, clearDefaults

themeStore (localStorage 영속)
├── State: theme ('light' | 'dark' | 'system')
├── Actions: setTheme
```

### 컴포넌트 계층
```
App
├── BrowserRouter
│   └── AppRoutes
│       ├── /join → JoinPage
│       └── FamilyGuard
│           └── AppShell
│               ├── Outlet (페이지 컨텐츠)
│               │   ├── HomePage
│               │   │   ├── ActivityButton (x6)
│               │   │   ├── SolidFoodSheet / DrinkSheet / SupplementSheet / DiaperSheet / SleepSheet / MemoSheet
│               │   │   └── ActivityCard
│               │   ├── TimelinePage
│               │   │   ├── DateNavigator
│               │   │   ├── MonthlyCalendar (월별 뷰)
│               │   │   ├── ActivityCard
│               │   │   └── SolidFoodSheet / DrinkSheet / SupplementSheet / DiaperSheet / SleepSheet / MemoSheet
│               │   ├── StatsPage
│               │   │   ├── PeriodTabs
│               │   │   ├── StatsDateNavigator
│               │   │   ├── StatsSummaryCard
│               │   │   ├── ActivityCountChart
│               │   │   ├── DrinkIntakeChart
│               │   │   └── SleepDurationChart
│               │   └── SettingsPage
│               ├── BottomNav
│               │   ├── 홈 (/)
│               │   ├── 타임라인 (/timeline)
│               │   ├── 통계 (/stats)
│               │   └── 설정 (/settings)
│               └── InstallPrompt (PWA 설치 프롬프트)
```

## 5. 디렉토리 구조

```
src/
├── components/
│   ├── activity/      # 활동 기록 관련 (ActivityButton, ActivityCard, DateNavigator,
│   │                  #   MonthlyCalendar, TimePicker, *Sheet 6종)
│   ├── family/        # 가족 시스템 (FamilyGuard)
│   ├── layout/        # 레이아웃 (AppShell, BottomNav, InstallPrompt)
│   ├── stats/         # 통계 차트 (ActivityCountChart, DrinkIntakeChart,
│   │                  #   SleepDurationChart, StatsSummaryCard, StatsDateNavigator, PeriodTabs)
│   └── ui/            # shadcn/ui 컴포넌트 (alert-dialog, badge, button, card,
│                      #   checkbox, input, label, separator, sheet, tabs, textarea)
├── hooks/             # useFamily, useActivitySubscription, useTheme
├── lib/               # supabase, constants, deviceUtils, utils, activityConfig,
│                      #   timeGrouping, timeUtils, statsUtils, babyUtils,
│                      #   dataExport
├── pages/             # JoinPage, HomePage, TimelinePage, StatsPage, SettingsPage
├── stores/            # familyStore, activityStore, babyStore, supplementStore,
│                      #   statsStore, defaultsStore, themeStore
├── test/              # setup.ts, helpers/ (mockActivity, mockSupabase,
│                      #   renderWithRouter, zustandTestUtils)
├── types/             # database.ts, stats.ts
├── App.tsx
└── main.tsx
```

### 원칙
- **기능별 그룹핑**: `components/activity/`, `components/stats/` 등
- **단일 책임**: 각 파일은 하나의 역할만 담당
- **경로 Alias**: `@/` = `src/` (tsconfig + vite 설정)
- **shadcn/ui**: `components/ui/`에 위치, 직접 수정 가능
- **테스트 co-location**: 소스 파일 옆에 `.test.tsx` 배치

## 6. 데이터 흐름

### 가족방 참여 플로우
```
[사용자 코드 입력]
    │
    ▼
JoinPage.handleCodeSubmit()
    │
    ▼
familyStore.checkFamilyExists(code)
    │
    ├── 미존재 → joinOrCreate(code) → 가족방 생성 + 기기 등록
    └── 존재 → 비밀번호 입력 화면
                  │
                  ▼
              joinOrCreate(code, password) → 비밀번호 검증 + 기기 등록
    │
    ├── localStorage.setItem('baby-memo-family-code', code)
    │
    └── set({ familyId, familyCode })
           │
           ▼
    FamilyGuard: familyId 존재 → Outlet 렌더링
```

### 활동 기록 플로우
```
[홈 → 활동 버튼 탭]
    │
    ▼
ActivityButton → Sheet 열림 (SolidFoodSheet 등)
    │
    ▼
사용자 입력 → onSubmit(metadata, recordedAt)
    │
    ▼
activityStore.recordActivity({ familyId, deviceId, type, recordedAt, metadata })
    │
    ├── supabase.from('activities').insert(...)
    │
    └── Realtime 구독 → 낙관적 업데이트 → 즉시 UI 반영
```

### Realtime 구독 (활성)
```typescript
// useActivitySubscription에서 설정
supabase
  .channel(`activities:${familyId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'activities',
    filter: `family_id=eq.${familyId}`,
  }, handleInsert)
  .on('postgres_changes', {
    event: 'DELETE',
    ...
  }, handleDelete)
  .subscribe()
```

### 앱 초기화 플로우
```
App 마운트 → useFamily() → familyStore.initialize()
    │
    ├── localStorage에서 코드 읽기
    │   ├── 없음 → initialized = true (→ FamilyGuard → /join)
    │   └── 있음 → DB에서 family 조회
    │       ├── 유효 → familyId/familyCode 설정
    │       └── 무효 → localStorage 삭제
    │
    ├── initialized = true
    │
    └── useActivitySubscription() → Realtime 구독 시작
        ├── activities 구독
        ├── babies 구독
        └── supplement_presets 구독
```

## 7. 기술 스택 상세

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 19.2 |
| 언어 | TypeScript | 5.9 (strict) |
| 빌드 | Vite | 7.3 |
| 스타일링 | Tailwind CSS | 4.2 |
| UI 라이브러리 | shadcn/ui (new-york) | Radix UI 기반 |
| 상태관리 | Zustand | 5.0 |
| 라우팅 | React Router DOM | 7.13 |
| 백엔드 | Supabase (DB + Realtime) | JS SDK 2.97 |
| 차트 | Recharts | 3.7 |
| 날짜 | date-fns | 4.1 |
| 아이콘 | Lucide React | 0.575 |
| PWA | vite-plugin-pwa | 1.2 |
| 테스트 | Vitest + Testing Library | 4.0 / 16.3 |
| CI | GitHub Actions | PR checks |
