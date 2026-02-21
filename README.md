# Baby Memo

가족이 함께 아기 활동을 실시간으로 기록하고 공유하는 모바일 우선 웹앱.

회원가입 없이 **가족 코드** 하나로 여러 기기가 같은 방에 연결되어 Supabase Realtime으로 즉시 동기화됩니다.

## 주요 기능

- **5종 활동 기록** — 이유식, 음료(분유/모유/물 등), 영양제, 기저귀, 수면
- **실시간 동기화** — 한 기기에서 기록하면 가족 전체 기기에 즉시 반영
- **타임라인** — 일별 시간대 그룹 보기 + 월별 달력 뷰
- **통계 대시보드** — 일별/주별/월별 활동 횟수, 음료 섭취량, 수면 시간 차트
- **아기 프로필** — 이름, 생년월일, D+일수 표시
- **다크모드** — 라이트/다크/시스템 테마 전환
- **CSV 내보내기** — 전체 활동 기록 다운로드
- **PWA** — 홈 화면에 앱으로 설치 가능

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript 5.9 |
| 빌드 | Vite 7 |
| 스타일링 | Tailwind CSS 4 + shadcn/ui |
| 상태관리 | Zustand 5 |
| 라우팅 | React Router DOM 7 |
| 백엔드 | Supabase (PostgreSQL + Realtime) |
| 차트 | Recharts 3 |
| PWA | vite-plugin-pwa |
| 테스트 | Vitest 4 + Testing Library |
| CI | GitHub Actions |

## 시작하기

### 사전 준비

- Node.js 20+
- npm 10+
- [Supabase](https://supabase.com) 프로젝트

### 설치

```bash
git clone https://github.com/9min/baby-memo.git
cd baby-memo
npm install
```

### 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 Supabase 프로젝트 정보를 입력합니다:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### DB 마이그레이션

`supabase/migrations/` 폴더의 SQL 파일을 순서대로 Supabase SQL Editor에서 실행합니다.

### 개발 서버

```bash
npm run dev
```

http://localhost:5173 에서 접속할 수 있습니다.

## 명령어

```bash
npm run dev           # 개발 서버 (HMR)
npm run build         # 타입체크 + 프로덕션 빌드
npm run typecheck     # 타입체크만
npm run lint          # ESLint
npm test              # 전체 테스트 실행
npm run test:watch    # 테스트 워치 모드
npm run test:coverage # 커버리지 리포트
```

## 프로젝트 구조

```
src/
├── components/
│   ├── activity/    # 활동 기록 컴포넌트 (버튼, 카드, 시트, 달력 등)
│   ├── family/      # 가족방 인증 가드
│   ├── layout/      # 앱 셸, 하단 네비게이션, PWA 설치 프롬프트
│   ├── stats/       # 통계 차트 및 요약 컴포넌트
│   └── ui/          # shadcn/ui 컴포넌트
├── hooks/           # 커스텀 훅 (useFamily, useActivitySubscription, useTheme)
├── lib/             # 유틸리티 (Supabase 클라이언트, 설정, 통계 등)
├── pages/           # 페이지 (홈, 참여, 타임라인, 통계, 설정)
├── stores/          # Zustand 스토어 (7개)
├── test/            # 테스트 셋업 및 헬퍼
└── types/           # TypeScript 타입 정의
```

## 인증 모델

Supabase Auth를 사용하지 않습니다. 대신:

1. **가족 코드** (6-8자리 영대문자+숫자)로 가족방 생성/참여
2. 기존 방 참여 시 **4자리 비밀번호** 입력
3. 기기 식별은 `crypto.randomUUID()`로 생성한 UUID를 localStorage에 저장

로그인이 필요 없어 조부모 등 기술에 익숙하지 않은 가족도 쉽게 참여할 수 있습니다.

## 테스트

38개 테스트 파일, 374개 테스트가 소스 파일 옆에 co-locate 되어 있습니다.

```bash
npm test
```

## 라이선스

Private
