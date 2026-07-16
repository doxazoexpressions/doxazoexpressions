import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Trash2, WifiOff, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listDownloads, removeDownload, totalDownloadBytes, formatBytes, type DownloadRecord } from "@/lib/offlineDownloads";
import { toast } from "sonner";

const Downloads = () => {
  const [rows, setRows] = useState<DownloadRecord[]>([]);
  const refresh = () => setRows(listDownloads());
  useEffect(refresh, []);

  const total = totalDownloadBytes();

  const remove = async (id: string) => {
    await removeDownload(id);
    refresh();
    toast("Removed");
  };
  const removeAll = async () => {
    if (!window.confirm("Remove all downloaded devotionals?")) return;
    for (const r of rows) await removeDownload(r.id);
    refresh();
    toast("All downloads cleared");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Downloads — Doxazo Expressions" description="Your offline devotionals — read and listen without a connection." canonical="/downloads" />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">Available offline</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-1">Downloads</h1>
            <p className="text-muted-foreground text-sm">
              {rows.length ? `${rows.length} saved · ${formatBytes(total)}` : "Save devotionals for airplane mode and low-signal moments."}
            </p>
          </div>
          {rows.length > 0 && (
            <Button variant="outline" size="sm" onClick={removeAll} className="gap-1.5">
              <Trash2 className="w-4 h-4" /> Clear all
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <Card className="p-8 text-center">
            <WifiOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-serif text-xl font-bold mb-1">Nothing downloaded yet</h2>
            <p className="text-muted-foreground text-sm mb-4">Tap the Download icon on any devotional to save it here.</p>
            <Button asChild><Link to="/devotional"><Download className="w-4 h-4 mr-2" /> Go to Today</Link></Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif font-semibold truncate">{r.title}</h3>
                  {r.scripture_reference && <p className="text-xs text-accent mt-0.5">{r.scripture_reference}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Saved {new Date(r.savedAt).toLocaleDateString()} · {formatBytes(r.bytes)}{r.audioUrl ? " · audio" : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button asChild size="sm" variant="secondary" className="gap-1.5">
                    <Link to={r.slug ? `/devotional/${r.slug}` : `/devotional`}>
                      <Play className="w-4 h-4" /> Open
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)} aria-label="Remove"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Downloads;
