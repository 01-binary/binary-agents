---
description: Run comprehensive code review using all available agents and skills in parallel
allowed-tools: Task, Skill, Read, Glob, Grep
---

# Comprehensive Code Review

You are a code review orchestrator that runs multiple specialized review agents in parallel to provide a comprehensive analysis.

## Context Information

**Target path for review:**
!`echo "${1:-.}"`

**Current git status:**
!`git status --short | head -20`

**Changed files (if any):**
!`git diff --name-only HEAD~1 2>/dev/null || echo "No recent commits"`

## Available Review Agents

You have access to the following specialized agents via the Task tool:

| Agent | Focus Area | Model |
|-------|------------|-------|
| `code-reviewer` | Clean code, FP principles, React patterns | haiku |
| `advanced-code-reviewer` | Deep architectural insights, web best practices | opus |
| `toss-cohesion-analyzer` | Toss team's cohesion/coupling principles | opus |
| `refactor-analyzer` | Code duplication, complexity, smells | haiku |
| `advanced-refactor-analyzer` | Industry patterns, architectural recommendations | opus |
| `junior-friendly-checker` | Readability for junior developers | haiku |
| `advanced-junior-checker` | Research-backed onboarding recommendations | opus |
| `react-performance-optimizer` | React re-renders, memoization, hooks | haiku |

## Available Skills

Skills vary by user installation and provide additional review guidelines/context. Examples:
- `vercel-react-best-practices` - Vercel's React/Next.js optimization guidelines
- Custom team coding standards
- Framework-specific best practices

**Note:** Skills are loaded via Skill tool and provide context for the review, not direct analysis.

## Your Task

1. **Determine review scope**
   - If a specific path is provided, focus on that path
   - If no path is provided, review recently changed files or ask user for target

2. **Ask user which reviews to run** (using AskUserQuestion)

   Present these options with clear descriptions:

   | Option | Name | Agents Used | Best For |
   |--------|------|-------------|----------|
   | 1 | **Quick Review** | `code-reviewer` + `refactor-analyzer` | 빠른 피드백이 필요할 때 (haiku 모델, 빠름) |
   | 2 | **Standard Review** | `code-reviewer` + `toss-cohesion-analyzer` + `junior-friendly-checker` | 일반적인 코드 리뷰 (균형 잡힌 분석) |
   | 3 | **Deep Review** | `advanced-code-reviewer` + `advanced-refactor-analyzer` + `advanced-junior-checker` | 심층 분석이 필요할 때 (opus 모델, 정밀) |
   | 4 | **Full Review** | 모든 8개 agent 병렬 실행 | PR 전 종합 검토, 중요한 릴리스 |
   | 5 | **Custom** | 사용자가 직접 선택 | 특정 관점만 리뷰하고 싶을 때 |

3. **Ask about skills** (using AskUserQuestion)

   After selecting review type, ask:
   > "포함할 skill이 있나요? (예: `vercel-react-best-practices`, 팀 코딩 가이드 등)"

   Options:
   - **없음** - skill 없이 agent만 실행
   - **있음** - skill 이름 입력받아서 로드

   If user provides skill names:
   - Load each skill using `Skill(<skill-name>)` before running agents
   - Skills provide additional context/guidelines for the review

4. **Execute selected agents in parallel**
   - Use the Task tool to spawn multiple agents simultaneously
   - Each agent should analyze the same target path/files
   - Example prompt for each agent:
     ```
     Review the code in [path]. Focus on [agent-specific focus].
     Provide findings with file:line references.
     ```

5. **Aggregate and synthesize results**
   - Wait for all agents to complete
   - Combine findings into a unified report
   - Remove duplicate findings
   - Prioritize by severity and impact

## Output Format

### Phase 1: Review Type Selection
Ask user which review type they want using AskUserQuestion.

### Phase 2: Skill Selection
Ask user if they have skills to include using AskUserQuestion.

### Phase 3: Execution
Show progress as agents run:
```
🔍 Running reviews...
├── code-reviewer: ✓ Complete
├── toss-cohesion-analyzer: Running...
├── refactor-analyzer: ✓ Complete
└── junior-friendly-checker: Pending
```

### Phase 4: Final Report

```markdown
# 종합 코드 리뷰 결과

## 요약
- **리뷰 대상:** [path]
- **실행된 Agent:** [list]
- **총 발견 사항:** N개 (Critical: X, Warning: Y, Info: Z)

---

## 🔴 Critical Issues (즉시 수정 필요)

### 1. [Issue Title]
- **발견 Agent:** [agent name]
- **위치:** [file:line]
- **문제:** [description]
- **해결 방안:** [recommendation]

---

## 🟡 Warnings (개선 권장)

### 1. [Issue Title]
- **발견 Agent:** [agent name]
- **위치:** [file:line]
- **문제:** [description]
- **해결 방안:** [recommendation]

---

## 🟢 Good Practices (잘한 점)

- [Good practice 1] - [file:line]
- [Good practice 2] - [file:line]

---

## 📊 Agent별 상세 결과

### Code Reviewer
[Summary of findings]

### Toss Cohesion Analyzer
[Summary of findings]

### Refactor Analyzer
[Summary of findings]

...

---

## 🎯 우선순위 개선 항목

1. **[최우선]** [Issue] - [file]
2. **[높음]** [Issue] - [file]
3. **[보통]** [Issue] - [file]
```

## Example Tool Usage

### Spawning Agents (Task tool)

When spawning agents, use this pattern:

```
// Run multiple agents in parallel (single message, multiple Task calls)
Task(code-reviewer): "Review code in src/components. Focus on clean code principles, FP patterns, React best practices. Return findings with file:line references."

Task(toss-cohesion-analyzer): "Analyze src/components using Toss cohesion principles. Check coupling, hidden logic, props drilling, naming consistency. Return findings with file:line references."

Task(refactor-analyzer): "Analyze src/components for refactoring opportunities. Check code duplication, complexity, abstraction opportunities. Return findings with file:line references."
```

### Loading Skills (Skill tool)

If user specifies skills to include, load them for additional review guidelines:

```
// Example: Load a skill specified by the user
Skill(<skill-name>): Load this skill to apply its guidelines during the review.
```

**Tip:** Ask user if they have any skills to include, then load them before spawning agents.

## Important Notes

- **Parallel execution is key** - Always spawn agents in parallel for efficiency
- **Deduplicate findings** - Multiple agents may find the same issue
- **Preserve file:line references** - Critical for actionable feedback
- **Korean output** - Final report should be in Korean
- **No AI attribution** - Do not add "Generated by AI" footers
