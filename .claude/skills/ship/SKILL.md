---
name: ship
description: Default implementation loop for MammaCare tasks. Use when the user runs /ship <task> or asks to implement/fix/change anything in backend or frontend — traces touchpoints, implements the smallest safe diff, then runs self-review and reports. For investigation-only questions use readonly-audit instead.
---

# ship — task → trace → smallest diff → self-review → report

Task: **$ARGUMENTS**

Execute this loop once per invocation:

## 1. Restate (3 lines max)
- What the task is, in one sentence.
- Acceptance criteria: what must be observably true when done.
- Slice scope: what this run will and will NOT touch.

## 2. Trace touchpoints (before writing anything)
Follow the full chain for every affected behavior:
`model → schema → crud → service → api (router.py registration) → frontend caller (routes.ts / src/api/)`.
Check `backend/app/api/router.py` and `frontend/src/routes.ts` first. Confirm
nothing similar already exists — duplicate implementation is forbidden.

## 3. Plan the smallest safe diff
List the files you will touch and why, one line each. If the list grows beyond
what the acceptance criteria need, cut it back.

## 4. Implement
Follow AGENTS.md rules (async-only, httpx-only, logging-only, /api prefix,
Korean user-facing errors, ingredient_id comparisons, 404 for non-owner).

## 5. Self-review (mandatory)
Invoke the `self-review` skill. Print its final report verbatim and STOP.
Do not summarize past it, do not start a next slice, never run git add/commit/push.

## Allergy / DB constraint (hard rule)
If the task touches allergy logic or the database: do exactly ONE small verified
slice in this run, and say so explicitly in step 1 ("this run does slice X of Y;
remaining slices: …"). Read-only investigation → confirm findings → targeted edit.
Never batch multiple allergy/DB changes into one run.
