# Development Guide - Baby Memo 개발 플로우

## 1. 환경 설정

### 필수 도구
- Node.js 20+
- npm 10+
- Git

### 초기 설정
```bash
# 저장소 클론
git clone <repository-url>
cd baby-memo

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase URL과 anon key 입력
```

### 환경변수
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |

## 2. 개발 서버

```bash
# 개발 서버 시작 (HMR 지원)
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### Vite 설정 특이사항
- `@/` 경로 alias → `src/` 매핑 (vite.config.ts + tsconfig)
- Tailwind CSS는 Vite 플러그인으로 통합 (`@tailwindcss/vite`)
- React Fast Refresh 활성화
- PWA 지원: `vite-plugin-pwa` (manifest, service worker 자동 생성)

## 3. 코드 품질

### 타입체크
```bash
npm run typecheck   # tsc -b
```
- `strict: true` 모드
- `noUnusedLocals`, `noUnusedParameters` 활성화
- 빌드 시 자동으로 타입체크 포함 (`tsc -b && vite build`)

### 린트
```bash
npm run lint        # ESLint
```
- TypeScript ESLint 규칙 적용
- React Hooks 규칙 검증
- React Refresh 규칙 검증

### 빌드 검증
```bash
npm run build       # 타입체크 + 프로덕션 빌드
```
- PR 머지 전 반드시 `npm run build` 성공 확인

## 4. 테스팅

### 스택
- **테스트 프레임워크**: Vitest 4 (globals 활성화)
- **렌더링**: @testing-library/react + @testing-library/user-event
- **DOM 단언**: @testing-library/jest-dom
- **환경**: jsdom

### 명령어
```bash
npm test              # 전체 테스트 실행 (CI용)
npm run test:watch    # 워치 모드 (개발용)
npm run test:coverage # 커버리지 리포트
```

### 테스트 현황
- **총 37개 테스트 파일**, 329개 테스트
- 페이지 테스트 5개, 스토어 테스트 5개, 훅 테스트 2개
- 컴포넌트 테스트: activity 9개, layout 2개 + family 1개, stats 6개
- 유틸리티 테스트: lib 6개, App 1개

### 파일 규칙
- 테스트 파일은 소스 파일 옆에 co-locate: `Component.test.tsx`, `utils.test.ts`
- 테스트 헬퍼/셋업: `src/test/` 디렉토리
  - `setup.ts` — jest-dom, 전역 mock (Supabase, localStorage, crypto)
  - `helpers/renderWithRouter.tsx` — MemoryRouter 래퍼
  - `helpers/mockActivity.ts` — Activity 객체 팩토리
  - `helpers/mockSupabase.ts` — Supabase 체이닝 mock
  - `helpers/zustandTestUtils.ts` — 스토어 리셋/상태 주입

### 작성 규칙
- `describe` / `it` 패턴 사용, 한국어 또는 영어 테스트 이름
- `vi.useFakeTimers()` + `vi.setSystemTime()` 으로 날짜/시간 고정
- 컴포넌트 테스트는 `@testing-library/react`의 `screen` 쿼리 사용
- `userEvent.setup()` 으로 유저 인터랙션 테스트 (fake timers 사용 시 `advanceTimers` 옵션 추가)

### 모킹 전략
- **Supabase**: `src/test/setup.ts`에서 전역 `vi.mock('@/lib/supabase')`. 테스트별로 `mockFrom.mockReturnValue()` 등으로 응답 조정
- **localStorage**: jsdom 기본 제공, `afterEach`에서 `localStorage.clear()`
- **crypto.randomUUID**: `setup.ts`에서 고정값 mock
- **Zustand**: `store.setState()`로 직접 상태 주입, `resetAllStores()`로 테스트 간 정리
- **React Router**: `renderWithRouter()` 헬퍼로 `MemoryRouter` 래핑

## 5. CI (GitHub Actions)

### 워크플로우
- PR 생성/업데이트 시 자동 실행
- 파일: `.github/workflows/ci.yml`

### 체크 항목
```
1. npm ci         — 의존성 설치
2. npm run typecheck — 타입 체크
3. npm run lint   — 린트 검사
4. npm test       — 전체 테스트 실행
5. npm run build  — 프로덕션 빌드
```

## 6. shadcn/ui 컴포넌트

### 현재 설치된 컴포넌트
alert-dialog, badge, button, card, checkbox, input, label, separator, sheet, tabs, textarea

### 새 컴포넌트 추가
```bash
npx shadcn@latest add <component-name>

# 예시
npx shadcn@latest add dialog
npx shadcn@latest add toast
```

### 설정
- 스타일: `new-york`
- 경로: `src/components/ui/`
- 설정 파일: `components.json`

## 7. Supabase

### 마이그레이션 관리
마이그레이션 파일은 `supabase/migrations/` 디렉토리에 순번 prefix로 관리.

```
supabase/migrations/
├── 00001_create_profiles.sql           # (제거됨 - 00002에서 drop)
├── 00002_remove_auth_add_families.sql  # 가족 코드 시스템 (families + devices)
├── 00003_create_activities.sql         # 활동 기록 테이블 + Realtime
├── 00004_add_supplement.sql            # 영양제 타입 + supplement_presets 테이블
├── 00005_add_family_password.sql       # 가족방 비밀번호 (4자리)
├── 00006_add_sleep_activity.sql        # 수면 활동 타입
└── 00007_add_babies.sql                # 아기 프로필 테이블 + Realtime
```

### 마이그레이션 적용
Supabase 대시보드 → SQL Editor에서 직접 실행하거나:
```bash
# Supabase CLI 사용 시
npx supabase db push
```

### 새 마이그레이션 추가
```bash
# 파일명 규칙: NNNNN_description.sql
# 예: 00008_add_growth_records.sql
```

### Realtime 설정
다음 테이블에 Realtime이 활성화되어 있음:
- `activities` — INSERT/DELETE 이벤트
- `babies` — INSERT/DELETE 이벤트
- `supplement_presets` — INSERT/DELETE 이벤트

### 로컬 개발
- Supabase 클라우드 프로젝트에 직접 연결하여 개발
- 로컬 Supabase 인스턴스 사용 시 `npx supabase start`

## 8. 새 기능 개발 체크리스트

### 새 페이지 추가
1. `src/pages/NewPage.tsx` 생성
2. `src/App.tsx`에 라우트 추가
3. 인증 필요 시 `FamilyGuard` 하위에 배치
4. 필요 시 `BottomNav`에 네비게이션 추가
5. `NewPage.test.tsx` 테스트 추가

### 새 컴포넌트 추가
1. 적절한 하위 디렉토리에 파일 생성
   - 범용 UI → `components/ui/`
   - 활동 관련 → `components/activity/`
   - 통계 관련 → `components/stats/`
   - 기능별 → `components/{feature}/`
2. `@/` alias로 import
3. `Component.test.tsx` 테스트 추가

### 새 Zustand 스토어 추가
1. `src/stores/newStore.ts` 생성
2. 인터페이스 정의 (State + Actions)
3. 필요 시 `src/hooks/` 에 래퍼 훅 생성
4. `newStore.test.ts` 테스트 추가
5. `src/test/helpers/zustandTestUtils.ts`에 reset 등록

### 새 DB 테이블 추가
1. `src/types/database.ts`에 인터페이스 추가
2. `supabase/migrations/` 에 SQL 파일 추가
3. Supabase에 마이그레이션 적용
4. Realtime 필요 시 마이그레이션에 `alter publication` 포함

## 9. 디버깅

### React DevTools
- React 19 호환 버전 사용
- Zustand 상태는 React DevTools에서 확인 가능

### Supabase 디버깅
- Supabase 대시보드 → Table Editor에서 데이터 직접 확인
- 브라우저 DevTools → Network 탭에서 API 호출 확인
- Realtime 구독은 WebSocket 탭에서 확인

### localStorage 확인
```
baby-memo-device-id     → 기기 UUID
baby-memo-family-code   → 현재 가족 코드
baby-memo-defaults      → 활동 기본값 (JSON)
baby-memo-theme         → 테마 설정 (light/dark/system)
```
브라우저 DevTools → Application → Local Storage에서 확인/수정 가능.

## 10. 프로덕션 배포

### 빌드
```bash
npm run build
# 출력: dist/ 디렉토리 (PWA assets 포함)
```

### 배포 옵션
- **Vercel**: GitHub 연동 자동 배포 (추천)
- **Netlify**: GitHub 연동 자동 배포
- **Cloudflare Pages**: 정적 사이트 배포

### SPA 라우팅 설정
React Router를 사용하므로 호스팅에서 SPA fallback 설정 필요:
- Vercel: `vercel.json`에 rewrites 설정
- Netlify: `_redirects` 파일에 `/* /index.html 200`

### PWA 배포 참고
- `vite-plugin-pwa`가 자동으로 `manifest.webmanifest`와 Service Worker 생성
- HTTPS 필수 (Service Worker 요구사항)
