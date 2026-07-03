# e2e-checklist — demo spine + consent gate + bonus

Report every checkpoint in this exact format:
체크포인트 라벨 → 스크린샷 or "정상" → 콘솔 에러 전문 → 실패 요청은 네트워크 status code + response body

## [demo spine]
- [ ] 아기 등록/선택 → 대시보드 진입
- [ ] 다음 추천 "도입 시작" → testing 카운트 +1, 진행바 노출, in-progress 행 생성
- [ ] 3일 관찰 진행바 day N/3 정확
- [ ] 반응 기록 → 즉시 completed_reaction(빨강), reaction 카운트 +1
- [ ] 교차반응 경고 자동 표시(예: 우유 반응 → 유제품 주의)
- [ ] 음식 여권 PDF 출력(한글 폰트 깨짐 확인)

## [consent gate 5]
- [ ] 빨강 재료 재제출 → 다이얼로그 뜸, 취소 시 무변경(선택 유지)
- [ ] "다시 테스트 시작" → 정상 재테스트 진행
- [ ] 초록(completed_safe) 재테스트 → 다이얼로그 안 뜸
- [ ] 신규 재료 → 다이얼로그 안 뜸(오발동 0)
- [ ] 취소 버튼이 "다시 테스트 시작"보다 시각적으로 무거움(안전 디폴트)

## [bonus]
- [ ] 재테스트 후 옛 SymptomCheck/사진 잔존 0 + backend/uploads/ 고아 파일 0
- [ ] 미래 예약 테스트(start>now)에 반응 기록해도 즉시 확정 안 됨

## Known bomb sites to watch
- PDF Korean font embedding
- cross-reactivity silently not firing on name mismatch ("안 뜸"도 버그)
- orphan images after retest

Done = every checkpoint has 정상/screenshot evidence + zero unexplained console errors.
