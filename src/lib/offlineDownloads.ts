/**
 * Explicit "Download for offline" store — separate from the general HTTP cache.
 *
 * We keep a small manifest in localStorage (list of saved devotionals + audio)
 * and put the actual audio Blob in a dedicated Cache Storage entry so the file
 * survives page reloads and works fully offline (airplane mode).
 *
 * This is the "real" download experience Apple expects — the user opts in per
 * item and can remove them from a downloads manager screen.
 */

export type DownloadRecord = {
  id: string;                 // devotional id
  slug: string | null;
  title: string;
  scripture_reference?: string | null;
  audioUrl?: string | null;   // remote URL we downloaded
  bytes: number;              // best-effort audio size
  savedAt: string;
};

const MANIFEST_KEY = "doxazo.downloads.manifest.v1";
const CACHE_NAME = "doxazo-downloads-v1";

function readManifest(): DownloadRecord[] {
  try {
    const raw = localStorage.getItem(MANIFEST_KEY);
    return raw ? (JSON.parse(raw) as DownloadRecord[]) : [];
  } catch { return []; }
}
function writeManifest(rows: DownloadRecord[]) {
  try { localStorage.setItem(MANIFEST_KEY, JSON.stringify(rows)); } catch {}
}

export function listDownloads(): DownloadRecord[] {
  return readManifest().sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export function isDownloaded(devotionalId: string): boolean {
  return readManifest().some((r) => r.id === devotionalId);
}

async function openCache() {
  if (typeof caches === "undefined") throw new Error("Offline downloads not supported on this device.");
  return caches.open(CACHE_NAME);
}

export async function saveDownload(input: {
  id: string;
  slug: string | null;
  title: string;
  scripture_reference?: string | null;
  audioUrl?: string | null;
}, onProgress?: (frac: number) => void): Promise<DownloadRecord> {
  const cache = await openCache();
  let bytes = 0;

  if (input.audioUrl) {
    const res = await fetch(input.audioUrl);
    if (!res.ok) throw new Error("Couldn't download audio (" + res.status + ").");
    // Stream to measure size + report progress, then re-put in cache as one blob.
    const total = Number(res.headers.get("content-length") || 0);
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    if (reader) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          bytes += value.byteLength;
          if (total && onProgress) onProgress(Math.min(1, bytes / total));
        }
      }
    }
    const blob = new Blob(chunks as BlobPart[], { type: res.headers.get("content-type") || "audio/mpeg" });
    await cache.put(input.audioUrl, new Response(blob, { headers: { "content-type": blob.type } }));
  }

  const record: DownloadRecord = {
    id: input.id,
    slug: input.slug,
    title: input.title,
    scripture_reference: input.scripture_reference ?? null,
    audioUrl: input.audioUrl ?? null,
    bytes,
    savedAt: new Date().toISOString(),
  };
  const next = readManifest().filter((r) => r.id !== record.id).concat(record);
  writeManifest(next);
  return record;
}

export async function removeDownload(devotionalId: string) {
  const manifest = readManifest();
  const rec = manifest.find((r) => r.id === devotionalId);
  if (rec?.audioUrl && typeof caches !== "undefined") {
    try {
      const cache = await openCache();
      await cache.delete(rec.audioUrl);
    } catch {}
  }
  writeManifest(manifest.filter((r) => r.id !== devotionalId));
}

export async function getCachedAudioUrl(remoteUrl: string): Promise<string | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await openCache();
    const hit = await cache.match(remoteUrl);
    if (!hit) return null;
    const blob = await hit.blob();
    return URL.createObjectURL(blob);
  } catch { return null; }
}

export function totalDownloadBytes(): number {
  return readManifest().reduce((sum, r) => sum + (r.bytes || 0), 0);
}

export function formatBytes(n: number): string {
  if (!n) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return v.toFixed(v < 10 && i > 0 ? 1 : 0) + " " + units[i];
}
