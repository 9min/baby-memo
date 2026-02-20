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

## 4. shadcn/ui 컴포넌트

### 새 컴포넌트 추가
```bash
npx shadcn@latest add <component-name>

# 예시
npx shadcn@latest add dialog
npx shadcn@latest add card
npx shadcn@latest add toast
```

### 설정
- 스타일: `new-york`
- 경로: `src/components/ui/`
- 설정 파일: `components.json`

### 커스터마이징
shadcn/ui 컴포넌트는 프로젝트에 복사되므로 자유롭게 수정 가능.
단, 원본 구조를 크게 변경하면 업데이트 시 충돌 가능.

## 5. Supabase

### 마이그레이션 관리
마이그레이션 파일은 `supabase/migrations/` 디렉토리에 순번 prefix로 관리.

```
supabase/migrations/
├── 00001_create_profiles.sql      # (제거됨 - 00002에서 drop)
└── 00002_remove_auth_add_families.sql  # 가족 코드 시스템
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
# 예: 00003_create_activities.sql
```

### 로컬 개발
- Supabase 클라우드 프로젝트에 직접 연결하여 개발
- 로컬 Supabase 인스턴스 사용 시 `npx supabase start`

## 6. 새 기능 개발 체크리스트

### 새 페이지 추가
1. `src/pages/NewPage.tsx` 생성
2. `src/App.tsx`에 라우트 추가
3. 인증 필요 시 `FamilyGuard` 하위에 배치
4. 필요 시 `BottomNav`에 네비게이션 추가

### 새 컴포넌트 추가
1. 적절한 하위 디렉토리에 파일 생성
   - 범용 UI → `components/ui/`
   - 기능별 → `components/{feature}/`
2. `@/` alias로 import

### 새 Zustand 스토어 추가
1. `src/stores/newStore.ts` 생성
2. 인터페이스 정의 (State + Actions)
3. `src/hooks/useNew.ts` 래퍼 훅 생성 (필요 시)

### 새 DB 테이블 추가
1. `src/types/database.ts`에 인터페이스 추가
2. `supabase/migrations/` 에 SQL 파일 추가
3. Supabase에 마이그레이션 적용

## 7. 디버깅

### React DevTools
- React 19 호환 버전 사용
- Zustand 상태는 React DevTools에서 확인 가능

### Supabase 디버깅
- Supabase 대시보드 → Table Editor에서 데이터 직접 확인
- 브라우저 DevTools → Network 탭에서 API 호출 확인
- Realtime 구독은 WebSocket 탭에서 확인

### localStorage 확인
```
baby-memo-device-id    → 기기 UUID
baby-memo-family-code  → 현재 가족 코드
```
브라우저 DevTools → Application → Local Storage에서 확인/수정 가능.

## 8. 프로덕션 배포

### 빌드
```bash
npm run build
# 출력: dist/ 디렉토리
```

### 배포 옵션
- **Vercel**: GitHub 연동 자동 배포 (추천)
- **Netlify**: GitHub 연동 자동 배포
- **Cloudflare Pages**: 정적 사이트 배포

### SPA 라우팅 설정
React Router를 사용하므로 호스팅에서 SPA fallback 설정 필요:
- Vercel: `vercel.json`에 rewrites 설정
- Netlify: `_redirects` 파일에 `/* /index.html 200`
