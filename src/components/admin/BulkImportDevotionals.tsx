import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { parseCSV, slugifyWithDay, normalizeText, toIsoDate } from "@/lib/devotionalSlug";
import { resolveCategory } from "@/lib/categories";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Sparkles } from "lucide-react";

type Props = { userId: string; onImported: () => void };

type Status = "draft" | "scheduled" | "published";

type Normalized = {
  day: number | null;
  title: string;
  slug: string;
  series: string | null;
  category: string | null;
  body: string;
  scripture_reference: string | null;
  scripture_text: string | null;
  prayer_section: string | null;
  inspiration_caption: string | null;
  status: Status;
  publish_date: string;
  publish_at: string | null;
};

type Row = {
  index: number;
  raw: Record<string, string>;
  data: Normalized;
  errors: string[];
  warnings: string[];
  willOverwrite: "day" | "slug" | null;
};

/** Map a wide variety of incoming header names to our canonical field key. */
const HEADER_MAP: Record<string, keyof Normalized | "ignore"> = {
  // canonical
  day: "day",
  title: "title",
  slug: "slug",
  series: "series",
  category: "category",
  body: "body",
  teaching: "body",
  scripture_reference: "scripture_reference",
  "scripture reference": "scripture_reference",
  scripture_text: "scripture_text",
  "scripture text": "scripture_text",
  prayer: "prayer_section",
  prayer_section: "prayer_section",
  "prayer section": "prayer_section",
  inspiration_caption: "inspiration_caption",
  inspiring_caption: "inspiration_caption",
  "inspiring caption": "inspiration_caption",
  "inspiration caption": "inspiration_caption",
  caption: "inspiration_caption",
  status: "status",
  publish_date: "publish_date",
  "publish date": "publish_date",
  date: "publish_date",
  publish_at: "publish_at",
  "publish at": "publish_at",
  scheduled_for: "publish_at",
};

function canonicalKey(header: string): keyof Normalized | "ignore" | null {
  const k = header.trim().toLowerCase().replace(/\s+/g, " ");
  if (!k) return null;
  return HEADER_MAP[k] ?? HEADER_MAP[k.replace(/ /g, "_")] ?? null;
}

function remapRow(raw: Record<string, string>): Partial<Record<keyof Normalized, string>> {
  const out: Partial<Record<keyof Normalized, string>> = {};
  for (const [h, v] of Object.entries(raw)) {
    const key = canonicalKey(h);
    if (!key || key === "ignore") continue;
    if (out[key] == null || out[key] === "") out[key] = v;
  }
  return out;
}

function normalizeStatus(s?: string): Status {
  const v = (s ?? "").trim().toLowerCase();
  if (v === "published" || v === "publish" || v === "live") return "published";
  if (v === "scheduled" || v === "schedule") return "scheduled";
  return "draft";
}

function validate(raw: Record<string, string>, index: number): Row {
  const mapped = remapRow(raw);
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = normalizeText(mapped.title);
  const body = normalizeText(mapped.body);
  const dayRaw = (mapped.day ?? "").toString().trim();
  let day: number | null = null;
  if (dayRaw) {
    const n = Number(dayRaw.replace(/[^0-9-]/g, ""));
    if (!Number.isFinite(n) || !Number.isInteger(n)) errors.push(`day "${dayRaw}" is not a whole number`);
    else day = n;
  }
  if (!title) errors.push("missing title");
  if (!body) errors.push("missing teaching / body");

  const publish_date = toIsoDate(mapped.publish_date) ?? new Date().toISOString().slice(0, 10);
  if (mapped.publish_date && !toIsoDate(mapped.publish_date)) {
    warnings.push(`unrecognized publish_date "${mapped.publish_date}" — defaulted to today`);
  }
  const status = normalizeStatus(mapped.status);

  // category mapping
  let category: string | null = null;
  if (mapped.category && mapped.category.trim()) {
    category = resolveCategory(mapped.category);
    if (!category) warnings.push(`unknown category "${mapped.category}" — will import without category`);
  }

  // slug
  let slug = normalizeText(mapped.slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
  if (!slug) slug = slugifyWithDay(title, day);

  // publish_at
  let publish_at: string | null = null;
  if (mapped.publish_at && mapped.publish_at.trim()) {
    const t = Date.parse(mapped.publish_at);
    if (!Number.isNaN(t)) publish_at = new Date(t).toISOString();
    else warnings.push(`unrecognized publish_at "${mapped.publish_at}"`);
  }
  if (status === "published" && !publish_at) publish_at = new Date(publish_date).toISOString();

  const data: Normalized = {
    day,
    title,
    slug,
    series: normalizeText(mapped.series) || null,
    category,
    body,
    scripture_reference: normalizeText(mapped.scripture_reference) || null,
    scripture_text: normalizeText(mapped.scripture_text) || null,
    prayer_section: normalizeText(mapped.prayer_section) || null,
    inspiration_caption: normalizeText(mapped.inspiration_caption) || null,
    status,
    publish_date,
    publish_at,
  };

  return { index, raw, data, errors, warnings, willOverwrite: null };
}

export default function BulkImportDevotionals({ userId, onImported }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number; failed: number; errors: string[] } | null>(null);

  const onFile = async (file: File) => {
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    let parsed: Record<string, string>[] = [];
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const data = JSON.parse(text);
        const arr = Array.isArray(data) ? data : data.devotionals ?? [];
        parsed = arr.map((o: any) => {
          const r: Record<string, string> = {};
          for (const [k, v] of Object.entries(o)) r[k] = v == null ? "" : String(v);
          return r;
        });
      } else {
        parsed = parseCSV(text);
      }
    } catch (e: any) {
      toast({ title: "Could not parse file", description: e.message, variant: "destructive" });
      return;
    }
    let validated = parsed.map((r, i) => validate(r, i + 1));

    // duplicate detection inside the file
    const dayCount = new Map<number, number>();
    const slugCount = new Map<string, number>();
    validated.forEach((r) => {
      if (r.data.day != null) dayCount.set(r.data.day, (dayCount.get(r.data.day) ?? 0) + 1);
      if (r.data.slug) slugCount.set(r.data.slug, (slugCount.get(r.data.slug) ?? 0) + 1);
    });
    validated.forEach((r) => {
      if (r.data.day != null && (dayCount.get(r.data.day) ?? 0) > 1) r.errors.push(`duplicate day ${r.data.day} in this file`);
      if (r.data.slug && (slugCount.get(r.data.slug) ?? 0) > 1) r.warnings.push(`duplicate slug "${r.data.slug}" in this file`);
    });

    // server-side overlap check (which rows will update vs insert)
    const days = Array.from(new Set(validated.map((r) => r.data.day).filter((d): d is number => d != null)));
    const slugs = Array.from(new Set(validated.map((r) => r.data.slug).filter(Boolean)));
    const existing = { byDay: new Map<number, string>(), bySlug: new Map<string, string>() };
    if (days.length) {
      const { data } = await supabase.from("devotionals").select("id,day,slug").in("day", days);
      data?.forEach((d: any) => { if (d.day != null) existing.byDay.set(d.day, d.id); });
    }
    if (slugs.length) {
      const { data } = await supabase.from("devotionals").select("id,day,slug").in("slug", slugs);
      data?.forEach((d: any) => { if (d.slug) existing.bySlug.set(d.slug, d.id); });
    }
    validated = validated.map((r) => {
      if (r.data.day != null && existing.byDay.has(r.data.day)) r.willOverwrite = "day";
      else if (r.data.slug && existing.bySlug.has(r.data.slug)) r.willOverwrite = "slug";
      return r;
    });

    setRows(validated);
  };

  const summary = useMemo(() => {
    if (!rows) return null;
    return {
      total: rows.length,
      valid: rows.filter((r) => r.errors.length === 0).length,
      invalid: rows.filter((r) => r.errors.length > 0).length,
      inserts: rows.filter((r) => r.errors.length === 0 && !r.willOverwrite).length,
      updates: rows.filter((r) => r.errors.length === 0 && r.willOverwrite).length,
      warnings: rows.filter((r) => r.warnings.length > 0).length,
    };
  }, [rows]);

  const commit = async () => {
    if (!rows) return;
    const valid = rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) {
      toast({ title: "Nothing to import", description: "Fix the validation errors above.", variant: "destructive" });
      return;
    }
    setImporting(true);
    const errors: string[] = [];
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    // Split: rows with `day` upsert on day; rows without day upsert on slug.
    const withDay = valid.filter((r) => r.data.day != null);
    const withoutDay = valid.filter((r) => r.data.day == null);

    const buildPayload = (n: Normalized) => ({
      day: n.day,
      title: n.title,
      slug: n.slug || null,
      series: n.series,
      category: n.category,
      body: n.body,
      scripture_reference: n.scripture_reference,
      scripture_text: n.scripture_text,
      prayer_section: n.prayer_section,
      inspiration_caption: n.inspiration_caption,
      status: n.status,
      publish_date: n.publish_date,
      publish_at: n.publish_at,
      author_id: userId,
    });

    const runChunked = async (
      items: Row[],
      onConflict: "day" | "slug",
    ) => {
      const chunkSize = 50;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const payloads = chunk.map((r) => buildPayload(r.data));
        const { error, data } = await supabase
          .from("devotionals")
          .upsert(payloads as any, { onConflict, ignoreDuplicates: false })
          .select("id");
        if (error) {
          failed += chunk.length;
          errors.push(`Rows ${chunk[0].index}-${chunk[chunk.length - 1].index}: ${error.message}`);
        } else {
          // We can't perfectly tell insert vs update from the response — use willOverwrite hint.
          chunk.forEach((r) => (r.willOverwrite ? updated++ : inserted++));
          void data;
        }
      }
    };

    await runChunked(withDay, "day");
    await runChunked(withoutDay, "slug");

    setResult({ inserted, updated, failed, errors });
    setImporting(false);
    toast({ title: `Imported ${inserted + updated} devotional${inserted + updated === 1 ? "" : "s"}`, description: `${inserted} new · ${updated} updated${failed ? ` · ${failed} failed` : ""}` });
    onImported();
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-serif font-semibold text-xl flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5" /> Import Devotionals
            <Badge variant="outline" className="gap-1 ml-1"><Sparkles className="w-3 h-3" />Notion-friendly</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload a CSV exported from Notion (or a JSON file). Columns are matched by{" "}
            <strong>header name</strong> in any order. Recognized headers:{" "}
            <code>Day, Title, Series, Teaching, Scripture Reference, Scripture Text, Prayer, Inspiring Caption, Category, Status, Publish Date, Slug</code>.
            Unknown columns are ignored. Rows are <strong>upserted by <code>day</code></strong> (or by <code>slug</code> if no day) so re-importing a corrected export updates existing entries.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Label htmlFor="bulk-file" className="sr-only">Choose file</Label>
          <Input
            id="bulk-file"
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="max-w-sm"
          />
          {fileName && (
            <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" />{fileName}</Badge>
          )}
        </div>

        {rows && summary && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{summary.total} rows</Badge>
              <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />{summary.valid} valid</Badge>
              {summary.invalid > 0 && (
                <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />{summary.invalid} with errors</Badge>
              )}
              <Badge variant="secondary">{summary.inserts} new</Badge>
              <Badge variant="secondary">{summary.updates} will update</Badge>
              {summary.warnings > 0 && (
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/40"><AlertTriangle className="w-3 h-3" />{summary.warnings} warnings</Badge>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
              {rows.slice(0, 300).map((r) => (
                <div key={r.index} className="p-2 text-xs flex items-start gap-2">
                  <span className="text-muted-foreground tabular-nums w-8">#{r.index}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {r.data.day != null && <span className="text-accent mr-1">Day {r.data.day} ·</span>}
                      {r.data.title || <em className="text-muted-foreground">(no title)</em>}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {r.data.publish_date} · {r.data.status}
                      {r.data.slug && ` · /${r.data.slug}`}
                      {r.data.category && ` · ${r.data.category}`}
                      {r.willOverwrite && <span className="ml-1 text-accent">· will update existing (matched by {r.willOverwrite})</span>}
                    </p>
                    {r.errors.length > 0 && (
                      <p className="text-destructive mt-0.5">{r.errors.join(", ")}</p>
                    )}
                    {r.warnings.length > 0 && (
                      <p className="text-amber-600 mt-0.5">{r.warnings.join(", ")}</p>
                    )}
                  </div>
                </div>
              ))}
              {rows.length > 300 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  …{rows.length - 300} more rows hidden
                </div>
              )}
            </div>

            <Button onClick={commit} disabled={importing || summary.valid === 0}>
              {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Import {summary.valid} valid row{summary.valid === 1 ? "" : "s"}
              {summary.updates > 0 && ` (${summary.inserts} new · ${summary.updates} update)`}
            </Button>
          </div>
        )}

        {result && (
          <div className="text-sm border rounded-lg p-3 bg-muted/30 space-y-1">
            <p>
              <strong>{result.inserted}</strong> new ·{" "}
              <strong>{result.updated}</strong> updated ·{" "}
              <strong>{result.failed}</strong> failed
            </p>
            {result.errors.map((e, i) => <p key={i} className="text-destructive text-xs">{e}</p>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
