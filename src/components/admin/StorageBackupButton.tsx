import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Backup = {
  files: { bucket: string; path: string; size_bytes: number; download_url: string }[];
  expires_at: string;
  total_bytes: number;
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c] ?? c));

export default function StorageBackupButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const download = async () => {
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke<Backup>("storage-backup", { body: {} });
      if (error || !data?.files || !data.expires_at) throw new Error("Could not prepare backup links. Please try again.");
      const rows = data.files.map((f) => `<tr><td>${escapeHtml(f.bucket)}</td><td><a href="${escapeHtml(f.download_url)}" rel="noreferrer" download>${escapeHtml(f.path)}</a></td><td>${f.size_bytes}</td></tr>`).join("\n");
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Doxazo storage backup downloads</title></head><body><h1>Doxazo storage backup downloads</h1><p>${data.files.length} files, ${(data.total_bytes / 1024 / 1024).toFixed(1)} MB. Links expire ${escapeHtml(data.expires_at)}.</p><p>This is a download index, not a backup of the audio itself. Download every linked file before the links expire. Keep this index private: it grants temporary access to private recordings. Preserve the bucket and path when restoring files.</p><table><thead><tr><th>Bucket</th><th>File</th><th>Bytes</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `doxazo-storage-backup-links-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setResult(`${data.files.length} file links downloaded · valid for 1 hour. Download the linked audio files to complete your backup.`);
      toast({ title: "Backup links downloaded", description: "Open the downloaded file and save the audio files before the links expire. Keep it private." });
    } catch (err) {
      toast({ title: "Backup failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mb-6">
      <Button variant="outline" className="gap-2 min-h-11" disabled={busy} onClick={() => void download()}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
        {busy ? "Preparing download links…" : "Download storage backup"}
      </Button>
      {result && <p role="status" className="text-sm text-muted-foreground mt-2">{result}</p>}
    </div>
  );
}