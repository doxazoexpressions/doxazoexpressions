import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { parseCSV, slugify } from "@/lib/devotionalSlug";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

type Props = { userId: string; onImported: () => void };

type Parsed = {
  ok: boolean;
  errors: string[];
  row: any;
};

const ALLOWED = new Set([
  "title", "slug", "category", "series", "publish_date", "publish_at",
  "status", "scripture_reference", "scripture_text", "excerpt", "body",
  "prayer_section", "decree_and_declare", "inspiration_caption",
  "audio_url", "seo_title", "seo_description",
]);

function validate(row: any): Parsed {
  const errors: string[] = [];
  const r: any = {};
  for (const k of Object.keys(row)) {
    if (ALLOWED.has(k)) r[k] = typeof row[k] === "string" ? row[k] : row[k];
  }
  if (!r.title || !String(r.title).trim()) errors.push("missing title");
  if (!r.body || !String(r.body).trim()) errors.push("missing body");
  if (!r.publish_date) errors.push("missing publish_date");
  else if (!/^\d{4}-\d{2}-\d{2}/.test(String(r.publish_date))) errors.push("publish_date must be YYYY-MM-DD");
  if (r.status && !["draft", "scheduled", "published"].includes(String(r.status))) {
    errors.push(`invalid status "${r.status}"`);
  }
  if (r.publish_at && isNaN(Date.parse(String(r.publish_at)))) errors.push("invalid publish_at");
  return { ok: errors.length === 0, errors, row: r };
}

function normalize(r: any, userId: string) {
  const status = (r.status ?? "draft") as "draft" | "scheduled" | "published";
  const slug = (r.slug && String(r.slug).trim()) || slugify(String(r.title));
  let publish_at: string | null = r.publish_at ? new Date(r.publish_at).toISOString() : null;
  if (status === "published" && !publish_at) publish_at = new Date(r.publish_date).toISOString();
  return {
    title: String(r.title).trim(),
    slug,
    category: r.category && r.category !== "none" ? r.category : null,
    series: r.series || null,
    publish_date: String(r.publish_date).slice(0, 10),
    publish_at,
    status,
    scripture_reference: r.scripture_reference || null,
    scripture_text: r.scripture_text || null,
    excerpt: r.excerpt || null,
    body: String(r.body),
    prayer_section: r.prayer_section || null,
    decree_and_declare: r.decree_and_declare || null,
    declaration: r.decree_and_declare || null,
    inspiration_caption: r.inspiration_caption || null,
    audio_url: r.audio_url || null,
    seo_title: r.seo_title || null,
    seo_description: r.seo_description || null,
    author_id: userId,
  };
}

export default function BulkImportDevotionals({ userId, onImported }: Props) {
  const [parsed, setParsed] = useState<Parsed[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);

  const onFile = async (file: File) => {
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    let rows: any[] = [];
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const data = JSON.parse(text);
        rows = Array.isArray(data) ? data : data.devotionals ?? [];
      } else {
        rows = parseCSV(text);
      }
    } catch (e: any) {
      toast({ title: "Could not parse file", description: e.message, variant: "destructive" });
      return;
    }
    setParsed(rows.map(validate));
  };

  const commit = async () => {
    if (!parsed) return;
    const valid = parsed.filter((p) => p.ok).map((p) => normalize(p.row, userId));
    if (valid.length === 0) {
      toast({ title: "Nothing to import", description: "All rows have validation errors.", variant: "destructive" });
      return;
    }
    setImporting(true);
    const errors: string[] = [];
    let inserted = 0;
    let skipped = 0;
    // Chunk inserts to avoid huge payloads; upsert by slug
    const chunkSize = 50;
    for (let i = 0; i < valid.length; i += chunkSize) {
      const chunk = valid.slice(i, i + chunkSize);
      const { error, data } = await supabase
        .from("devotionals")
        .upsert(chunk, { onConflict: "slug", ignoreDuplicates: false })
        .select("id");
      if (error) {
        errors.push(`Rows ${i + 1}-${i + chunk.length}: ${error.message}`);
        skipped += chunk.length;
      } else {
        inserted += data?.length ?? chunk.length;
      }
    }
    setResult({ inserted, skipped, errors });
    setImporting(false);
    toast({ title: `Imported ${inserted} devotional${inserted === 1 ? "" : "s"}` });
    onImported();
  };

  const valid = parsed?.filter((p) => p.ok).length ?? 0;
  const invalid = parsed?.filter((p) => !p.ok).length ?? 0;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-serif font-semibold text-xl flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5" /> Bulk Import
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload a CSV or JSON file with columns: <code>title</code>, <code>body</code>, <code>publish_date</code> (required) and optional{" "}
            <code>slug, category, series, publish_at, status, scripture_reference, scripture_text, excerpt, prayer_section, decree_and_declare, inspiration_caption, audio_url, seo_title, seo_description</code>.
            Duplicate slugs will overwrite the existing row.
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

        {parsed && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />{valid} valid</Badge>
              {invalid > 0 && (
                <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />{invalid} with errors</Badge>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
              {parsed.slice(0, 200).map((p, i) => (
                <div key={i} className="p-2 text-xs flex items-start gap-2">
                  <span className="text-muted-foreground tabular-nums w-8">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.row.title || <em className="text-muted-foreground">(no title)</em>}</p>
                    <p className="text-muted-foreground truncate">
                      {p.row.publish_date} · {p.row.status ?? "draft"} {p.row.slug ? `· ${p.row.slug}` : ""}
                    </p>
                    {!p.ok && (
                      <p className="text-destructive mt-0.5">{p.errors.join(", ")}</p>
                    )}
                  </div>
                </div>
              ))}
              {parsed.length > 200 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  …{parsed.length - 200} more rows hidden
                </div>
              )}
            </div>

            <Button onClick={commit} disabled={importing || valid === 0}>
              {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Import {valid} valid row{valid === 1 ? "" : "s"}
            </Button>
          </div>
        )}

        {result && (
          <div className="text-sm border rounded-lg p-3 bg-muted/30 space-y-1">
            <p><strong>{result.inserted}</strong> imported · <strong>{result.skipped}</strong> failed</p>
            {result.errors.map((e, i) => <p key={i} className="text-destructive text-xs">{e}</p>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
