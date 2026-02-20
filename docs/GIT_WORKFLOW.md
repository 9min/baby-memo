# Git Workflow - Baby Memo Git 워크플로우

## 1. 브랜치 전략

### 브랜치 구조
```
main                    ← 프로덕션 배포 브랜치
├── feat/xxx            ← 새 기능 개발
├── fix/xxx             ← 버그 수정
├── refactor/xxx        ← 리팩토링
├── docs/xxx            ← 문서 작업
└── chore/xxx           ← 의존성 업데이트, 설정 변경 등
```

### 브랜치 네이밍 규칙
```
{type}/{short-description}

# 예시
feat/activity-recording
feat/realtime-sync
fix/family-code-validation
refactor/store-structure
docs/add-architecture
chore/update-dependencies
```

### 브랜치 규칙
- `main` 브랜치에 직접 push 금지 (PR을 통해서만 머지)
- 기능 브랜치는 `main`에서 분기
- 머지 후 기능 브랜치 삭제

## 2. 커밋 컨벤션

### 커밋 메시지 형식
```
{type}: {description}

{body (optional)}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Type 종류
| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 추가 | `feat: add family code join system` |
| `fix` | 버그 수정 | `fix: resolve auto-restore on refresh` |
| `refactor` | 코드 리팩토링 (기능 변경 없음) | `refactor: extract device utils` |
| `docs` | 문서 추가/수정 | `docs: add architecture document` |
| `style` | 코드 스타일 변경 (포매팅 등) | `style: fix indentation` |
| `chore` | 빌드, 설정, 의존성 등 | `chore: update supabase sdk` |
| `test` | 테스트 추가/수정 | `test: add family store tests` |

### 작성 규칙
- 제목: 영문 소문자, 50자 이내, 마침표 없음
- 제목은 명령형으로 작성 ("add" not "added", "fix" not "fixed")
- 본문: 변경 이유(why) 위주, 72자 줄바꿈
- Claude와 협업 시 `Co-Authored-By` 포함

### 예시
```
feat: replace OAuth with family code system

Remove Supabase Auth dependency and implement family code based
authentication. Users enter a 6-8 character code to create or join
a family room. Device identification uses localStorage UUID.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## 3. PR (Pull Request) 프로세스

### PR 생성 규칙
```bash
# 기능 브랜치에서 작업 완료 후
git push -u origin feat/my-feature

# PR 생성
gh pr create --title "feat: add feature" --body "..."
```

### PR 템플릿
```markdown
## Summary
- 변경 사항 1
- 변경 사항 2

## Test plan
- [ ] npm run build 성공
- [ ] npm run typecheck 성공
- [ ] 기능 동작 확인
- [ ] 엣지 케이스 테스트
```

### PR 머지 전 체크리스트
- [ ] `npm run build` 성공
- [ ] `npm run lint` 에러 없음
- [ ] 커밋 메시지 컨벤션 준수
- [ ] 불필요한 파일 포함되지 않음 (.env, node_modules 등)

### 머지 방식
- **Squash and merge** (기본): 여러 커밋을 하나로 합쳐서 머지
- 깔끔한 히스토리 유지

## 4. .gitignore 정책

### 반드시 제외할 파일
```gitignore
node_modules/          # 의존성
dist/                  # 빌드 출력
*.local                # 로컬 환경변수
.env.local             # Supabase 키 등 시크릿
supabase/.temp/        # Supabase CLI 임시 파일
```

### 포함해야 할 파일
```
package-lock.json      # 의존성 잠금 (반드시 커밋)
components.json        # shadcn/ui 설정
supabase/migrations/   # DB 마이그레이션
```

## 5. 릴리스 관리

### 버전 관리
- `package.json`의 `version` 필드 사용
- SemVer (Semantic Versioning): `MAJOR.MINOR.PATCH`
  - MAJOR: 호환되지 않는 변경
  - MINOR: 새 기능 추가 (하위 호환)
  - PATCH: 버그 수정

### 현재 상태
- `0.0.0` — MVP 개발 중
- `0.1.0` — MVP 완료 시점에 태깅 예정

## 6. 주의사항

### 절대 커밋하지 않을 것
- `.env.local` (Supabase URL, anon key 포함)
- `node_modules/`
- `dist/`
- IDE 설정 (`.idea/`, `.vscode/` 대부분)

### 민감 정보 실수로 커밋했을 때
```bash
# 즉시 Supabase 대시보드에서 anon key 재발급
# git history에서 제거
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' HEAD
```

### 대용량 파일
- 이미지, 동영상 등은 Git에 포함하지 않음
- 필요 시 Supabase Storage 또는 CDN 활용
