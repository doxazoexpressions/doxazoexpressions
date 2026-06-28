import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Cross } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const [existingEmail, setExistingEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setExistingEmail(session.user.email ?? "signed in");
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setExistingEmail(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Check your input", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      else toast({ title: "Welcome!", description: "Check your email to confirm your account." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      else navigate("/");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Cross className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-serif font-bold text-foreground">
            Doxazo<span className="text-accent"> Expressions</span>
          </span>
        </Link>
        <Card>
          <CardContent className="p-6">
            {existingEmail ? (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold">You're already signed in</h1>
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{existingEmail}</span>
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => navigate("/")} className="w-full">Go to Home</Button>
                  <Button onClick={() => navigate("/settings")} variant="outline" className="w-full">Account Settings</Button>
                  <Button onClick={handleSignOut} variant="ghost" className="w-full">Sign Out</Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-serif font-bold mb-1">{mode === "signin" ? "Welcome Back" : "Create Account"}</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {mode === "signin" ? "Sign in to access your devotional journey." : "Join the community of daily seekers."}
                </p>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signin" ? "current-password" : "new-password"} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
                  </Button>
                </form>
                <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-sm text-muted-foreground mt-4 hover:text-accent">
                  {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
