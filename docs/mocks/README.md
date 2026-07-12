# docs/mocks — 디자인 기준 시안

## 세트
- **`warm-kr/` — 1차 방향(채택).** 페일 로즈 배경(`#FFF8F7`) + 코랄 CTA(`#FF8B7D`) + 딥 테라코타 브랜드(`#9E4037`). 코드 토큰은 `frontend/src/styles/theme.css:68~`에 시안에서 직접 샘플링해 반영됨.
- **`clinical-en/` — 정보 구조 참고용.** 클리닉 블루("SafeSprout"). 레이아웃(진행 카드 → 신호등 스트립 → 추천 카드 → 최근 활동)이 잘 잡혀 있어 **구조만** 참고한다. 색·무드는 따라가지 않는다.

## 커버리지

| 화면 | warm-kr | clinical-en | 구현 상태 (2026-07-13) |
|---|---|---|---|
| 홈(대시보드 히어로) | ✅ home.png | ✅ | warm-kr 적용 커밋됨(42f7622) |
| 식재료 도감 | ✅ ingredients.png | ✅ | WIP 슬라이스(미커밋) |
| 72시간 관찰 | ✅ observe-72h.png | ✅ | warm-kr 적용 커밋됨(2bd4e2c) |
| 프로필 | ✅ profile.png | ✅ | 미착수(구 디자인) |
| 리포트(음식 여권) | ❌ 미생성 | ❌ | 구 디자인 — **시안부터** |
| 알레르기 타임라인 | ❌ 미생성 | ❌ | 구 디자인 — **시안부터** |
| 재료 상세 | ❌ 미생성 | ❌ | 미착수 |
| 온보딩/로그인 | ❌ 미생성 | ❌ | 구 디자인 |

## 외부 레퍼런스 — 어느 앱에서 뭘 배울지

- **Solid Starts** (iOS, 이유식 도입 앱의 사실상 표준) — 소아과·알레르기 전문의 팀이 만든 400+ 재료 DB. **훔칠 것**: 재료 상세 화면 구조(월령별 서빙 방법·알레르겐/질식 가이드·"무엇을 관찰할지"), 알레르겐 도입 단계별 UX, 반응 기록을 식사에 연결해 소아과 공유용 데이터로 만드는 플로우. → 재료 상세·식재료 도감·리포트 화면의 1차 벤치마크.
- **Huckleberry** (iOS Editor's Choice, 수면/육아 트래커 1위) — **훔칠 것**: "지친 보호자가 3초 안에 기록"하는 대시보드의 큰 탭 타깃, 차분한 저채도 팔레트와 낮은 정보 밀도, 기록 데이터를 따뜻한 서사로 바꾸는 톤. → 홈 히어로·기록 UX 벤치마크. warm-kr 방향과 결이 같다.
- **Fig / Spokin** (식품 알레르기 특화 앱) — **훔칠 것**: 알레르겐 필터·경고의 명확한 시각 언어, "이 재료가 왜 위험한지" 근거를 함께 보여 주는 신뢰 장치. → 교차반응 경고·반응 재테스트 동의 게이트 카피/표현 참고.
- 공통 교훈: 셋 다 **한 가지 문제를 깊게** 판다. MammaCare 포지셔닝("알레르기 안전 도구")과 같다 — 화면을 늘리지 말고 데모 경로를 깊게.

## 미생성 시안 만들기 (higgsfield CLI)

전제: `higgsfield auth login` 1회 필요(2026-07-13 기준 미인증 상태).
스타일 고정을 위해 **기존 warm-kr 시안을 reference 이미지로 항상 전달**한다.

```bash
higgsfield generate create gpt_image_2 \
  --image docs/mocks/warm-kr/home.png \
  --prompt "<아래 화면별 프롬프트>" \
  --aspect_ratio 9:16 --resolution 2k --wait
```

공통 프리픽스(모든 프롬프트 앞에 붙임):

> Mobile app UI mockup, exact same design system as the reference image: Korean baby-food allergy tracking app, pale rose background #FFF8F7, white rounded cards with soft terracotta-tinted shadow, deep terracotta #9E4037 brand accents, coral #FF8B7D pill CTA, Korean UI text with small English labels, 5-tab bottom nav (Home, Ingredients, Observe, Reports, Profile), clean readable typography, calm and warm, no device frame.

화면별 본문:

- **reports.png** — "Reports screen, header '리포트'. Food-passport preview card: baby name + age, safe ingredients list with green check dots, reaction ingredients with red dots. Coral pill CTA 'PDF 내려받기', secondary text button '진료 시 공유'. Monthly summary strip (safe/testing/reaction counts). Reports tab active."
- **allergy-timeline.png** — "Allergy history screen, header '알레르기 기록'. Vertical timeline grouped by date: test started (yellow dot), symptom logged (red dot with small photo thumbnail), confirmed safe (green dot with check). Ingredient filter chips at top. Calm spacing, one event card per row."
- **ingredient-detail.png** — "Ingredient detail screen for 달걀 (egg): hero food photo in rounded frame, status chip '반응' in red, recommended age badge '생후 6개월+', cross-reactivity warning card in soft red ('교차반응 주의: 메추리알'), past test history list, bottom guarded action '다시 테스트 시작' styled as cautious secondary, not primary."
- **onboarding-login.png** — "First-run welcome screen: full-bleed soft photo of baby food preparation fading into #FFF8F7 at bottom, tagline '한 재료씩, 안전하게, 놓치지 않게.', below it login buttons: Kakao (yellow), Naver (green), Google (white outline), '이메일로 시작하기' text link. Minimal, one focal point, no bottom nav."

생성 후: 결과를 `docs/mocks/warm-kr/<이름>.png`로 저장하고 위 커버리지 표를 갱신한다.
