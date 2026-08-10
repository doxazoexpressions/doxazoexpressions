/**
 * Cross-platform "save this image" flow.
 *
 * Web:    real file download via an object-URL anchor (data: URLs are blocked
 *         by some browsers and silently do nothing — that was the old bug).
 * Native: write the PNG into the app cache with @capacitor/filesystem and hand
 *         the file URI to the native share sheet, which gives the iOS
 *         "Save Image" action. iOS has no direct browser download.
 */
import { Capacitor } from "@capacitor/core";

export type SaveImageResult = "downloaded" | "shared" | "shown";

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return res.blob();
};

const base64FromDataUrl = (dataUrl: string) => dataUrl.split(",")[1] ?? "";

export async function saveImage(
  dataUrl: string,
  filename = "doxazo-verse.png",
  shareText?: string,
): Promise<SaveImageResult> {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64FromDataUrl(dataUrl),
      directory: Directory.Cache,
    });
    await Share.share({
      title: "Doxazo Expressions",
      text: shareText,
      files: [written.uri],
    });
    return "shared";
  }

  // Web Share with files (Android Chrome, iOS Safari 16+ in-browser)
  try {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as any;
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], text: shareText });
      return "shared";
    }
  } catch {
    /* fall through to download */
  }

  try {
    const blob = await dataUrlToBlob(dataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "downloaded";
  } catch {
    return "shown";
  }
}
