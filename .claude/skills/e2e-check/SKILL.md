---
name: e2e-check
description: Demo-spine E2E runner/guide for MammaCare. Use when the user asks to run/verify the E2E flow, close M3/P1, check the demo spine, or verify the consent gate in a real browser — drives browser automation if available, otherwise guides the human step by step and assembles their findings.
---

# e2e-check — demo-spine E2E (first real-click verification)

The full checkpoint list lives in `e2e-checklist.md` next to this file. Read it
before starting. This skill defines procedure and evidence format.

## Preflight
Both servers must be running; start them if not (background):
```bash
cd backend && source ../venv/bin/activate && uvicorn app.main:app --reload
cd frontend && pnpm dev
```
Verify: backend answers on its port (`curl -s localhost:8000/docs -o /dev/null -w '%{http_code}'`),
frontend dev server is serving. A test account + at least one registered baby may
be needed — create via the UI as part of checkpoint 1.

## Execution mode
- If a browser automation tool/MCP is available in this session: drive it
  yourself, checkpoint by checkpoint, capturing screenshots and console/network
  evidence.
- Otherwise: walk the human through each checkpoint one at a time — tell them
  exactly what to click, what to look at (console open, network tab open), and
  what to paste back. Assemble their answers into the same report format.

## Per-checkpoint report format (exact)
체크포인트 라벨 → 스크린샷 or "정상" → 콘솔 에러 전문 → 실패 요청은 네트워크 status code + response body

One block per checkpoint, in checklist order. No checkpoint may be skipped
silently — if one is blocked, record it as blocked with the reason.

## Known bomb sites (watch extra carefully)
- PDF Korean font embedding — 음식 여권 출력에서 한글이 □□ 로 깨지는지.
- Cross-reactivity silently not firing on name mismatch — 경고가 "안 뜸"도
  버그다 (CROSS_REACTIVITY_MAP은 이름 키 기반이므로 이름 불일치 시 조용히 실패).
- Orphan images after retest — 재테스트 후 `backend/uploads/` 고아 파일.

## Done criteria
Every checkpoint has 정상/screenshot evidence + zero unexplained console errors.
Anything less: report which checkpoints failed/blocked and hand the list to a
fix pass (`/ship`, one slice per finding for allergy/DB items).
