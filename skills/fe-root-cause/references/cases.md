# 디버깅 사례 8개

Toss Frontend Fundamentals 디버깅 문서의 기여 사례 중 React·TanStack Query·react-hook-form·Radix·웹뷰 스택과 바로 닿는 것만 골라 요약했다. 경로는 `fundamentals/debug/pages/contribute/` 기준이다.

| # | 사례 | 증상 | 근본 원인 | 고친 방법 / 재발 방지 | 리뷰에서 볼 패턴 |
|---|---|---|---|---|---|
| 1 | TanStack Query 반환 타입 단언 (`typescript/react_query_refetch_typescript`) | `some is not a function` 같은 런타임 에러, 화면 깨짐 | 쿼리 제네릭으로 배열이라고 단언했지만 실제 응답은 객체였고, 빈 배열 폴백이 이를 가렸다 | `select`로 실제 응답을 변환, 응답 타입 명시. 팀에서 타입 단언을 전수 조사하고 Error Boundary 도입 | 응답 제네릭 단언 + `data \|\| []` |
| 2 | react-hook-form + Zod 무반응 (`react/react_hook_form_zod`) | 제출 버튼을 눌러도 아무 반응도, 에러 표시도 없음 | 입력 값 형태가 스키마와 달라 변환 전에 검증이 실패했다. 검증이 실패하면 `onSubmit`이 불리지 않는데 `onError`가 없었다 | `onError` 추가, 컴포넌트가 내는 값과 스키마의 형태 맞추기, 실패 공통 안내와 로깅 | `handleSubmit(onSubmit)`만 있고 `onError` 없음 |
| 3 | Radix Dialog 안 Select ESC 충돌 (`package/radix_ui_dialog_select_esc`) | Select에서 ESC를 누르면 Dialog까지 닫힘 | 내부 패키지(dismissable-layer)가 두 버전 설치되어 레이어 스택이 둘로 나뉨 | 패키지 매니저 overrides·resolutions로 한 버전 강제, 상호작용 버그는 의존성 트리부터 확인 | 같은 라이브러리의 버전 중복 |
| 4 | 무한 스크롤 요청 중복 (`react/react_state_closure`) | 다음 페이지 요청이 3~4번 중복 | 옵저버 콜백이 처음 렌더의 로딩 상태를 붙잡고 있고, setState는 바로 반영되지 않는다 | 실행 제어 플래그는 `useRef`로, 또는 `useInfiniteQuery`(그래도 `hasNextPage && !isFetching` 가드는 필요) | 중복 실행 방지를 state로만 함 |
| 5 | 실시간 차트 메모리 누수 (`react/react_unmount_cleanup`) | 30분쯤 켜두면 탭이 멈춤 | WebSocket과 `setInterval`의 cleanup 누락, 데이터 무한 누적 | effect cleanup에서 해제, 누적 데이터 상한, 오래 켜두는 테스트 | 해제 없는 `setInterval`·`addEventListener`·`new WebSocket` |
| 6 | 페이지 이동 후 이전 메뉴 스타일 잔존 (`react/react_suspense_and_framer_motion_ui_debug`) | 이동했는데 이전 메뉴가 활성 상태로 남음 | 최상단 Suspense가 suspend하면서 레이아웃 전체를 언마운트해 애니메이션 문맥이 사라짐 | 레이아웃·내비게이션을 Suspense 경계 밖으로, 데이터를 쓰는 영역 안쪽에 경계 | 레이아웃을 감싸는 Suspense |
| 7 | 푸시 ID 끝자리 변경 (`javascript/javascript_max_number_error_debug`) | 보너스가 지급되지 않음 | 쿼리 파라미터의 큰 ID를 `Number()`로 바꾸면서 2^53 − 1을 넘어 정밀도 손실 | ID는 문자열로 유지(계산이 필요하면 BigInt), 서버 ID는 원래 형식 그대로 | ID·파라미터의 `Number()`, `parseInt()` |
| 8 | 웹뷰 복귀 시 Suspense 에러 (`react/broadcast_suspense_error_debug`) | 웹뷰를 오래 켜둔 뒤 돌아오면 에러 화면 | 웹뷰 A에서 `gcTime`이 지나 지워진 쿼리가, 쿼리 캐시를 공유하는 구조를 통해 웹뷰 B에도 전파됨 | 버그가 고쳐진 라이브러리 버전으로 업그레이드(`gcTime: Infinity`는 부작용 때문에 기각). 재현은 `gcTime`을 1초로 줄여서 | 여러 화면·웹뷰가 공유하는 쿼리 캐시 설정 |

## 출처

- [디버깅 기여 사례](https://frontend-fundamentals.com/debug/) (사이드바의 "기여" 항목)
