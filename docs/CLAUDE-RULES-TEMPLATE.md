# 프론트엔드 CLAUDE.md 규칙 템플릿

프로젝트의 `CLAUDE.md`에 붙여 쓰는 규칙 템플릿입니다. toss/frontend-fundamentals 레포 안 today-i-learned 프로젝트의 `.claude/` 규칙에서 프로젝트 고유 내용(GraphQL, 스타일 도구 등)을 빼고 골라서 일반화했습니다. 프로젝트에 맞게 고쳐 쓰세요.

4원칙과 판단이 필요한 기준(원칙 충돌, 예외)은 `fe-*` 스킬에 있으므로, 여기에는 **항상 지킬 짧은 규칙**만 둡니다.

---

## 붙여 쓸 내용

```markdown
# 개발 규칙

## 명령 (검증은 이걸로 돌린다)
- typecheck: `pnpm typecheck` · lint: `pnpm lint` · test: `pnpm test` · dev: `pnpm dev` (포트 3000)
- 작업이 끝났다는 뜻 = 위 셋이 통과하고, UI 변경이면 아래 "UI 완료 정의"까지 충족
- **코드 변경 작업이 끝나면 항상 `/binary-agents:fe-verify`를 실행**하고, 그 마지막 세 줄(PR·통과 요약·사람이 볼 것)로 보고한다. "됐습니다"로 끝내지 않는다

## 모범 예시 (새 코드는 이 파일의 패턴을 따른다)
- 컴포넌트: `src/components/Button/`  · 훅: `src/hooks/useXxx.ts` · API 호출: `src/api/posts.ts`
  (규칙 열 줄보다 예시 한 파일이 더 잘 먹힌다. 실제 경로로 바꿔 쓸 것)

## 사람 승인 없이 건드리지 않는 경로 (tier 3)
- `src/ads/**`, `src/revenue/**` — 광고 SDK·수익 로직
- `src/shared/**`, 공용 디자인 시스템 컴포넌트
- CI 워크플로, 패키지 매니저 설정
- 이 경로를 바꿔야 하면 먼저 `/binary-agents:spec`으로 SPEC.md를 만들고 승인받는다

## UI 완료 정의
- 1280×800, 375×812 두 뷰포트 스크린샷에서 변경된 화면이 보인다
- 콘솔 error 0, 가로 스크롤 없음
- 이번 변경이 추가한 요소를 테스트에서 `getByRole`로 찾을 수 있다

## 필수 (반드시 지킴)

### 위치
- 2곳 이상에서 쓰면 공용 위치(shared 등)로, 1곳에서만 쓰면 사용처 옆에 둔다.
- 함께 바뀌는 파일은 같은 폴더에 둔다. 종류(components, hooks, types)가 아니라 기능·도메인 단위로 묶는다.

### 분리
- 3~5줄짜리 간단한 로직은 따로 빼지 않는다.
- 로직의 종류가 아니라 함께 바뀌는 단위로 나눈다.

### API와 에러 처리
- 요청 계층은 네트워크 에러만, API 함수는 응답 형식 검증, 훅은 사용자에게 보여 줄 메시지를 맡는다.
- 쿼리 키는 도메인별 팩토리 한 곳에서 만든다. (예: `postKeys.all`, `postKeys.list(filters)`, `postKeys.detail(id)`)

### 주석
- 주석은 "왜"만 쓴다. 허용: 알고리즘의 근거, 외부 API의 버그·제약, 성능 때문에 직관과 다르게 짠 이유.

### 커밋
- 구조 변경(리팩터링)과 동작 변경을 한 커밋에 섞지 않는다.
- `--no-verify`로 훅을 건너뛰지 않는다.
- 테스트를 통과시키려고 테스트를 약화시키지 않는다.

## 참고 (상황에 따라 판단)
- 코드 품질은 `fe-readability`, `fe-predictability`, `fe-cohesion`, `fe-coupling` 스킬을 따른다.
- 원칙끼리 부딪히거나 공통화·추상화를 정할 때는 `fe-tradeoffs` 스킬을 따른다.
- 버그를 고칠 때는 `fe-root-cause` 스킬을, 클릭·폼·버튼 UI를 만들 때는 `fe-a11y` 스킬을 따른다.
- 상태를 어디에 둘지(useState, Context, 전역 스토어, 서버 상태, URL)는 `fe-state` 스킬을 따른다.
- 컴포넌트 데이터 소유, 데이터 fetching과 비동기 경계, 네이밍, 메모이제이션은 `fe-react` 스킬을 따른다.
```

---

## 규칙을 쓸 때 참고할 점

today-i-learned 규칙에서 배울 점과, 반대로 하지 말아야 할 점입니다.

**배울 점**
- `CLAUDE.md`는 짧은 인덱스로 둔다. "필수"와 "참고"를 나누고, 세부 내용은 별도 파일로 링크한다.
- ✅/❌ 코드 쌍과 수치 기준("2곳 이상", "3~5줄")을 쓴다. 해석할 여지가 줄어든다.
- 분리 규칙 옆에 "과도한 분리 지양" 같은 반대 방향 규칙을 함께 둔다. 한쪽 방향 규칙만 있으면 과하게 적용된다.

**하지 말아야 할 점**
- "필수"라고 써 놓고 린트로 강제하지 않으면 지켜지지 않는다. today-i-learned는 `any` 금지가 필수인데 린트가 warn이라 실제 코드에 `any`가 남아 있다.
- 실제 폴더 구조나 스택과 다른 규칙을 두지 않는다. 존재하지 않는 경로를 가리키는 규칙은 Claude를 헷갈리게 한다.
- 기계로 잡을 수 있는 규칙(any 금지, 상대 경로 금지, import 순서)은 CLAUDE.md가 아니라 ESLint·TypeScript 설정으로 옮기고, CLAUDE.md에는 규칙의 이유만 남긴다.

## 출처

- [toss/frontend-fundamentals — today-i-learned](https://github.com/toss/frontend-fundamentals/tree/main/fundamentals/today-i-learned)
