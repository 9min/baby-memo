# Architecture - Baby Memo 시스템 아키텍처

## 1. 시스템 개요

```
┌─────────────────────────────────────────────────┐
│                   클라이언트                       │
│  React 19 + TypeScript + Vite                    │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ JoinPage │  │ HomePage │  │ SettingsPage  │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │              │               │            │
│  ┌────▼──────────────▼───────────────▼────────┐  │
│  │           Zustand (familyStore)             │  │
│  │  familyId, familyCode, deviceId, nickname   │  │
│  └────────────────────┬───────────────────────┘  │
│                       │                           │
│  ┌────────────────────▼───────────────────────┐  │
│  │          Supabase Client (JS SDK)           │  │
│  │          REST API + Realtime WS             │  │
│  └────────────────────┬───────────────────────┘  │
└───────────────────────┼───────────────────────────┘
                        │ HTTPS / WSS
┌───────────────────────▼───────────────────────────┐
│                  Supabase (Cloud)                   │
│                                                     │
│  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  PostgreSQL   │  │  Realtime (WebSocket)      │  │
│  │  - families   │  │  - family_id 필터 구독      │  │
│  │  - devices    │  │  - INSERT/UPDATE/DELETE     │  │
│  └──────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 2. 인증/식별 모델

### 가족 코드 기반 (OAuth 대체)
```
가족 코드 입력 → families 테이블 조회/생성
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
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ

devices
├── id          UUID (PK, auto)
├── device_id   TEXT (UNIQUE)
├── family_id   UUID (FK → families.id, CASCADE)
├── nickname    TEXT (nullable)
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ
```

### 관계
- `families` 1:N `devices` (하나의 가족방에 여러 기기)
- `device_id`는 UNIQUE — 하나의 기기는 하나의 가족방에만 소속

### 보안 (MVP)
- RLS 비활성화 — 앱 레벨에서 `family_id` 필터링
- Supabase anon key는 클라이언트에 노출되나, 테이블 구조가 단순하여 위험도 낮음
- Phase 2에서 RLS 활성화 예정

## 4. 프론트엔드 아키텍처

### 라우팅
```
/join           → JoinPage (공개, 가족 코드 입력)
/               → FamilyGuard → AppShell → HomePage
/timeline       → FamilyGuard → AppShell → TimelinePage
/settings       → FamilyGuard → AppShell → SettingsPage
```

### FamilyGuard 플로우
```
FamilyGuard 렌더링
  ├── initialized === false → 로딩 스피너
  ├── familyId === null → Navigate to /join
  └── familyId 존재 → <Outlet /> (자식 라우트 렌더링)
```

### 상태 관리 (Zustand)
```
familyStore
├── State
│   ├── familyId: string | null
│   ├── familyCode: string | null
│   ├── deviceId: string
│   ├── nickname: string | null
│   └── initialized: boolean
├── Actions
│   ├── initialize()      → localStorage에서 코드 복원 + DB 검증
│   ├── joinOrCreate()    → 가족방 참여/생성 + 기기 등록
│   ├── leave()           → localStorage 삭제 + 상태 초기화
│   └── updateNickname()  → DB 닉네임 업데이트
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
│               └── BottomNav
│                   ├── 홈 (/)
│                   ├── 타임라인 (/timeline)
│                   └── 설정 (/settings)
```

## 5. 디렉토리 구조 원칙

```
src/
├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── family/        # 가족 시스템 관련 (FamilyGuard)
│   ├── layout/        # 레이아웃 (AppShell, BottomNav)
│   └── ui/            # shadcn/ui 원자 컴포넌트
├── hooks/             # 커스텀 React 훅
├── lib/               # 유틸리티, 외부 서비스 클라이언트
├── pages/             # 라우트별 페이지 컴포넌트
├── stores/            # Zustand 상태 저장소
└── types/             # TypeScript 타입/인터페이스 정의
```

### 원칙
- **기능별 그룹핑**: `components/family/`, `components/layout/` 등
- **단일 책임**: 각 파일은 하나의 역할만 담당
- **경로 Alias**: `@/` = `src/` (tsconfig + vite 설정)
- **shadcn/ui**: `components/ui/`에 위치, 직접 수정 가능

## 6. 데이터 흐름

### 가족방 참여 플로우
```
[사용자 코드 입력]
    │
    ▼
JoinPage.handleSubmit()
    │
    ▼
familyStore.joinOrCreate(code)
    │
    ├── supabase.from('families').select().eq('code', code)
    │   ├── 존재 → familyId = existing.id
    │   └── 미존재 → supabase.from('families').insert({code})
    │
    ├── supabase.from('devices').upsert({device_id, family_id})
    │
    ├── localStorage.setItem('baby-memo-family-code', code)
    │
    └── set({ familyId, familyCode })
           │
           ▼
    FamilyGuard: familyId 존재 → Outlet 렌더링
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
    └── initialized = true
```

## 7. 향후 확장 포인트

### Realtime 구독 (Phase 2)
```ts
supabase
  .channel(`family:${familyId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'activities',
    filter: `family_id=eq.${familyId}`,
  }, handleChange)
  .subscribe()
```

### 활동 기록 테이블 (Phase 2)
```sql
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references families(id) on delete cascade,
  device_id text references devices(device_id),
  type text not null,        -- 'feeding', 'sleep', 'diaper', 'bath'
  started_at timestamptz not null,
  ended_at timestamptz,
  memo text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
```
