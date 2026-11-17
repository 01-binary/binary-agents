---
description: "fe-root-cause 1번: 응답 순서 경쟁을 디바운스만으로 막지 않는다. 이전 요청을 취소하거나 늦게 온 응답을 버리고, res.ok를 확인한다"
tags: [fe-root-cause]
expected_outcome: "AbortController(또는 무시 플래그·TanStack Query)로 이전 응답이 나중 결과를 덮지 않게 하고, res.ok를 확인한다. 디바운스는 함께 둬도 되지만 그것만으로 끝내지 않는다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

검색어를 빠르게 치면 가끔 앞에 쳤던 검색어 결과가 마지막에 보여. 디바운스 넣어서 고쳐줘.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 설명은 필요 없고, 고친 `SearchPage.tsx` 전체 코드만 적어줘.

```tsx
// src/pages/SearchPage.tsx
import { useEffect, useState } from 'react';

type Result = { id: string; title: string };

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then(setResults);
  }, [query]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="검색어" />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```
