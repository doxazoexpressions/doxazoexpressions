import { useEffect, useState } from "react";
import { Download, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isDownloaded, saveDownload, removeDownload, formatBytes } from "@/lib/offlineDownloads";

type Props = {
  devotionalId: string;
  slug: string | null;
  title: string;
  scripture_reference?: string | null;
  audioUrl?: string | null;
  compact?: boolean;
};

/**
 * Explicit per-devotional "Download for offline" toggle.
 * Downloads the audio blob into Cache Storage and records it in the local
 * manifest so /downloads and the DailyDevotional page can render offline.
 */
const DownloadButton = ({ devotionalId, slug, title, scripture_reference, audioUrl, compact }: Props) => {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { setSaved(isDownloaded(devotionalId)); }, [devotionalId]);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await removeDownload(devotionalId);
        setSaved(false);
        toast("Removed from downloads");
      } else {
        const rec = await saveDownload(
          { id: devotionalId, slug, title, scripture_reference, audioUrl },
          (frac) => setProgress(frac)
        );
        setSaved(true);
        toast.success(audioUrl ? `Saved offline (${formatBytes(rec.bytes)})` : "Saved offline");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const Icon = busy ? Loader2 : saved ? (compact ? Trash2 : Check) : Download;
  const label = busy
    ? (progress > 0 ? `Downloading ${(progress * 100).toFixed(0)}%…` : "Downloading…")
    : saved
      ? "Saved offline"
      : "Download for offline";

  return (
    <Button
      onClick={onClick}
      disabled={busy}
      variant={saved ? "secondary" : "outline"}
      size={compact ? "sm" : "default"}
      className="gap-2"
      aria-label={label}
    >
      <Icon className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
      {compact ? (saved ? "Saved" : "Save") : label}
    </Button>
  );
};

export default DownloadButton;
