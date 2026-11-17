---
# user를 위해 Context나 전역 스토어를 새로 만들면 탈락
type: regex
pattern: 'createContext|useContext|from\s+[''"](zustand|jotai|recoil|@reduxjs/toolkit|redux)[''"]'
match: not_contains
---
