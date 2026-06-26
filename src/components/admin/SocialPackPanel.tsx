import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Copy, ClipboardList, Save } from "lucide-react";

type Devotional = { id: string; title: string; publish_date: string };

type Pack = {
  id?: string;
  devotional_id: string;
  instagram_caption?: string | null;
  facebook_caption?: string | null;
  x_post?: string | null;
  tiktok_script?: string | null;
  reel_hook?: string | null;
  quote_graphic?: string | null;
  story_cta?: string | null;
  notification_cta?: string | null;
  hashtags_instagram?: string | null;
  hashtags_facebook?: string | null;
  hashtags_x?: string | null;
  hashtags_tiktok?: string | null;
  canva_headline?: string | null;
  canva_excerpt?: string | null;
  canva_scripture?: string | null;
  canva_cta?: string | null;
  scheduled?: boolean;
  posted_instagram?: boolean;
  posted_facebook?: boolean;
  posted_tiktok?: boolean;
  posted_x?: boolean;
  date_posted?: string | null;
};

const FIELDS: Array<{ key: keyof Pack; label: string; multiline?: boolean; rows?: number }> = [
  { key: "reel_hook", label: "Reel Hook" },
  { key: "instagram_caption", label: "Instagram Caption", multiline: true, rows: 6 },
  { key: "facebook_caption", label: "Facebook Caption", multiline: true, rows: 6 },
  { key: "x_post", label: "X Post", multiline: true, rows: 3 },
  { key: "tiktok_script", label: "TikTok Script", multiline: true, rows: 6 },
  { key: "quote_graphic", label: "Quote Graphic Text", multiline: true, rows: 2 },
  { key: "story_cta", label: "Story CTA" },
  { key: "notification_cta", label: "Notification CTA" },
  { key: "hashtags_instagram", label: "Hashtags — Instagram" },
  { key: "hashtags_facebook", label: "Hashtags — Facebook" },
  { key: "hashtags_x", label: "Hashtags — X" },
  { key: "hashtags_tiktok", label: "Hashtags — TikTok" },
];

const CANVA_FIELDS: Array<{ key: keyof Pack; label: string }> = [
  { key: "canva_headline", label: "Headline" },
  { key: "canva_excerpt", label: "Excerpt" },
  { key: "canva_scripture", label: "Scripture Reference" },
  { key: "canva_cta", label: "CTA Footer" },
];

const copy = (txt: string) => {
  navigator.clipboard.writeText(txt);
  toast({ title: "Copied" });
};

const SocialPackPanel = () => {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [packs, setPacks] = useState<Record<string, Pack>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pack, setPack] = useState<Pack | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: devs } = await supabase
        .from("devotionals")
        .select("id,title,publish_date")
        .order("publish_date", { ascending: false })
        .limit(60);
      setDevotionals((devs ?? []) as Devotional[]);
      const { data: existing } = await supabase.from("social_packs").select("*");
      const byDev: Record<string, Pack> = {};
      for (const p of (existing ?? []) as Pack[]) byDev[p.devotional_id] = p;
      setPacks(byDev);
      if (devs && devs.length) setSelectedId(devs[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return setPack(null);
    setPack(packs[selectedId] ?? { devotional_id: selectedId });
  }, [selectedId, packs]);

  const selectedDev = useMemo(
    () => devotionals.find((d) => d.id === selectedId) ?? null,
    [devotionals, selectedId],
  );

  const generate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-pack", {
        body: { devotional_id: selectedId },
      });
      if (error) throw error;
      const saved = (data as { pack?: Pack })?.pack;
      if (saved) {
        setPacks((p) => ({ ...p, [selectedId]: saved }));
        setPack(saved);
        toast({ title: "Social pack generated" });
      }
    } catch (e) {
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!pack || !selectedId) return;
    setSaving(true);
    const { error, data } = await supabase
      .from("social_packs")
      .upsert(pack, { onConflict: "devotional_id" })
      .select()
      .maybeSingle();
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    if (data) {
      setPacks((p) => ({ ...p, [selectedId]: data as Pack }));
      setPack(data as Pack);
    }
    toast({ title: "Saved" });
  };

  const copyAll = () => {
    if (!pack || !selectedDev) return;
    const parts = [
      `=== ${selectedDev.title} (${selectedDev.publish_date}) ===`,
      ...FIELDS.map((f) => `\n— ${f.label} —\n${(pack[f.key] as string) ?? ""}`),
      `\n— Canva —`,
      ...CANVA_FIELDS.map((f) => `${f.label}: ${(pack[f.key] as string) ?? ""}`),
    ];
    copy(parts.join("\n"));
  };

  const setField = (k: keyof Pack, v: unknown) =>
    setPack((p) => (p ? { ...p, [k]: v as never } : p));

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-serif font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Devotionals
          </h3>
          {devotionals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Publish a devotional first…</p>
          ) : (
            <div className="space-y-1 max-h-[640px] overflow-y-auto -mx-2">
              {devotionals.map((d) => {
                const has = !!packs[d.id];
                const active = d.id === selectedId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      active ? "bg-accent/10 text-foreground" : "hover:bg-muted/60 text-foreground/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{d.title}</span>
                      {has && <Badge variant="outline" className="text-[10px]">pack</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{d.publish_date}</div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 sm:p-6 space-y-5">
          {!selectedDev ? (
            <p className="text-muted-foreground text-sm">Select a devotional to view or generate its social pack.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-serif text-xl font-semibold">{selectedDev.title}</h2>
                  <p className="text-xs text-muted-foreground">{selectedDev.publish_date}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={generate} disabled={generating} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    {generating ? "Generating…" : pack?.id ? "Regenerate" : "Generate Social Pack"}
                  </Button>
                  {pack?.id && (
                    <Button variant="outline" onClick={copyAll} className="gap-2">
                      <ClipboardList className="w-4 h-4" /> Copy All
                    </Button>
                  )}
                </div>
              </div>

              {pack && (
                <>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Posting Status</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={!!pack.scheduled}
                          onCheckedChange={(v) => setField("scheduled", !!v)}
                        />
                        Scheduled
                      </label>
                      {(["instagram", "facebook", "tiktok", "x"] as const).map((p) => {
                        const k = `posted_${p}` as keyof Pack;
                        return (
                          <label key={p} className="flex items-center gap-2 capitalize">
                            <Checkbox
                              checked={!!pack[k]}
                              onCheckedChange={(v) => setField(k, !!v)}
                            />
                            {p}
                          </label>
                        );
                      })}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="date_posted" className="text-xs">Date</Label>
                        <Input
                          id="date_posted"
                          type="date"
                          className="h-8 w-auto"
                          value={pack.date_posted ?? ""}
                          onChange={(e) => setField("date_posted", e.target.value || null)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {FIELDS.map((f) => (
                      <div key={String(f.key)} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{f.label}</Label>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => copy(String(pack[f.key] ?? ""))}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        {f.multiline ? (
                          <Textarea
                            rows={f.rows ?? 3}
                            value={(pack[f.key] as string) ?? ""}
                            onChange={(e) => setField(f.key, e.target.value)}
                          />
                        ) : (
                          <Input
                            value={(pack[f.key] as string) ?? ""}
                            onChange={(e) => setField(f.key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-accent mb-3">Canva-Ready Export</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {CANVA_FIELDS.map((f) => (
                        <div key={String(f.key)} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">{f.label}</Label>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => copy(String(pack[f.key] ?? ""))}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <Input
                            value={(pack[f.key] as string) ?? ""}
                            onChange={(e) => setField(f.key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={save} disabled={saving} className="gap-2">
                      <Save className="w-4 h-4" />
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPackPanel;
