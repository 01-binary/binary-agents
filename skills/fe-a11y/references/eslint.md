# eslint-plugin-jsx-a11y 설정

## 기본 설정 (flat config)

```bash
npm install -D eslint-plugin-jsx-a11y
```

```js
// eslint.config.js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      // recommended에서 꺼져 있다. 이름 없는 버튼·입력을 잡으려면 직접 켠다
      'jsx-a11y/control-has-associated-label': 'error',
    },
  },
];
```

## 디자인 시스템 컴포넌트 연결

플러그인은 표준 HTML 태그만 검사한다. `<Button>`이 실제로 `<button>`을 그린다면 매핑해야 규칙이 적용된다.

```js
export default [
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      'jsx-a11y/control-has-associated-label': 'error',
    },
    settings: {
      'jsx-a11y': {
        // <Button as="a">처럼 렌더링 태그를 바꾸는 prop 이름
        polymorphicPropName: 'as',
        components: {
          Button: 'button',
          Input: 'input',
          Link: 'a',
        },
      },
    },
  },
];
```

## 텍스트를 children 대신 prop으로 받는 컴포넌트

`<Card contents="카드 내용" />`처럼 텍스트를 prop으로 받으면 `control-has-associated-label`이 이름이 없다고 판단한다. 그 prop 이름을 알려준다.

```js
rules: {
  'jsx-a11y/control-has-associated-label': ['error', { labelAttributes: ['contents'] }],
},
```

## 리뷰할 때 확인할 것

- 프로젝트 `package.json`에 `eslint-plugin-jsx-a11y`가 있는가
- `control-has-associated-label`을 켰는가
- 디자인 시스템 컴포넌트를 `components`에 매핑했는가

셋 중 하나라도 없으면 리뷰 결과에 설정 제안을 함께 적는다.

## 출처

- [ESLint 주요 규칙 소개](https://frontend-fundamentals.com/a11y/eslint/rules.html)
- [디자인 시스템과 결합하기](https://frontend-fundamentals.com/a11y/eslint/design-system.html)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
