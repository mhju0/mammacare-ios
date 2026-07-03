---
name: design-polish
description: UI polish procedure for MammaCare screens. Use when a task is visual/styling work — polishing a screen, aligning to the design system, fixing spacing/colors/empty states. One screen per run, tokens only. Not for new features or logic changes (use ship).
---

# design-polish — token-only UI refinement, one screen per run

## Before touching anything
Read `DESIGN_SYSTEM.md` and `frontend/src/styles/theme.css` first, every run.
The design language is Clinic 블루 + 자연 포인트, and 알레르기 상태 = 신호등
(safe 초록 / testing 노랑 / reaction 빨강) — color IS function here.

## Rules
- **Existing tokens/components only**: semantic tokens from `theme.css`, and
  existing components (`StatusChip`, `Card`, `MetricTile`…). If a genuinely new
  color is needed, it becomes a token in `theme.css` FIRST, then gets used.
- **Hard gate** — after editing, run against every changed file:
  ```bash
  rg -n '#[0-9a-fA-F]{3,8}' <changed files>
  ```
  This must return NOTHING outside `theme.css`. Any raw hex in a component is a
  gate failure — tokenize it or revert it.
- **Color never carries meaning alone**: every status color pairs with icon+text
  and appropriate `aria-*` labels (traffic-light must survive grayscale).
- **Empty / loading / error states** are required for every screen you touch —
  polishing only the happy path is a gate failure.
- **Never paste Stitch/AI-generated HTML/CSS directly.** Mockups are visual
  reference only; reimplement with project tokens and components.
- **One screen per run.** If the task names multiple screens, do the first and
  list the rest as follow-up runs.

## Finish (all required)
1. `cd frontend && pnpm build` passes.
2. The hex hard-gate above returns clean.
3. Before/after screenshots of the screen (browser or simulator).
4. Then run the `self-review` skill as usual.
