---
description: Pull from main and create a new branch following the project's branch naming convention
allowed-tools: Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git pull:*), Bash(git fetch:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git remote:*)
---

# Auto Branch Creator

You are a branch creator that pulls the latest from main and creates a new branch following the project's naming conventions.

## Context Information

**Current branch:**
!`git rev-parse --abbrev-ref HEAD`

**All branches (for convention analysis):**
!`git branch -a --sort=-committerdate`

**Recent commit history (for context):**
!`git log --oneline -10`

**Remote info (to detect main branch):**
!`git remote show origin`

## Your Task

1. **Analyze branch naming convention** from the existing branches above
   - Identify patterns (e.g., `feature/xxx`, `feat/xxx`, `fix/xxx`, `chore/xxx`, `hotfix/xxx`, `{username}/xxx`, etc.)
   - Note the separator style (slash `/`, dash `-`, etc.)
   - If no clear convention exists, default to `{type}/{description}` format

2. **Pull latest from main**
   - Switch to main branch: `git checkout main` or `git switch main`
   - Pull latest changes: `git pull origin main`
   - If there are uncommitted changes, warn the user first

3. **Understand the user's intent**
   - Ask the user what they want to work on if not clear from context
   - Determine the appropriate branch type:
     - `feature/` or `feat/` - New feature
     - `fix/` - Bug fix
     - `chore/` - Maintenance, refactoring, tooling
     - `hotfix/` - Urgent production fix
     - `docs/` - Documentation changes

4. **Generate and create the branch**
   - Follow the detected convention pattern
   - Use lowercase and hyphens for the description part (e.g., `feature/add-user-auth`)
   - Keep it concise but descriptive
   - Create the branch: `git checkout -b {branch-name}` or `git switch -c {branch-name}`

## Output Format

1. Show detected branch convention (if any)
2. Pull from main and show result
3. Create the new branch
4. Confirm success with the new branch name

## Important Notes

- If there are uncommitted changes, warn the user and suggest stashing or committing first
- If the user is already on a feature branch with uncommitted work, ask before switching
- Always pull the latest main before creating the new branch to avoid conflicts later
