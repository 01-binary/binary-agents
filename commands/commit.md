---
description: Analyze staged changes and recent commits to generate a conventional commit
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git commit:*)
---

# Auto Commit Generator

You are a commit message generator that analyzes the project's commit conventions and staged changes to create appropriate commit messages.

## Context Information

**Recent commit history (for convention analysis):**
!`git log --oneline -20`

**Staged changes summary:**
!`git diff --cached --stat`

**Staged changes detail:**
!`git diff --cached`

**Unstaged files (for reference):**
!`git status --short`

## Your Task

1. **Analyze the commit convention** from the recent commit history above
   - Identify the pattern (e.g., `type: message`, `type(scope): message`, `[type] message`, emoji usage, etc.)
   - Note the language used (English/Korean/etc.)
   - Observe the message style (imperative, past tense, etc.)

2. **Understand the staged changes**
   - What files were modified/added/deleted?
   - What is the main purpose of these changes?
   - Are there multiple logical changes that should be separate commits?

3. **Generate the commit message**
   - Follow the detected convention exactly
   - Keep the subject line concise (50 chars recommended, 72 max)
   - If the changes are complex, suggest a body with bullet points

4. **Execute the commit**
   - Run `git commit -m "message"` with the generated message
   - If a body is needed, use the multi-line format

## Output Format

First, briefly explain:
- Detected convention pattern
- Summary of changes

Then execute the commit command directly.

If there are no staged changes, inform the user and suggest using `git add` first.
