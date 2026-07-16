import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, LogIn, Copy, Share2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Group = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
};

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("groups" as any)
      .select("*, group_members!inner(user_id)")
      .eq("group_members.user_id", user.id)
      .order("created_at", { ascending: false });
    setGroups(((data as any) ?? []) as Group[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const createGroup = async () => {
    if (!user || !newName.trim()) return;
    setBusy(true);
    const code = randomCode();
    const { data, error } = await supabase
      .from("groups" as any)
      .insert({
        name: newName.trim(),
        description: newDesc.trim() || null,
        invite_code: code,
        created_by: user.id,
      })
      .select()
      .single();
    if (error || !data) { toast.error(error?.message || "Could not create group"); setBusy(false); return; }
    await supabase.from("group_members" as any).insert({ group_id: (data as any).id, user_id: user.id });
    setNewName(""); setNewDesc("");
    toast.success("Group created");
    setBusy(false);
    load();
  };

  const joinGroup = async () => {
    if (!user || !joinCode.trim()) return;
    setBusy(true);
    const code = joinCode.trim().toUpperCase();
    const { data, error } = await (supabase as any).rpc("join_group_by_code", { _code: code });
    if (error) {
      toast.error(error.message);
    } else if (!data) {
      toast.error("Invite code not found");
    } else {
      toast.success("Joined group");
    }
    setJoinCode("");
    setBusy(false);
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success(`Code ${code} copied`));
  };

  const shareCode = (g: Group) => {
    const text = `Join my devotional group "${g.name}" on Doxazo Expressions with code: ${g.invite_code}`;
    if (navigator.share) navigator.share({ title: g.name, text }).catch(() => {});
    else copyCode(g.invite_code);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Groups" description="Grow with a small group of believers." path="/groups" />
        <Navbar />
        <main className="pt-24 container mx-auto px-4 max-w-md text-center">
          <Users className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Sign in to use Groups</h1>
          <p className="text-muted-foreground mb-6">Create or join a private group to encourage one another.</p>
          <Button asChild><Link to="/auth">Sign in</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Groups" description="Create or join a small group for shared devotional accountability." path="/groups" />
      <Navbar />
      <main className="pt-20 pb-16">
        <section className="container mx-auto px-4 max-w-3xl">
          <header className="mb-8 text-center">
            <Users className="w-10 h-10 text-accent mx-auto mb-3" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Small Groups</h1>
            <p className="text-muted-foreground">Walk together. Share the same devotional. Encourage one another.</p>
          </header>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="w-4 h-4 text-accent" />
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold">Create a group</p>
                </div>
                <div className="space-y-2">
                  <Input placeholder="Group name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <Input placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <Button onClick={createGroup} disabled={busy || !newName.trim()} className="w-full">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <LogIn className="w-4 h-4 text-accent" />
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold">Join with a code</p>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="INVITE CODE"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="uppercase tracking-widest"
                  />
                  <Button onClick={joinGroup} disabled={busy || !joinCode.trim()} variant="outline" className="w-full">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="font-serif text-xl font-bold mb-3">Your groups</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : groups.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">
              You haven't joined any groups yet.
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <Card key={g.id}>
                  <CardContent className="p-5 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-serif font-semibold text-lg">{g.name}</p>
                      {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Code: <span className="font-mono font-semibold text-accent">{g.invite_code}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyCode(g.invite_code)} className="gap-1.5">
                        <Copy className="w-4 h-4" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => shareCode(g)} className="gap-1.5">
                        <Share2 className="w-4 h-4" /> Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Groups;
