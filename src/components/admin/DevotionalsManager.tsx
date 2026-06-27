import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import DevotionalEditor from "./DevotionalEditor";
import BulkImportDevotionals from "./BulkImportDevotionals";
import { Plus, Pencil, Calendar, Globe, FileText, Search, Loader2, Upload } from "lucide-react";

type Status = "all" | "draft" | "scheduled" | "published";

export default function DevotionalsManager({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [tab, setTab] = useState<Status>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("devotionals")
      .select("*")
      .order("publish_date", { ascending: false })
      .limit(500);
    setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    all: list.length,
    draft: list.filter((d) => d.status === "draft").length,
    scheduled: list.filter((d) => d.status === "scheduled").length,
    published: list.filter((d) => d.status === "published").length,
  }), [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((d) => {
      if (tab !== "all" && d.status !== tab) return false;
      if (category !== "all" && d.category !== category) return false;
      if (q && !(`${d.title} ${d.scripture_reference ?? ""} ${d.slug ?? ""}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [list, tab, category, search]);

  const startCreate = () => { setEditing(null); setCreating(true); setShowImport(false); };
  const startEdit = (d: any) => { setEditing(d); setCreating(false); setShowImport(false); };
  const closeEditor = () => { setEditing(null); setCreating(false); };

  return (
    <div className="space-y-6">
      {/* Header + primary actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif font-semibold text-2xl">Devotional Library</h2>
          <p className="text-sm text-muted-foreground">Create, schedule and publish devotionals — manage a full year of content.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={startCreate} size="lg" className="gap-2 shadow">
            <Plus className="w-5 h-5" /> Create New Devotional
          </Button>
          <Button onClick={() => { setShowImport((s) => !s); setEditing(null); setCreating(false); }} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Import from Notion / CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { key: "all", label: "Total", icon: FileText, value: counts.all, color: "text-foreground" },
          { key: "draft", label: "Drafts", icon: Pencil, value: counts.draft, color: "text-muted-foreground" },
          { key: "scheduled", label: "Scheduled", icon: Calendar, value: counts.scheduled, color: "text-accent" },
          { key: "published", label: "Published", icon: Globe, value: counts.published, color: "text-primary" },
        ] as const).map((c) => (
          <button
            key={c.key}
            onClick={() => setTab(c.key as Status)}
            className={`text-left rounded-lg border p-4 transition ${tab === c.key ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="text-2xl font-serif font-bold">{c.value}</div>
          </button>
        ))}
      </div>

      {/* Editor / Bulk import / List */}
      {(creating || editing) && (
        <DevotionalEditor
          userId={userId}
          initial={editing}
          onSaved={() => { closeEditor(); load(); }}
          onCancel={closeEditor}
          onDeleted={() => { closeEditor(); load(); }}
        />
      )}

      {showImport && (
        <BulkImportDevotionals userId={userId} onImported={load} />
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
            <TabsList className="grid grid-cols-4 max-w-md">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({counts.draft})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({counts.scheduled})</TabsTrigger>
              <TabsTrigger value="published">Published ({counts.published})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search title, scripture, slug…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No devotionals match these filters.</div>
          ) : (
            <div className="border rounded-lg divide-y">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => startEdit(d)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/40 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {d.day != null && (
                        <Badge variant="outline" className="text-[10px] font-mono">Day {d.day}</Badge>
                      )}
                      <p className="font-medium truncate">{d.title}</p>
                      <Badge
                        variant={d.status === "published" ? "default" : d.status === "scheduled" ? "outline" : "secondary"}
                        className="uppercase text-[10px]"
                      >
                        {d.status}
                      </Badge>
                      {d.category && <Badge variant="outline" className="text-[10px]">{categoryLabel(d.category)}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.publish_date}
                      {d.publish_at && <> · live {new Date(d.publish_at).toLocaleString()}</>}
                      {d.slug && <> · /{d.slug}</>}
                    </p>
                  </div>
                  <Pencil className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
