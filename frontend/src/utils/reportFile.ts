// Report-file save helpers shared by the Allergy screen and the Reports page.
// Extracted verbatim from pages/Allergy/index.tsx so both surfaces keep one copy.
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽지 못했습니다."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("파일을 변환하지 못했습니다."));
        return;
      }
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/** 네이티브 앱 전용: Documents/MammaCare에 저장 후 공유 시트를 연다. 사용자가 공유를 취소(AbortError)하면 조용히 넘어간다. */
export async function saveReportFileApp(blob: Blob, filename: string, title: string): Promise<void> {
  try {
    const permission = await Filesystem.checkPermissions();
    if (permission.publicStorage !== "granted") {
      const requested = await Filesystem.requestPermissions();
      if (requested.publicStorage !== "granted") {
        throw new Error("파일 저장 권한이 필요합니다.");
      }
    }
    const data = await blobToBase64(blob);
    const saved = await Filesystem.writeFile({
      path: `MammaCare/${filename}`,
      data,
      directory: Directory.Documents,
      recursive: true,
    });
    await Share.share({
      title,
      files: [saved.uri],
      dialogTitle: `${title} 저장`,
    });
  } catch (e) {
    if ((e as Error).name !== "AbortError") {
      throw e;
    }
  }
}
