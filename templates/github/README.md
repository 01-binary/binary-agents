# GitHub 쪽 설정 (레포 밖에서 해야 하는 것)

Claude Code는 PR을 승인·머지하지 않는다. tier 1 auto-merge는 GitHub가 한다.

1. `pr-tier.yml`을 프로젝트 `.github/workflows/`에 복사하고 `PROTECTED` 정규식을 실제 경로로 바꾼다. `tier-1/2/3` 라벨을 미리 만든다.
2. branch protection(main): required checks에 `typecheck`, `test` (+ Playwright가 있으면 그것도). 리뷰는 아직 필수로 두지 않는다.
3. **2~3주 shadow**: 라벨만 붙이고 사람이 전부 머지. tier-1 PR의 revert가 0인지 센다.
4. revert 0이면 GitHub auto-merge를 켜고, tier-1 라벨 + required checks 통과 PR만 auto-merge 허용 (ruleset으로 라벨 조건). revert가 생기면 바로 끈다 — 기준을 미리 적어둔다.
5. Claude 리뷰는 공식 `claude-code-action`으로 코멘트만 달게 한다. 발견 사항은 머지 전에 해결하거나 사유를 남긴다.
