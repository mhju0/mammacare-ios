import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Bell, Download } from "lucide-react";
import { Capacitor } from "@capacitor/core";

import { useApp } from "../../context/AppContext";
import { fetchReportFile, fetchReportImage } from "../../api/allergy";
import { saveReportFileApp } from "../../utils/reportFile";
import { AuthImage } from "../../components/AuthImage";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

const isApp = Capacitor.isNativePlatform();
const REPORT_DAYS = 7;

// warm-kr screen shell: page bg + header (baby avatar · title · 알림) — Ingredients/Observe와 동일 패턴.
function ReportsShell({ babyPhoto, children }: { babyPhoto: string | null; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-warm-bg px-4 py-5">
      <div className="mx-auto flex max-w-md flex-col gap-5 pb-10">
        <header className="flex items-center gap-3 px-1">
          {babyPhoto ? (
            <AuthImage src={babyPhoto} alt="" className="size-10 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="size-10 shrink-0 rounded-full bg-warm-surface-soft" aria-hidden="true" />
          )}
          <h1 className="flex-1 text-xl font-bold text-warm-brand">리포트</h1>
          <button
            onClick={() => navigate("/notifications")}
            aria-label="알림"
            className="grid size-10 place-items-center rounded-full bg-warm-surface text-warm-fg shadow-warm"
          >
            <Bell className="size-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export default function Reports() {
  const { token, activeBaby, authLoading } = useApp();
  const navigate = useNavigate();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "jpg" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  // 아기 전환/언마운트 후 도착한 응답 무시 — 다른 아기 리포트가 표시/다운로드되는 레이스 방지.
  const loadEpochRef = useRef(0);

  const loadPreview = useCallback(async () => {
    if (!token || !activeBaby) return;
    const epoch = ++loadEpochRef.current;
    setLoading(true);
    setError(null);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setPreviewBlob(null);
    try {
      const { previewUrl: url, blob } = await fetchReportImage(activeBaby.id, token, REPORT_DAYS);
      if (epoch !== loadEpochRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewBlob(blob);
      setLoading(false);
    } catch (e) {
      if (epoch !== loadEpochRef.current) return;
      setError(e instanceof Error ? e.message : "리포트 생성에 실패했습니다.");
      setLoading(false);
    }
  }, [token, activeBaby]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  // object URL 정리 + 진행 중 요청 무효화 — 페이지 이탈 시 누수 방지
  useEffect(() => {
    return () => {
      loadEpochRef.current += 1;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: "pdf" | "jpg") => {
    if (!token || !activeBaby) return;
    setDownloading(format);
    setDownloadError(null);
    try {
      if (format === "jpg") {
        const blob = previewBlob ?? (await fetchReportFile(activeBaby.id, token, REPORT_DAYS, "jpeg"));
        if (isApp) await saveReportFileApp(blob, "allergy_report.jpg", "알레르기 리포트 JPG");
        else downloadBlob(blob, "allergy_report.jpg");
      } else {
        const blob = await fetchReportFile(activeBaby.id, token, REPORT_DAYS, "pdf");
        if (isApp) await saveReportFileApp(blob, "allergy_report.pdf", "알레르기 리포트 PDF");
        else downloadBlob(blob, "allergy_report.pdf");
      }
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "다운로드에 실패했습니다.");
    } finally {
      setDownloading(null);
    }
  };

  const babyPhoto = activeBaby?.photo ?? null;

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
      <ReportsShell babyPhoto={babyPhoto}>
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
      </ReportsShell>
    );
  }

  return (
    <ReportsShell babyPhoto={babyPhoto}>
      <p className="px-1 text-sm leading-relaxed text-warm-fg-muted">
        최근 {REPORT_DAYS}일의 알레르기 기록을 모아 진료 시 활용할 수 있는 리포트를 만들어 드려요.
      </p>

      {loading ? (
        <Skeleton className="aspect-[210/297] w-full rounded-3xl" />
      ) : error ? (
        <Card variant="warm">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm font-semibold text-warm-fg">{error}</p>
            <button
              onClick={loadPreview}
              className="rounded-full bg-warm-brand px-4 py-2 text-sm font-bold text-warm-brand-fg hover:bg-warm-brand-hover"
            >
              다시 시도
            </button>
          </div>
        </Card>
      ) : (
        previewUrl && (
          <>
            <Card variant="warm" className="overflow-hidden p-2">
              <img
                src={previewUrl}
                alt={`${activeBaby.name}의 알레르기 리포트 미리보기`}
                className="w-full rounded-2xl border border-warm-border"
              />
            </Card>

            {downloadError && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-reaction-bg px-4 py-2.5 text-sm text-reaction-fg">
                <span className="font-semibold">{downloadError}</span>
                <button
                  onClick={() => setDownloadError(null)}
                  className="shrink-0 rounded-full bg-warm-surface px-3 py-1 text-xs font-bold text-warm-brand"
                >
                  닫기
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDownload("pdf")}
                disabled={downloading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-warm-cta py-3.5 text-base font-bold text-warm-cta-fg transition-colors hover:bg-warm-cta-hover disabled:opacity-60"
              >
                <Download className="size-5" />
                {downloading === "pdf" ? "PDF 만드는 중…" : "PDF 내려받기"}
              </button>
              <button
                onClick={() => handleDownload("jpg")}
                disabled={downloading !== null}
                className="w-full rounded-full border border-warm-border bg-warm-surface py-3 text-sm font-bold text-warm-brand transition-colors hover:bg-warm-surface-soft disabled:opacity-60"
              >
                {downloading === "jpg" ? "이미지 만드는 중…" : "JPG로 내려받기"}
              </button>
            </div>
          </>
        )
      )}
    </ReportsShell>
  );
}
