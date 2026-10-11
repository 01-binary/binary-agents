---
name: fe-a11y
description: 클릭 가능한 요소, 폼과 입력 레이블, 아이콘만 있는 버튼, 카드 안 버튼, 테이블 행 이동을 JSX로 작성하거나 리뷰할 때 사용. Toss Frontend Fundamentals 접근성 가이드에서 고른 6가지 패턴과, ESLint로 넘길 범위
---

# 접근성 6가지 패턴

원칙은 **네이티브 요소 우선**이다. `<button>`, `<a>`, `<form>`, `<label>`은 키보드 조작, 포커스, 스크린 리더 정보를 기본으로 준다. 네이티브 요소를 쓸 수 없을 때만 `role` + `aria-*` + `tabIndex` + 키보드 처리로 직접 채운다.

접근성은 소수만을 위한 비용이 아니다. 링크를 `<a>`로 만들면 새 탭 열기가 되고, 역할과 이름이 맞으면 테스트를 `getByRole`로 쓸 수 있다.

## 1. 클릭 가능한 `div`·`span`

```tsx
// ❌ 키보드로 포커스·실행이 안 되고, 스크린 리더가 버튼인지 모른다
<div className="card" onClick={() => navigate(`/products/${id}`)}>...</div>

// ✅ 페이지 이동이면 링크 (새 탭 열기, 주소 복사도 된다)
<Link to={`/products/${id}`} className="card">...</Link>

// ✅ 동작이면 버튼
<button type="button" onClick={open}>...</button>
```

- 네이티브 요소를 쓸 수 없으면 `role="button"` + `tabIndex={0}` + Enter/Space `onKeyDown`을 모두 붙인다. 하나라도 빠지면 반쪽이다.
- `cursor: pointer`만 있고 위가 없으면 "보이는 모습과 실제 동작이 다른" 상태다.

## 2. 폼과 버튼 `type`

```tsx
// ❌ Enter로 제출이 안 되고 자동완성도 안 된다
<div>
  <input value={email} onChange={...} />
  <button onClick={submit}>확인</button>
</div>

// ✅ form으로 감싸고, 제출이 아닌 버튼은 type="button"
<form onSubmit={(e) => { e.preventDefault(); submit(); }}>
  <input ... />
  <button type="submit">확인</button>
  <button type="button" onClick={cancel}>취소</button>
</form>
```

- form 안의 `<button>`은 기본 `type`이 `submit`이다. 취소·삭제 버튼에 `type="button"`이 없으면 누를 때 제출된다.
- 폼 밖에 있는 제출 버튼은 `form="폼id"` 속성으로 연결한다.

## 3. 인터랙티브 요소 중첩

```tsx
// ❌ 링크 안 버튼, 버튼 안 버튼 + stopPropagation
<a href="/go"><Button>확인</Button></a>
<button onClick={openDetail}>
  서비스 이름
  <button aria-label="삭제" onClick={(e) => { e.stopPropagation(); remove(); }}>x</button>
</button>

// ✅ 버튼이 링크로 렌더링되게 하거나(as="a"), 두 요소를 형제로 둔다
<Button as="a" href="/go">확인</Button>

<div className="card" style={{ position: 'relative', isolation: 'isolate' }}>
  <button className="card-overlay" style={{ position: 'absolute', inset: 0, opacity: 0 }}>
    상세보기
  </button>
  서비스 이름
  <div style={{ position: 'relative', zIndex: 2 }}>
    <button aria-label="삭제" onClick={remove}>x</button>
  </div>
</div>
```

- HTML은 인터랙티브 요소 안에 인터랙티브 요소를 허용하지 않는다. `stopPropagation`은 클릭만 막을 뿐 포커스와 낭독은 계속 꼬인다. **증상만 막은 수정**이다.
- 투명 오버레이 버튼은 포커스가 안 보이므로 부모에 `:focus-within` 스타일을 준다.

## 4. 아이콘만 있는 버튼

```tsx
// ❌ 스크린 리더가 "버튼"이라고만 읽는다
<button onClick={search}><SearchIcon /></button>

// ✅ 버튼에 이름을 준다
<button type="button" aria-label="검색" onClick={search}><SearchIcon aria-hidden /></button>
```

- 숫자만 있는 버튼도 같다: `` aria-label={`댓글 ${count}개`} ``
- 텍스트와 함께 있는 아이콘 이미지는 `alt=""`로 둔다. "삭제 아이콘"처럼 쓰면 두 번 읽힌다.
- `<button><SearchIcon /></button>`처럼 SVG 컴포넌트만 있는 경우는 ESLint를 통과한다. 리뷰에서 직접 봐야 한다.

## 5. 입력 레이블

```tsx
// ❌ placeholder만 있거나, label이 입력과 연결되지 않음
<input placeholder="이메일" />
<label>이메일</label>
<input {...register('email')} />

// ✅ label과 입력을 연결 (React에서는 useId로 id를 만든다)
const emailId = useId();
<label htmlFor={emailId}>이메일</label>
<input id={emailId} {...register('email')} />
```

- placeholder는 입력을 시작하면 사라져서 레이블을 대신하지 못한다.
- 연결된 label은 클릭하면 입력으로 포커스가 가고, 스크린 리더가 입력의 이름으로 읽는다.
- 화면에 레이블을 둘 수 없으면 `aria-label`, 화면의 다른 텍스트를 이름으로 쓰려면 `aria-labelledby`.
- 동적으로 나타나는 에러 문구는 `aria-describedby`로 입력과 연결한다.

## 6. 테이블 행 클릭

```tsx
// ❌ 행은 키보드로 포커스할 수 없고, 링크라는 정보도 없다
<tr onClick={() => navigate(`/users/${id}`)}>...</tr>

// ✅ 행 안에 실제 링크를 두고, 가상 요소로 클릭 영역을 행 전체로 넓힌다
<tr style={{ position: 'relative' }}>
  <td>
    {name}
    <Link to={`/users/${id}`} aria-label={`${name} 자세히 보기`} className="row-link" />
  </td>
  ...
</tr>
// .row-link::after { content: ''; position: absolute; inset: 0; }
```

## ESLint로 넘길 것과 리뷰에서 볼 것

`eslint-plugin-jsx-a11y`를 쓰면 일부는 기계로 잡힌다. 설정 방법은 [references/eslint.md](references/eslint.md)에 있다.

| ESLint가 잡는 것 | ESLint가 못 잡는 것 (리뷰에서 본다) |
|---|---|
| `<img>`의 alt 누락 | `<tr onClick>` |
| 핸들러만 있고 역할이 없는 `div`·`span` (`no-static-element-interactions`, `click-events-have-key-events`) | 링크 안 버튼, 버튼 안 버튼 + `stopPropagation` |
| 이름 없는 버튼 중 `<img alt="">`만 든 경우 (`control-has-associated-label`, 기본 꺼짐) | SVG 아이콘 컴포넌트만 든 버튼 |
| 양수 `tabIndex`, 비인터랙티브 요소의 `tabIndex` | placeholder만 있는 입력, `type` 없는 form 안 버튼 |

- 디자인 시스템 컴포넌트(`<Button>`)는 매핑 설정이 없으면 플러그인이 검사하지 않는다. "린트 통과 = 안전"이 아니다.
- 위 표는 eslint-plugin-jsx-a11y 6.10 기준으로 문서 예시에 직접 돌려 확인한 결과다. `tabIndex` 행만 문서 설명을 따랐다.

## 출처

- [버튼의 역할과 동작이 일치하게 만들기](https://frontend-fundamentals.com/a11y/predictability/fake-button.html)
- [입력 요소는 form으로 감싸기](https://frontend-fundamentals.com/a11y/predictability/form.html)
- [버튼 안에 버튼 넣지 않기](https://frontend-fundamentals.com/a11y/structure/button-inside-button.html)
- [레이블 지정하기](https://frontend-fundamentals.com/a11y/basic-guide/label.html)
- [인터랙티브 요소에 이름 붙이기](https://frontend-fundamentals.com/a11y/semantic/required-label.html)
- [테이블 행에 클릭 이벤트 핸들러 붙이지 않기](https://frontend-fundamentals.com/a11y/structure/table-row-link.html)
