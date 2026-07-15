import { useState, useEffect } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { findUsernameApi, resetPasswordApi } from "../api/auth";
import { Eye, EyeOff, X } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

type RecoveryMode = "username" | "password";

function isPasswordValid(password: string) {
  return /[a-zA-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8;
}

export default function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode | null>(null);
  useBodyScrollLock(!!recoveryMode);
  const [findIdentifier, setFindIdentifier] = useState("");
  const [maskedUsername, setMaskedUsername] = useState("");
  const [resetUsername, setResetUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const openRecovery = (mode: RecoveryMode) => {
    setRecoveryMode(mode);
    setFindIdentifier("");
    setMaskedUsername("");
    setResetUsername("");
    setResetEmail("");
    setResetNewPassword("");
    setRecoveryError("");
    setRecoveryMessage("");
  };

  const closeRecovery = () => {
    setRecoveryMode(null);
    setRecoveryError("");
    setRecoveryMessage("");
  };

  // 이미 로그인된 상태로 /login 접근 시에만 리다이렉트 (로그인 직후 이중 navigate 방지)
  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(id, pw, keep);
      if (result.success) {
        if (result.isAdmin) {
          navigate("/admin");
        } else if (result.babyCount === 0) {
          navigate("/profile");        // 첫 로그인 — 프로필 등록
        } else if (result.babyCount >= 2) {
          navigate("/profile-select"); // 아기 2명 이상 — 프로필 선택
        } else {
          navigate("/");               // 아기 1명 — 홈
        }
      } else {
        setError("아이디 또는 비밀번호를 확인해주세요.");
      }
    } catch {
      setError("아이디 또는 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryMessage("");
    setMaskedUsername("");
    setRecoveryLoading(true);
    try {
      const masked = await findUsernameApi(findIdentifier);
      setMaskedUsername(masked);
      setRecoveryMessage("가입된 아이디를 찾았습니다.");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "계정 정보를 찾을 수 없습니다.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryMessage("");
    if (!isPasswordValid(resetNewPassword)) {
      setRecoveryError("새 비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.");
      return;
    }
    setRecoveryLoading(true);
    try {
      const message = await resetPasswordApi({
        username: resetUsername,
        email: resetEmail,
        new_password: resetNewPassword,
      });
      setRecoveryMessage(message);
      setId(resetUsername);
      setPw("");
      setResetNewPassword("");
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row min-h-[480px]">

          {/* ── 왼쪽: 로고 ── */}
          <div className="sm:w-[46%] border-b sm:border-b-0 sm:border-r border-border flex flex-col items-center justify-center px-8 py-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <Logo size={60} wordmark={false} />
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: "var(--warm-fg)",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Paperlogic', 'Pretendard', 'Noto Sans KR', sans-serif",
                }}
              >
                맘마케어
              </span>
              <span className="text-sm text-warm-fg-muted">이유식 알레르기 안전 도구</span>
            </div>
          </div>

          {/* ── 오른쪽: 일반 로그인 ── */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10">
            <h2
              className="text-xl font-bold mb-3 text-foreground text-center"
              style={{ fontFamily: "'Paperlogic', sans-serif" }}>
              로그인
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 아이디 */}
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background
                focus:outline-none focus:ring-2 focus:ring-warm-surface-soft text-sm placeholder:text-muted-foreground"
                autoComplete="username"
              />

              {/* 비밀번호 */}
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-input-background 
                  focus:outline-none focus:ring-2 focus:ring-warm-surface-soft text-sm placeholder:text-muted-foreground"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* 오류 메시지 */}
              {error && (
                <p className="text-xs text-destructive px-1">{error}</p>
              )}

              {/* 로그인 유지 + 로그인 버튼 (같은 행) */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keep}
                    onChange={(e) => setKeep(e.target.checked)}
                    className="w-4 h-4 rounded accent-warm-cta cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    자동 로그인
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !id || !pw}
                  className="px-8 py-2.5 text-warm-fg text-sm font-bold rounded-3xl shadow-sm
                  disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap shrink-0
                  bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-100)_100%)]
                  hover:bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-200)_100%)]
                  transition-all duration-300"
                >
                  {loading ? "로그인 중" : "로그인"}
                </button>
              </div>

              {/* 회원가입 + 아이디·비밀번호 찾기 */}
              <div className="flex flex-wrap items-center justify-center gap-1 text-sm">
                <button
                  type="button"
                  className="bg-transparent p-0 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => navigate("/signup")}
                >
                  회원가입
                </button>
                <span className="text-border" aria-hidden="true">|</span>
                <button
                  type="button"
                  className="bg-transparent p-0 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => openRecovery("username")}
                >
                  아이디 찾기
                </button>
                <span className="text-border" aria-hidden="true">|</span>
                <button
                  type="button"
                  className="bg-transparent p-0 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => openRecovery("password")}
                >
                  비밀번호 찾기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {recoveryMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 pt-16">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-end px-2">
              <button
                type="button"
                onClick={closeRecovery}
                className="rounded-full mt-1 p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-5">
              <div className="mb-4 flex gap-0 rounded-3xl p-1.5
                bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-50)_100%)]">
                {(["username", "password"] as RecoveryMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => openRecovery(mode)}
                    className="relative flex-1 py-2.5 rounded-3xl text-sm font-bold transition-colors"
                  >
                    {recoveryMode === mode && (
                      <motion.div
                        layoutId="recoveryTabPill"
                        className="absolute inset-0 rounded-3xl
                          bg-[radial-gradient(ellipse_at_center,var(--warm-surface-soft)_0%,var(--warm-surface)_100%)] shadow-sm"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 ${recoveryMode === mode ? "text-warm-fg" : "text-muted-foreground"}`}>
                      {mode === "username" ? "아이디 찾기" : "비밀번호 변경"}
                    </span>
                  </button>
                ))}
              </div>

              {recoveryMode === "username" ? (
                <form onSubmit={handleFindUsername} className="space-y-3">
                  <label className="block text-sm text-muted-foreground">이메일 또는 전화번호</label>
                  <input
                    type="text"
                    value={findIdentifier}
                    onChange={(e) => setFindIdentifier(e.target.value)}
                    placeholder="test@example.com 또는 010-1234-5678"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-warm-surface-soft"
                    autoComplete="email"
                  />
                  {maskedUsername && (
                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground">
                      아이디: {maskedUsername}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!findIdentifier.trim() || recoveryLoading}
                    className="w-full rounded-xl py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60
                    bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-100)_100%)]
                    hover:bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-200)_100%)]
                    shadow-sm transition-all duration-300"
                  >
                    {recoveryLoading ? "조회 중" : "아이디 찾기"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <label className="block text-sm text-muted-foreground">아이디</label>
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-warm-surface-soft"
                    autoComplete="username"
                  />
                  <label className="block text-sm text-muted-foreground">이메일</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="가입한 이메일 주소"
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-warm-surface-soft"
                    autoComplete="email"
                  />
                  <label className="block text-sm text-muted-foreground">새 비밀번호</label>
                  <div className="relative">
                    <input
                      type={resetShowPassword ? "text" : "password"}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="영문+숫자 8자 이상"
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-warm-surface-soft"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setResetShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {resetShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!resetUsername.trim() || !resetEmail.trim() || !resetNewPassword || recoveryLoading}
                    className="w-full rounded-xl py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60
                    bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-100)_100%)]
                    hover:bg-[radial-gradient(ellipse_at_center,var(--sage-50)_0%,var(--sage-200)_100%)]
                    shadow-sm transition-all duration-300"
                  >
                    {recoveryLoading ? "변경 중" : "비밀번호 변경"}
                  </button>
                </form>
              )}

              {recoveryError && (
                <p className="mt-3 text-sm text-destructive">{recoveryError}</p>
              )}
              {recoveryMessage && (
                <p className="mt-3 text-sm font-medium text-foreground">{recoveryMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
