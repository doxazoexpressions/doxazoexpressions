import { useState } from "react";
import { ImageDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { shareNative, isNative } from "@/lib/native";
import { track } from "@/lib/analytics";

type Props = {
  title: string;
  scripture?: string | null;
  quote?: string | null; // declaration or excerpt
};

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCard(title: string, scripture: string | null, quote: string): HTMLCanvasElement {
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  // Background gradient (navy → deeper navy) with gold glow
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#1a2c4a");
  g.addColorStop(1, "#0f1a2b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const radial = ctx.createRadialGradient(W / 2, H * 0.15, 40, W / 2, H * 0.15, 700);
  radial.addColorStop(0, "rgba(212, 165, 82, 0.28)");
  radial.addColorStop(1, "rgba(212, 165, 82, 0)");
  ctx.fillStyle = radial; ctx.fillRect(0, 0, W, H);
  // Gold rule
  ctx.fillStyle = "#d4a552";
  ctx.fillRect(80, 140, 80, 4);
  // Kicker
  ctx.fillStyle = "#d4a552";
  ctx.font = "600 28px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("DOXAZO EXPRESSIONS", 80, 120);
  // Title
  ctx.fillStyle = "#f5efe1";
  ctx.font = "700 56px 'Playfair Display', Georgia, serif";
  wrapLines(ctx, title, W - 160).slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, 80, 240 + i * 68);
  });
  // Scripture
  if (scripture) {
    ctx.fillStyle = "#d4a552";
    ctx.font = "600 30px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(scripture, 80, 480);
  }
  // Quote
  ctx.fillStyle = "#f5efe1";
  ctx.font = "italic 400 42px 'Playfair Display', Georgia, serif";
  const qLines = wrapLines(ctx, `"${quote}"`, W - 160).slice(0, 10);
  const startY = 560;
  qLines.forEach((line, i) => ctx.fillText(line, 80, startY + i * 58));
  // Footer
  ctx.fillStyle = "rgba(245,239,225,0.7)";
  ctx.font = "500 24px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("doxazoexpressions.com", 80, H - 80);
  return c;
}

const ShareVerseCard = ({ title, scripture, quote }: Props) => {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const material = (quote?.trim() || scripture || title).slice(0, 320);

  const generate = async () => {
    setBusy(true);
    try {
      const canvas = drawCard(title, scripture ?? null, material);
      const dataUrl = canvas.toDataURL("image/png");
      setPreview(dataUrl);
      track("devotional_share", { format: "image" });

      // Best-effort native/web share
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "doxazo-verse.png", { type: "image/png" });
        try {
          if (!isNative() && typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [file] })) {
            await (navigator as any).share({ files: [file], title, text: material });
            return;
          }
        } catch {}
        try {
          if (isNative()) {
            await shareNative({ title, text: material, url: window.location.href });
            return;
          }
        } catch {}
        toast({ title: "Card ready", description: "Long-press the image to save or share." });
      }, "image/png");
    } catch (e) {
      toast({ title: "Couldn't build card", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = "doxazo-verse.png";
    a.click();
  };

  return (
    <div className="w-full">
      <Button onClick={generate} disabled={busy} variant="outline" size="sm" className="gap-2 min-h-11">
        <Share2 className="w-4 h-4" />
        {busy ? "Building card…" : "Share as image"}
      </Button>
      {preview && (
        <div className="mt-4 space-y-2">
          <img
            src={preview}
            alt="Verse share card preview"
            className="rounded-lg border border-border max-w-xs w-full mx-auto"
          />
          <div className="flex justify-center">
            <Button onClick={download} size="sm" variant="ghost" className="gap-2">
              <ImageDown className="w-4 h-4" /> Download image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareVerseCard;
