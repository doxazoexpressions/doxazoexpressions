import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, Undo2, Trash2, Archive as ArchiveIcon, Heart, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  listPrayers,
  createPrayer,
  markAnswered,
  reopenPrayer,
  deletePrayer,
  archivePrayer,
  readCache,
  type PrayerRequest,
} from "@/lib/prayerRequests";

const CATEGORIES = ["Family", "Healing", "Guidance", "Provision", "Salvation", "Nation", "Other"];

const Prayers = () => {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<PrayerRequest[]>(() => readCache());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "answered">("active");

  // form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const data = await listPrayers({ includeAnswered: true, includeArchived: false });
        setRows(data);
      } catch (e: any) {
        toast.error(e?.message ?? "Couldn't load prayers");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const active = useMemo(() => rows.filter((r) => !r.is_answered), [rows]);
  const answered = useMemo(() => rows.filter((r) => r.is_answered), [rows]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const created = await createPrayer({
        title: title.trim(),
        body: body.trim() || null,
        category: category || null,
      });
      setRows((prev) => [created, ...prev]);
      setTitle(""); setBody(""); setCategory("");
      toast.success("Prayer added");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't save prayer");
    } finally {
      setSubmitting(false);
    }
  };

  const onAnswered = async (r: PrayerRequest) => {
    try {
      const note = window.prompt("How was this prayer answered? (optional)") ?? undefined;
      const updated = await markAnswered(r.id, note?.trim() || undefined);
      setRows((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
      toast.success("Marked as answered ✨");
    } catch (e: any) { toast.error(e?.message ?? "Update failed"); }
  };
  const onReopen = async (r: PrayerRequest) => {
    try {
      const updated = await reopenPrayer(r.id);
      setRows((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
    } catch (e: any) { toast.error(e?.message ?? "Update failed"); }
  };
  const onArchive = async (r: PrayerRequest) => {
    try {
      await archivePrayer(r.id, true);
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      toast("Archived");
    } catch (e: any) { toast.error(e?.message ?? "Archive failed"); }
  };
  const onDelete = async (r: PrayerRequest) => {
    if (!window.confirm("Delete this prayer permanently?")) return;
    try {
      await deletePrayer(r.id);
      setRows((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e: any) { toast.error(e?.message ?? "Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Prayer List — Doxazo Expressions" description="Keep a private prayer list, mark answered prayers, and remember what God has done." canonical="/prayers" />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">Your private prayer list</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">Prayers</h1>
          <p className="text-muted-foreground">Write what's on your heart. Mark answers when they come. Remember.</p>
        </div>

        {!user && !authLoading ? (
          <Card className="p-6 text-center">
            <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
            <h2 className="font-serif text-xl font-bold mb-1">Sign in to save prayers</h2>
            <p className="text-muted-foreground text-sm mb-4">Your list is private and syncs across your devices.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </Card>
        ) : (
          <>
            <Card className="p-4 sm:p-5 mb-8">
              <form onSubmit={submit} className="space-y-3">
                <Input
                  placeholder="What are you praying for?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                />
                <Textarea
                  placeholder="Details, scripture, or how God is leading you… (optional)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(category === c ? "" : c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        category === c ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting || !title.trim()} className="gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add prayer
                  </Button>
                </div>
              </form>
            </Card>

            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                <TabsTrigger value="answered">Answered ({answered.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4 space-y-3">
                {loading && rows.length === 0 && <p className="text-sm text-muted-foreground">Loading…</p>}
                {!loading && active.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Your active prayers appear here.</p>
                )}
                {active.map((r) => (
                  <PrayerCard key={r.id} r={r} onAnswered={onAnswered} onArchive={onArchive} onDelete={onDelete} />
                ))}
              </TabsContent>

              <TabsContent value="answered" className="mt-4 space-y-3">
                {answered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Answered prayers will be remembered here.</p>
                )}
                {answered.map((r) => (
                  <PrayerCard key={r.id} r={r} onReopen={onReopen} onDelete={onDelete} onArchive={onArchive} answered />
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const PrayerCard = ({
  r, answered, onAnswered, onReopen, onArchive, onDelete,
}: {
  r: PrayerRequest;
  answered?: boolean;
  onAnswered?: (r: PrayerRequest) => void;
  onReopen?: (r: PrayerRequest) => void;
  onArchive?: (r: PrayerRequest) => void;
  onDelete?: (r: PrayerRequest) => void;
}) => (
  <Card className={`p-4 ${answered ? "opacity-90" : ""}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-serif font-semibold text-lg leading-snug">{r.title}</h3>
        {r.category && <span className="inline-block text-[10px] uppercase tracking-wider text-accent mt-0.5">{r.category}</span>}
        {r.body && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{r.body}</p>}
        {answered && r.answered_note && (
          <p className="text-sm mt-2 border-l-2 border-accent pl-3 italic">"{r.answered_note}"</p>
        )}
        <p className="text-[11px] text-muted-foreground/70 mt-2">
          {answered && r.answered_at ? `Answered ${new Date(r.answered_at).toLocaleDateString()}` : `Added ${new Date(r.created_at).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        {!answered ? (
          <Button size="sm" variant="ghost" onClick={() => onAnswered?.(r)} className="gap-1.5" aria-label="Mark answered">
            <Check className="w-4 h-4 text-accent" /> <span className="hidden sm:inline">Answered</span>
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => onReopen?.(r)} className="gap-1.5" aria-label="Reopen">
            <Undo2 className="w-4 h-4" /> <span className="hidden sm:inline">Reopen</span>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onArchive?.(r)} aria-label="Archive"><ArchiveIcon className="w-4 h-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete?.(r)} aria-label="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </div>
    </div>
  </Card>
);

export default Prayers;
