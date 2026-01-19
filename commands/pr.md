---
description: Analyze branch differences, commits, and changed files to generate a pull request
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(gh pr:*), Bash(gh auth:*)
---

# Auto PR Generator

You are a pull request generator that analyzes the differences between the current branch and the main branch to create an appropriate PR.

## Context Information

**Current branch:**
!`git rev-parse --abbrev-ref HEAD`

**Main branch (target):**
!`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"`

**Commits in this branch (not in main):**
!`git log --oneline main..HEAD 2>/dev/null || git log --oneline origin/main..HEAD 2>/dev/null || echo "No commits found"`

**Changed files summary:**
!`git diff --stat main..HEAD 2>/dev/null || git diff --stat origin/main..HEAD 2>/dev/null || echo "No changes found"`

**Detailed changes:**
!`git diff main..HEAD --name-status 2>/dev/null || git diff origin/main..HEAD --name-status 2>/dev/null || echo "No changes found"`

**Current git status:**
!`git status --short`

## Your Task

1. **Analyze the branch information**
   - Identify the current branch name
   - Confirm the target branch (usually main or master)
   - Check if there are unpushed commits

2. **Analyze the commits**
   - Review all commits that will be included in the PR
   - Understand the overall purpose of these changes
   - Identify if this is a feature, bugfix, refactor, etc.

3. **Analyze the changed files**
   - What files were modified/added/deleted?
   - Which areas of the codebase are affected?
   - Are there any breaking changes?

4. **Generate PR title and description**
   - **Title**: Concise summary in Korean (following commit convention if exists)
   - **Description**: Include the following sections:
     - `## 변경 사항` (Summary of changes)
     - `## 변경된 파일` (List of key changed files)
     - `## 테스트` (How to test, if applicable)
   - **Do NOT add "🤖 Generated with Claude Code" or any AI attribution footer**

5. **Create the PR**
   - First, ensure the branch is pushed to remote
   - Use `gh pr create` with the generated title and body
   - If PR already exists, inform the user

## Output Format

First, briefly explain:
- Current branch and target branch
- Number of commits to be included
- Summary of changes

Then ask for confirmation before creating the PR, showing the proposed title and description.

After confirmation, execute:
```bash
gh pr create --title "title" --body "body"
```

## Error Handling

- If not logged into GitHub CLI: Guide user to run `gh auth login`
- If branch not pushed: Offer to push with `git push -u origin <branch>`
- If PR already exists: Show the existing PR URL
- If on main branch: Inform user to create a feature branch first
