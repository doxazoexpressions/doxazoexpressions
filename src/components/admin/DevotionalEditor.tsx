import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { slugify, slugifyWithDay } from "@/lib/devotionalSlug";
import { Loader2, Save, Calendar, Globe, Trash2, X, Eye, Upload, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { uploadDevotionalAudio, readAudioDurationSeconds, resolveAudioUrl, VoiceKind } from "@/lib/devotionalAudio";

export type DevotionalRow = any;

type Props = {
  userId: string;
  initial?: DevotionalRow | null;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted?: () => void;
};

const emptyForm = () => ({
  title: "",
  slug: "",
  day: "",
  category: "none",
  series: "",
  publish_date: new Date().toISOString().slice(0, 10),
  publish_at: "",
  status: "draft" as "draft" | "scheduled" | "published",
  scripture_reference: "",
  scripture_text: "",
  excerpt: "",
  body: "",
  prayer_section: "",
  decree_and_declare: "",
  inspiration_caption: "",
  audio_url: "",
  audio_male_url: "",
  audio_female_url: "",
  audio_default_voice: "female" as VoiceKind,
  seo_title: "",
  seo_description: "",
});

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const tz = d.getTimezoneOffset();
  return new Date(d.getTime() - tz * 60000).toISOString().slice(0, 16);
}

export default function DevotionalEditor({ userId, initial, onSaved, onCancel, onDeleted }: Props) {
  const editing = !!initial?.id;
  const [form, setForm] = useState(() => {
    if (!initial) return emptyForm();
    return {
      title: initial.title ?? "",
      slug: initial.slug ?? "",
      day: initial.day != null ? String(initial.day) : "",
      category: initial.category ?? "none",
      series: initial.series ?? "",
      publish_date: initial.publish_date ?? new Date().toISOString().slice(0, 10),
      publish_at: toLocalInput(initial.publish_at),
      status: (initial.status ?? "draft") as "draft" | "scheduled" | "published",
      scripture_reference: initial.scripture_reference ?? "",
      scripture_text: initial.scripture_text ?? "",
      excerpt: initial.excerpt ?? "",
      body: initial.body ?? "",
      prayer_section: initial.prayer_section ?? "",
      decree_and_declare: initial.decree_and_declare ?? initial.declaration ?? "",
      inspiration_caption: initial.inspiration_caption ?? "",
      audio_url: initial.audio_url ?? "",
      audio_male_url: initial.audio_male_url ?? "",
      audio_female_url: initial.audio_female_url ?? "",
      audio_default_voice: (initial.audio_default_voice as VoiceKind) ?? "female",
      seo_title: initial.seo_title ?? "",
      seo_description: initial.seo_description ?? "",
    };
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(editing);

  const update = (patch: Partial<ReturnType<typeof emptyForm>>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  // Auto-slug from title (+ day) until user edits slug
  useEffect(() => {
    if (!slugTouched) {
      const dayNum = form.day ? Number(form.day) : null;
      setForm((f) => ({ ...f, slug: slugifyWithDay(f.title, dayNum) }));
    }
  }, [form.title, form.day, slugTouched]);

  // Warn on unload
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!form.title.trim()) e.push("Title is required.");
    if (!form.body.trim()) e.push("Body is required.");
    if (!form.publish_date) e.push("Publish date is required.");
    if (form.status === "scheduled" && !form.publish_at) e.push("Scheduled status requires a Publish-at date/time.");
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) e.push("Slug may only contain lowercase letters, numbers and hyphens.");
    if (form.day && !/^\d+$/.test(form.day.trim())) e.push("Day must be a whole number (e.g. 201).");
    return e;
  }, [form]);

  const buildPayload = (status: "draft" | "scheduled" | "published") => {
    const dayNum = form.day && /^\d+$/.test(form.day.trim()) ? Number(form.day) : null;
    const slug = (form.slug || slugifyWithDay(form.title, dayNum)).slice(0, 80) || null;
    let publish_at: string | null = form.publish_at ? new Date(form.publish_at).toISOString() : null;
    if (status === "published" && !publish_at) publish_at = new Date().toISOString();
    return {
      title: form.title.trim(),
      slug,
      day: dayNum,
      category: form.category && form.category !== "none" ? form.category : null,
      series: form.series.trim() || null,
      publish_date: form.publish_date,
      publish_at,
      status,
      scripture_reference: form.scripture_reference.trim() || null,
      scripture_text: form.scripture_text.trim() || null,
      excerpt: form.excerpt.trim() || null,
      body: form.body,
      prayer_section: form.prayer_section.trim() || null,
      decree_and_declare: form.decree_and_declare.trim() || null,
      declaration: form.decree_and_declare.trim() || null, // mirror legacy column
      inspiration_caption: form.inspiration_caption.trim() || null,
      audio_url: form.audio_url.trim() || null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      author_id: userId,
    };
  };

  const save = async (target: "draft" | "scheduled" | "published") => {
    if (errors.length && !(target === "draft" && errors.every((e) => e.includes("Scheduled")))) {
      toast({ title: "Please fix the form", description: errors.join(" "), variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = buildPayload(target);
    try {
      // Duplicate-slug warning (insert only)
      if (!editing && payload.slug) {
        const { data: existing } = await supabase
          .from("devotionals")
          .select("id")
          .eq("slug", payload.slug)
          .maybeSingle();
        if (existing) {
          toast({ title: "Slug already exists", description: "Pick a different slug.", variant: "destructive" });
          setSaving(false);
          return;
        }
      }
      const { error } = editing
        ? await supabase.from("devotionals").update(payload).eq("id", initial!.id)
        : await supabase.from("devotionals").insert(payload);
      if (error) throw error;
      toast({
        title: target === "draft" ? "Draft saved" : target === "scheduled" ? "Scheduled" : "Published",
      });
      setDirty(false);
      onSaved();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message ?? String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing) return;
    if (!confirm("Delete this devotional? This cannot be undone.")) return;
    const { error } = await supabase.from("devotionals").delete().eq("id", initial!.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    onDeleted?.();
  };

  return (
    <Card className="border-accent/40">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-semibold text-2xl">
              {editing ? "Edit Devotional" : "New Devotional"}
            </h2>
            <Badge variant="outline" className="uppercase text-[10px]">{form.status}</Badge>
            {dirty && <Badge variant="secondary" className="text-[10px]">Unsaved</Badge>}
          </div>
          <div className="flex gap-2">
            {editing && initial?.slug && (
              <Button asChild size="sm" variant="ghost">
                <Link to={`/devotional/${initial.id}`} target="_blank" rel="noreferrer">
                  <Eye className="w-4 h-4 mr-1" /> Preview
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onCancel}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => update({ title: e.target.value })} required />
          </div>
          <div>
            <Label>Day (series number)</Label>
            <Input
              type="number"
              value={form.day}
              onChange={(e) => update({ day: e.target.value })}
              placeholder="e.g. 201"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); update({ slug: e.target.value }); }}
              placeholder="auto-from-title-and-day"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => update({ category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Series</Label>
            <Input value={form.series} onChange={(e) => update({ series: e.target.value })} placeholder="e.g. Know This and Know Peace" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: any) => update({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Publish Date *</Label>
            <Input type="date" value={form.publish_date} onChange={(e) => update({ publish_date: e.target.value })} />
          </div>
          <div>
            <Label>Publish At {form.status === "scheduled" && "*"}</Label>
            <Input
              type="datetime-local"
              value={form.publish_at}
              onChange={(e) => update({ publish_at: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Scripture Reference</Label>
            <Input value={form.scripture_reference} onChange={(e) => update({ scripture_reference: e.target.value })} placeholder="e.g. Psalm 23:1" />
          </div>
          <div className="md:col-span-2">
            <Label>Scripture Text</Label>
            <Textarea rows={2} value={form.scripture_text} onChange={(e) => update({ scripture_text: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Excerpt (preview)</Label>
            <Textarea rows={2} value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} placeholder="Auto-generated from body if blank" />
          </div>
          <div className="md:col-span-2">
            <Label>Body *</Label>
            <Textarea rows={10} value={form.body} onChange={(e) => update({ body: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <Label>Prayer Section</Label>
            <Textarea rows={3} value={form.prayer_section} onChange={(e) => update({ prayer_section: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Decree &amp; Declare</Label>
            <Textarea rows={3} value={form.decree_and_declare} onChange={(e) => update({ decree_and_declare: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Inspiration Caption</Label>
            <Input value={form.inspiration_caption} onChange={(e) => update({ inspiration_caption: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Audio URL</Label>
            <Input value={form.audio_url} onChange={(e) => update({ audio_url: e.target.value })} placeholder="https://…mp3" />
          </div>
          <div>
            <Label>SEO Title</Label>
            <Input value={form.seo_title} onChange={(e) => update({ seo_title: e.target.value })} />
          </div>
          <div>
            <Label>SEO Description</Label>
            <Input value={form.seo_description} onChange={(e) => update({ seo_description: e.target.value })} />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded p-3">
            <ul className="list-disc pl-5 space-y-1">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
          <div className="flex gap-2">
            <Button onClick={() => save("draft")} variant="secondary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save Draft
            </Button>
            <Button onClick={() => save("scheduled")} variant="outline" disabled={saving || !form.publish_at}>
              <Calendar className="w-4 h-4 mr-1" /> Schedule
            </Button>
            <Button onClick={() => save("published")} disabled={saving}>
              <Globe className="w-4 h-4 mr-1" /> {editing && form.status === "published" ? "Update Live" : "Publish Now"}
            </Button>
          </div>
          {editing && (
            <Button onClick={remove} variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
