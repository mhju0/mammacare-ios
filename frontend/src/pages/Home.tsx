import { useState, useEffect } from "react";
import { Baby, ChevronDown, Milestone } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Capacitor } from "@capacitor/core";
import TutorialModal from "../components/TutorialModal";
import { tutorialSlides } from "../components/tutorialSlides";
import About from "./About";

// Layout.tsx와 동일하게 모듈 레벨에서 판별
const isApp = Capacitor.isNativePlatform();

export default function Home() {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("showTutorial") === "true") {
      setTutorialOpen(true);
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <>
      {/* 앱: 헤더(48px) + 탭바(80px) = 128px 제외한 높이로 화면을 정확히 채움 */}
      <div
        className="hero"
        style={{ height: isApp ? "calc(100vh - 128px)" : "calc(100vh - 100px)" }}
      >
        {/* 소개 텍스트 (사진 없는 크림 히어로) */}
        <div className="hero-content">
          {/* 웹 text-5xl → 앱 text-3xl */}
          <h1
            className={`hero-head ${isApp ? "!text-3xl" : "!text-5xl !leading-[1.4]"}`}
            style={{ fontFamily: "'Paperlogic'", fontWeight: 500 }}
          >
            우리 아이 첫 이유식,
            <br />
            더 안전하게 시작하세요
          </h1>

          {/* 웹 text-2xl → 앱 text-base */}
          <p className={`hero-sub ${isApp ? "!text-base" : "!text-2xl !leading-[1.6]"}`}>
            개월별 맞춤 식단부터 알레르기 관리까지
            <br />
            맘마케어가 함께합니다
          </p>

          {/* 웹에서만 버튼 표시 — 앱에서는 숨김 */}
          {!isApp && (
            <div className="hero-btns flex-col items-start">
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/about")}
                  className="
                    btn-primary !px-4 !py-2
                    !text-base font-semibold whitespace-nowrap
                    !bg-[radial-gradient(ellipse_at_center,var(--warm-surface)_0%,var(--warm-surface)_100%)]
                    hover:!bg-[radial-gradient(ellipse_at_center,var(--warm-surface)_0%,var(--warm-surface-soft)_100%)]
                    !text-warm-fg
                    transition-all duration-300 shadow-lg
                    flex items-center gap-2
                  "
                >
                  <Baby size={18} />
                  맘마케어란?
                </button>
                <button
                  onClick={() => setTutorialOpen(true)}
                  className="
                    btn-primary !px-4 !py-2
                    !text-base font-semibold whitespace-nowrap
                    !bg-[radial-gradient(ellipse_at_center,var(--warm-surface)_0%,var(--warm-surface)_100%)]
                    hover:!bg-[radial-gradient(ellipse_at_center,var(--warm-surface)_0%,var(--warm-surface-soft)_100%)]
                    !text-warm-fg
                    transition-all duration-300 shadow-lg
                    flex items-center gap-2
                  "
                >
                  <Milestone size={18}/>
                  맘마케어 시작 가이드
                </button>
              </div>
            </div>
          )}
        </div>

        <TutorialModal
          open={tutorialOpen}
          onClose={() => setTutorialOpen(false)}
          slides={tutorialSlides}
          title="맘마케어 시작 가이드"
          mutedSubCaption
        />

        {/* 앱에서만: 아래로 스크롤하면 About 콘텐츠가 있음을 알리는 화살표 */}
        {isApp && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-warm-fg/40" />
          </div>
        )}
      </div>

      {/* 앱에서만: 히어로 바로 아래 About 콘텐츠 연결 */}
      {isApp && <About />}
    </>
  );
}


export function SiteIntroButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-muted/70 px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-muted/50"
      >
        맘마케어 시작 가이드
      </button>

      <TutorialModal
        open={open}
        onClose={() => setOpen(false)}
        slides={tutorialSlides}
        title="맘마케어 시작 가이드"
        mutedSubCaption
      />
    </>
  );
}
