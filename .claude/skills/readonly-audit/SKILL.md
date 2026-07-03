---
name: readonly-audit
description: Investigation mode for MammaCare. Use when the user asks "why/where/how does X work", "is Y true", "audit Z", or before planning a risky change — produces evidence-tagged findings with zero writes. Do NOT use when the user asked for an implementation (use ship).
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git show:*), Bash(rg:*), Bash(ls:*), Bash(cat:*), Bash(head:*), Bash(tail:*), Bash(wc:*), Bash(find:*)
---

# readonly-audit — investigate, tag evidence, recommend, change nothing

## Rules
- ZERO writes: no Edit/Write, no file creation, no git mutations of any kind.
  Read-only git (`status`, `log`, `diff`, `show`) is allowed.
- Navigate rg-first: locate with `rg -n`, then Read only the relevant ranges.
  Don't dump whole files into context.
- Trace claims to ground truth: code + local DB schema outrank every doc. If a
  doc disagrees with code, the code wins — report the doc as stale.

## Evidence tagging (every claim, no exceptions)
- `[Verified]` — you read the code/output and confirmed it. Cite `file:line`.
- `[Inferred]` — reasoned from verified facts but not directly confirmed. Say
  what would confirm it.
- `[Unknown]` — could not determine. Say what's missing (e.g. needs a live DB
  query, needs a browser run).

## Standard trace order
1. `git status -sb` + recent `git log --oneline` for repo state.
2. Router registration (`backend/app/api/router.py`) and frontend routes
   (`frontend/src/routes.ts`) to anchor the feature.
3. Follow model → schema → crud → service → api → frontend caller.
4. For allergy work: check insert paths, dedup keys, and the
   `ex_ingredient_testing_no_overlap` EXCLUDE constraint assumptions.

## Output (exact structure)
1. **Findings** — tagged claims with `file:line`, most important first.
2. **Recommended next action** — one concrete step (often "run /ship <slice>"
   or "run /e2e-check checkpoint N").
3. **Smallest-diff sketch** — DESCRIBED, not applied: which files, which
   functions, roughly what changes. No code edits in this mode, ever.
