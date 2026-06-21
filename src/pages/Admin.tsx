import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/categories";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 container mx-auto px-4 max-w-xl text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            Your account ({user.email}) is signed in but not yet an admin. To grant admin access, run this in your backend SQL editor:
          </p>
          <pre className="bg-muted p-4 rounded-lg text-left text-xs overflow-x-auto mb-6">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
          </pre>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome, {user.email}</p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>

          <Tabs defaultValue="devotional" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="devotional">Devotionals</TabsTrigger>
              <TabsTrigger value="prayer">Prayers</TabsTrigger>
              <TabsTrigger value="teaching">Teachings</TabsTrigger>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
            </TabsList>

            <TabsContent value="devotional"><DevotionalAdmin userId={user.id} /></TabsContent>
            <TabsContent value="prayer"><PrayerAdmin userId={user.id} /></TabsContent>
            <TabsContent value="teaching"><TeachingAdmin userId={user.id} /></TabsContent>
            <TabsContent value="inbox"><Inbox /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function DevotionalAdmin({ userId }: { userId: string }) {
  const emptyForm = {
    title: "",
    scripture_reference: "",
    scripture_text: "",
    body: "",
    excerpt: "",
    declaration: "",
    category: "",
    series: "",
    audio_url: "",
    seo_title: "",
    seo_description: "",
    publish_date: new Date().toISOString().slice(0, 10),
    scheduled_for: "",
  };
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const load = () =>
    supabase.from("devotionals").select("*").order("publish_date", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast({ title: "Title and body are required", variant: "destructive" }); return; }
    const payload: any = {
      title: form.title,
      scripture_reference: form.scripture_reference || null,
      scripture_text: form.scripture_text || null,
      body: form.body,
      excerpt: form.excerpt || null,
      declaration: form.declaration || null,
      category: form.category || null,
      series: form.series || null,
      audio_url: form.audio_url || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      publish_date: form.publish_date,
      scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
      author_id: userId,
    };
    const { error } = await supabase.from("devotionals").insert(payload);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Devotional posted" }); setForm(emptyForm); load(); }
  };
  const remove = async (id: string) => {
    await supabase.from("devotionals").delete().eq("id", id);
    toast({ title: "Deleted" }); load();
  };
  const isScheduled = (d: any) => d.scheduled_for && new Date(d.scheduled_for) > new Date();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4 flex items-center gap-2"><Plus className="w-5 h-5" />New Devotional</h2>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Series (optional)</Label><Input value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} placeholder="e.g. Walking in Authority" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Publish Date</Label><Input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></div>
            <div><Label>Schedule (optional)</Label><Input type="datetime-local" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} /></div>
          </div>
          <div><Label>Scripture Reference</Label><Input value={form.scripture_reference} onChange={(e) => setForm({ ...form, scripture_reference: e.target.value })} placeholder="e.g. Psalm 23:1" /></div>
          <div><Label>Scripture Text</Label><Textarea value={form.scripture_text} onChange={(e) => setForm({ ...form, scripture_text: e.target.value })} rows={2} /></div>
          <div><Label>Excerpt (preview text)</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Auto-generated from body if blank" /></div>
          <div><Label>Devotional Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} required /></div>
          <div><Label>Faith Declaration</Label><Textarea value={form.declaration} onChange={(e) => setForm({ ...form, declaration: e.target.value })} rows={2} /></div>
          <div><Label>Audio URL (optional)</Label><Input value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} placeholder="https://…mp3" /></div>
          <div className="grid grid-cols-1 gap-3">
            <div><Label>SEO Title (optional)</Label><Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
            <div><Label>SEO Description (optional)</Label><Textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={2} /></div>
          </div>
          <Button type="submit" className="w-full">Publish</Button>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4">Recent ({list.length})</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {list.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.publish_date} {d.category && <>· {categoryLabel(d.category)}</>}
                </p>
                {isScheduled(d) && (
                  <Badge variant="outline" className="mt-1 text-[10px]">Scheduled · {new Date(d.scheduled_for).toLocaleString()}</Badge>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}

function PrayerAdmin({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", body: "", category: "Morning Prayer", scripture_reference: "", publish_date: new Date().toISOString().slice(0, 10) });
  const load = () => supabase.from("prayers").select("*").order("publish_date", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast({ title: "Title and body required", variant: "destructive" }); return; }
    const { error } = await supabase.from("prayers").insert({ ...form, author_id: userId });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Prayer posted" }); setForm({ title: "", body: "", category: "Morning Prayer", scripture_reference: "", publish_date: new Date().toISOString().slice(0, 10) }); load(); }
  };
  const remove = async (id: string) => { await supabase.from("prayers").delete().eq("id", id); load(); };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4 flex items-center gap-2"><Plus className="w-5 h-5" />New Prayer</h2>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Morning Prayer, Declaration, etc." /></div>
          <div><Label>Publish Date</Label><Input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></div>
          <div><Label>Scripture Reference</Label><Input value={form.scripture_reference} onChange={(e) => setForm({ ...form, scripture_reference: e.target.value })} /></div>
          <div><Label>Prayer Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} required /></div>
          <Button type="submit" className="w-full">Publish</Button>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4">Recent ({list.length})</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {list.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-lg">
              <div className="min-w-0"><p className="font-medium truncate">{p.title}</p><p className="text-xs text-muted-foreground">{p.publish_date} · {p.category}</p></div>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}

function TeachingAdmin({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", scripture_reference: "", excerpt: "", body: "", category: "Teaching", image_url: "", publish_date: new Date().toISOString().slice(0, 10) });
  const load = () => supabase.from("teachings").select("*").order("publish_date", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast({ title: "Title and body required", variant: "destructive" }); return; }
    const { error } = await supabase.from("teachings").insert({ ...form, author_id: userId });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Teaching posted" }); setForm({ title: "", scripture_reference: "", excerpt: "", body: "", category: "Teaching", image_url: "", publish_date: new Date().toISOString().slice(0, 10) }); load(); }
  };
  const remove = async (id: string) => { await supabase.from("teachings").delete().eq("id", id); load(); };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4 flex items-center gap-2"><Plus className="w-5 h-5" />New Teaching</h2>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Scripture Reference</Label><Input value={form.scripture_reference} onChange={(e) => setForm({ ...form, scripture_reference: e.target.value })} /></div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Optional" /></div>
          <div><Label>Publish Date</Label><Input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></div>
          <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
          <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} required /></div>
          <Button type="submit" className="w-full">Publish</Button>
        </form>
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4">Recent ({list.length})</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {list.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-lg">
              <div className="min-w-0"><p className="font-medium truncate">{t.title}</p><p className="text-xs text-muted-foreground">{t.publish_date}</p></div>
              <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}

function Inbox() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const load = async () => {
    const [c, r, t] = await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("speaking_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("testimonies").select("*").order("created_at", { ascending: false }),
    ]);
    setContacts(c.data ?? []); setRequests(r.data ?? []); setTests(t.data ?? []);
  };
  useEffect(() => { load(); }, []);
  const approve = async (id: string, approved: boolean) => {
    await supabase.from("testimonies").update({ approved: !approved }).eq("id", id); load();
  };
  return (
    <div className="space-y-6">
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4">Contact Messages ({contacts.length})</h2>
        <div className="space-y-3">{contacts.map((c) => (
          <div key={c.id} className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <p className="font-medium">{c.name} <span className="text-muted-foreground text-sm">· {c.email}</span></p>
              <Badge variant="outline" className="text-[10px] uppercase">{(c.type ?? "general").replace("_", " ")}</Badge>
            </div>
            {c.subject && <p className="text-sm text-accent mt-1">{c.subject}</p>}
            <p className="text-sm mt-2 whitespace-pre-wrap">{c.message}</p>
          </div>
        ))}{contacts.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}</div>
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4">Speaking Requests ({requests.length})</h2>
        <div className="space-y-3">{requests.map((r) => (
          <div key={r.id} className="p-4 border border-border rounded-lg">
            <p className="font-medium">{r.name} · {r.organization}</p>
            <p className="text-sm text-muted-foreground">{r.email} · {r.event_type} · {r.event_date}</p>
            <p className="text-sm mt-2 whitespace-pre-wrap">{r.message}</p>
          </div>
        ))}{requests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}</div>
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h2 className="font-serif font-semibold text-xl mb-4">Testimonies ({tests.length})</h2>
        <div className="space-y-3">{tests.map((t) => (
          <div key={t.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-3">
            <div><p className="font-medium">{t.name} {t.location && <span className="text-muted-foreground text-sm">· {t.location}</span>}</p><p className="text-sm mt-2">{t.message}</p></div>
            <Button size="sm" variant={t.approved ? "default" : "outline"} onClick={() => approve(t.id, t.approved)}>{t.approved ? "Approved" : "Approve"}</Button>
          </div>
        ))}{tests.length === 0 && <p className="text-sm text-muted-foreground">No testimonies yet.</p>}</div>
      </CardContent></Card>
    </div>
  );
}

export default Admin;
