import { useEffect, useState } from 'react';

type Result = { id: string; title: string };

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(setResults)
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setError(err);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="검색어" />;
}
