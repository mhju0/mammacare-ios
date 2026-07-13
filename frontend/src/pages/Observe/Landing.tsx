import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { Eye } from "lucide-react";

import { useApp } from "../../context/AppContext";
import { listTestings } from "../../api/allergy";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

// 관찰 탭 랜딩: 진행 중(testing) 테스트가 있으면 그 관찰 화면으로 보내고, 없으면
// 빈 상태를 보여 준다. 동시 테스트는 DB EXCLUDE로 아기당 1개이므로 최신 1행만 고른다.
export default function ObserveLanding() {
  const { token, activeBaby, authLoading } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTestingId, setActiveTestingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token || !activeBaby) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveTestingId(null);
    listTestings(activeBaby.id, token)
      .then((rows) => {
        if (cancelled) return;
        const active = rows
          .filter((t) => t.test_status === "testing")
          .sort((a, b) => (a.test_start_date < b.test_start_date ? 1 : -1))[0];
        setActiveTestingId(active?.id ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("관찰 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, activeBaby, reloadKey]);

  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-warm-bg text-sm text-warm-fg-muted">
        로그인 상태 확인 중
      </div>
    );
  }

  if (!token || !activeBaby) {
    const needsBaby = Boolean(token);
    return (
      <div className="min-h-full bg-warm-bg px-4 py-5">
        <div className="mx-auto max-w-md">
          <Card variant="warm">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm font-semibold text-warm-fg">
                {needsBaby ? "등록된 아기가 없어요." : "로그인이 필요한 서비스예요."}
              </p>
              <button
                onClick={() => navigate(needsBaby ? "/profile/add" : "/login")}
                className="rounded-full bg-warm-brand px-4 py-2 text-sm font-bold text-warm-brand-fg hover:bg-warm-brand-hover"
              >
                {needsBaby ? "아기 등록하기" : "로그인하기"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full bg-warm-bg px-4 py-5">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (activeTestingId) {
    return <Navigate to={`/observe/${activeTestingId}`} replace />;
  }

  return (
    <div className="min-h-full bg-warm-bg px-4 py-5">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="px-1 text-xl font-bold text-warm-brand">관찰</h1>
        <Card variant="warm">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-warm-surface-soft">
              <Eye className="size-7 text-warm-brand" />
            </span>
            {error ? (
              <p className="text-sm font-semibold text-warm-fg">{error}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-warm-fg">지금 관찰 중인 테스트가 없어요.</p>
                <p className="text-xs leading-relaxed text-warm-fg-muted">
                  새 재료 테스트를 시작하면 72시간 관찰이 여기에 표시돼요.
                </p>
              </>
            )}
            <button
              onClick={() => (error ? setReloadKey((k) => k + 1) : navigate("/ingredients"))}
              className="rounded-full bg-warm-cta px-5 py-2.5 text-sm font-bold text-warm-cta-fg hover:bg-warm-cta-hover"
            >
              {error ? "다시 시도" : "식재료 도감에서 시작하기"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
