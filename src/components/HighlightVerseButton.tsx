import { useEffect, useState } from "react";
import { Highlighter, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  HIGHLIGHT_COLORS,
  HighlightColor,
  VerseHighlight,
  createHighlight,
  deleteHighlight,
  listHighlights,
} from "@/lib/highlights";

type Props = {
  devotionalId: string;
  devotionalTitle: string;
  reference: string | null;
  verseText: string;
};

const HighlightVerseButton = ({ devotionalId, devotionalTitle, reference, verseText }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<HighlightColor>("gold");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<VerseHighlight | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setExisting(null); return; }
    (async () => {
      try {
        const rows = await listHighlights(devotionalId);
        const match = rows.find((r) => r.verse_text === verseText) ?? null;
        if (!cancelled) setExisting(match);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, devotionalId, verseText]);

  const onSave = async () => {
    setSaving(true);
    try {
      const created = await createHighlight({
        verse_text: verseText,
        reference,
        color,
        note: note.trim() || null,
        devotional_id: devotionalId,
        devotional_title: devotionalTitle,
      });
      setExisting(created);
      setOpen(false);
      setNote("");
      toast({ title: "Verse highlighted", description: "Saved to your highlights library." });
    } catch (e) {
      toast({ title: "Could not save highlight", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onRemove = async () => {
    if (!existing) return;
    try {
      await deleteHighlight(existing.id);
      setExisting(null);
      setOpen(false);
      toast({ title: "Highlight removed" });
    } catch { toast({ title: "Delete failed", variant: "destructive" }); }
  };

  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant={existing ? "default" : "outline"}
          className="gap-1.5 mt-3"
          aria-label={existing ? "Edit highlight" : "Highlight this verse"}
        >
          {existing ? <Check className="w-4 h-4" /> : <Highlighter className="w-4 h-4" />}
          {existing ? "Highlighted" : "Highlight verse"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Color</p>
        <div className="flex items-center gap-2 mb-4">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColor(c.key)}
              className={`w-7 h-7 rounded-full border-2 transition ${color === c.key ? "border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: c.swatch }}
              aria-label={c.label}
            />
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Note (optional)</p>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why does this verse stand out to you?"
          className="min-h-[80px] mb-3"
          maxLength={1000}
        />
        <div className="flex items-center justify-between gap-2">
          {existing ? (
            <Button size="sm" variant="ghost" className="text-destructive gap-1.5" onClick={onRemove}>
              <Trash2 className="w-4 h-4" /> Remove
            </Button>
          ) : <span />}
          <Button size="sm" onClick={onSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save highlight
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HighlightVerseButton;
