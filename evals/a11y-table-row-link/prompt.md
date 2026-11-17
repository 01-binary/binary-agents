---
description: "fe-a11y 6번: 테이블 행 클릭. tr에 onClick+navigate를 붙이지 않고 행 안에 실제 링크를 둔다"
tags: [fe-a11y]
expected_outcome: "행 안에 Link를 두고 가상 요소 등으로 클릭 영역을 행 전체로 넓힌다. tr onClick으로 navigate하지 않는다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

react-router를 쓰는 관리자 화면이야. 아래 회원 목록 테이블에서 행을 누르면 그 회원의 상세 페이지(`/users/:id`)로 이동하게 해줘. 행 어디를 눌러도 이동해야 해.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 설명은 필요 없고, 고친 `UserTable.tsx` 전체 코드만 적어줘.

```tsx
// src/components/UserTable.tsx
type User = { id: string; name: string; email: string; joinedAt: string };

export function UserTable({ users }: { users: User[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>이름</th>
          <th>이메일</th>
          <th>가입일</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.joinedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
