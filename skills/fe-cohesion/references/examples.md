# 응집도 (Cohesion) 예시

`fe-cohesion` 스킬의 항목별 상세 설명, Bad/Good 코드, 확인 질문(🔍)입니다.

### 1. 함께 수정되는 파일을 같은 디렉토리에 두기

함께 수정되는 소스 파일을 하나의 디렉토리에 배치하면 코드의 의존 관계를 명확하게 드러낼 수 있습니다.

**Bad (종류별 분류):**

```
src/
├─ components/   # 수백 개의 파일
├─ constants/
├─ containers/
├─ hooks/
├─ utils/
```

**문제점:**

- 파일을 모듈 종류(컴포넌트, Hook, 유틸리티 등)에 따라 분류하면 코드 파일 간 의존 관계를 파악하기 어려움
- 특정 기능 삭제 시 연관 코드가 여러 디렉토리에 남아있을 수 있음 (미아 코드)
- 프로젝트 규모 증가에 따라 복잡도 급증

**Good (도메인 기반 구조):**

```
src/
├─ components/      (전체 프로젝트 공용)
├─ hooks/
├─ utils/
└─ domains/
   ├─ payment/
   │  ├─ components/
   │  ├─ hooks/
   │  └─ utils/
   └─ user/
      ├─ components/
      ├─ hooks/
      └─ utils/
```

**Benefits:**

- 의존 관계 명확화: 다른 도메인 참조 시 경로가 길어져 "잘못된 파일을 참조하고 있다는 것을 쉽게 인지할 수 있게 됨"
- 범위 관리: 기능 제거 시 도메인 디렉토리 전체 삭제로 미사용 코드 제거
- 프로젝트 규모 증가에 대응

**🔍 검색:**

- `../../../` 같은 깊은 상대 경로가 있는가?
- 한 디렉토리에 50개 이상의 파일이 있는가?
- 기능 삭제 후 여러 디렉토리에 남아있는 연관 파일이 있는가?
- 파일을 모듈 종류(컴포넌트, Hook 등)에 따라만 분류하고 있는가?

### 2. 매직 넘버 상수로 관리하기

매직 넘버란 정확한 뜻을 밝히지 않고 소스 코드 안에 직접 숫자 값을 넣는 것입니다. 같은 매직 넘버를 여러 파일에서 일관되게 관리하면 응집도가 향상됩니다.

**Bad:**

```tsx
// FileA.tsx
await delay(300);

// FileB.tsx
await delay(300); // 애니메이션 변경 시 여기도 수정해야 함

// Animation.css
transition: 300ms; // 여기도!
```

**문제점:**

- 숫자 `300`의 의미가 불명확하며, 애니메이션 지속 시간을 변경할 때 모든 곳을 찾아서 수정해야 하는 강한 결합 관계 존재
- 유지보수 위험: 애니메이션 시간이 변경되어도 이 숫자를 놓치면 조용히 서비스가 깨질 수 있음

**Good:**

```tsx
// constants/animation.ts
export const ANIMATION_DELAY_MS = 300;

// FileA.tsx
await delay(ANIMATION_DELAY_MS);

// FileB.tsx
await delay(ANIMATION_DELAY_MS);
```

**🔍 검색:**

- 코드에 설명되지 않은 숫자값이 직접 사용되고 있는가?
- 관련된 여러 곳에서 같은 숫자가 사용되고 있는가?
- 그 숫자의 의도가 명확하게 드러나는가?
- 애니메이션/타이밍 값이 CSS와 JS에 각각 존재하는가?
- 제한값/임계값이 여러 곳에 분산되어 있는가?

### 3. 폼의 응집도 생각하기

응집도를 높이려면 필드 단위와 폼 전체 단위 중 상황에 적합한 방식을 선택해야 합니다. 변경의 단위가 필드 단위인지 폼 전체 단위인지에 따라 설계를 조정합니다.

**Option A - 필드 단위 응집도:**

각 필드가 고유의 검증 로직을 가지며 독립적으로 관리됩니다. 변경 범위가 제한적이고 다른 필드에 영향을 주지 않습니다.

```tsx
<input
  {...register('email', {
    validate: async (value) => {
      const isDuplicate = await checkEmailDuplicate(value);
      return isDuplicate ? '이미 사용 중인 이메일입니다' : true;
    },
  })}
/>
```

**When to use:**

- 독립적인 검증이 필요할 때 (이메일 형식, 전화번호 등)
- 필드를 다른 폼에서 재사용해야 할 때
- 필드별 복잡한 비동기 검증이 필요할 때

**Option B - 폼 전체 단위 응집도:**

모든 필드의 검증이 폼에 중앙 집중식으로 관리됩니다. 일관된 흐름을 유지하고 로직이 간결하지만, 필드 간 결합도가 증가하여 재사용성이 저하됩니다.

```tsx
const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
  });

const form = useForm({ resolver: zodResolver(schema) });
```

**When to use:**

- 하나의 완결된 기능을 나타낼 때 (결제 정보, 배송 정보)
- 단계별 입력이 필요할 때 (Wizard Form)
- 필드 간 의존성이 있을 때 (비밀번호 확인, 금액 계산)

**Decision:** 변경의 단위가 필드인지, 폼 전체인지에 따라 결정

**🔍 검색:**

- 변경의 단위가 무엇인가? (필드 vs 폼)
- 필드들이 독립적인가, 아니면 상호의존적인가?
- 재사용 가능성은 중요한가?
- 필드 간 교차 검증 로직이 필요한가?
