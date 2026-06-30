import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Cross, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { z } from "zod";

type Status = "checking" | "ready" | "invalid" | "done";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

const ResetPassword = () => {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase places the recovery tokens in URL hash (e.g. #access_token=...&type=recovery)
    // The client library auto-exchanges them and emits PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setStatus("ready");
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash || "";
      const isRecovery = hash.includes("type=recovery") || hash.includes("access_token");
      if (session && isRecovery) setStatus("ready");
      else if (session) setStatus("ready");
      else {
        // wait briefly for hash exchange; if still no session, mark invalid
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session) setStatus("ready");
          else {
            const err = new URLSearchParams(hash.replace(/^#/, "")).get("error_description");
            setErrorMsg(err || "This reset link is invalid or has expired. Please request a new one.");
            setStatus("invalid");
          }
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast({ title: "Check your password", description: parsed.error.issues[0].message, variant: "destructive" });
    if (password !== confirm) return toast({ title: "Passwords don't match", variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);

    if (error) return toast({ title: "Could not update password", description: error.message, variant: "destructive" });
    setStatus("done");
    toast({ title: "Password updated", description: "You can now sign in with your new password." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
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
            {status === "checking" && (
              <div className="text-center py-6 text-sm text-muted-foreground">Verifying reset link…</div>
            )}

            {status === "invalid" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-destructive/15 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>
                <h1 className="text-2xl font-serif font-bold">Link invalid or expired</h1>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
                <Button onClick={() => navigate("/auth")} className="w-full">Request a new link</Button>
              </div>
            )}

            {status === "ready" && (
              <>
                <h1 className="text-2xl font-serif font-bold mb-1">Set a new password</h1>
                <p className="text-sm text-muted-foreground mb-6">Choose a password you haven't used before.</p>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
                  </div>
                  <div>
                    <Label htmlFor="confirm">Confirm new password</Label>
                    <Input id="confirm" type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Updating..." : "Update password"}
                  </Button>
                </form>
              </>
            )}

            {status === "done" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-accent" />
                </div>
                <h1 className="text-2xl font-serif font-bold">Password updated</h1>
                <p className="text-sm text-muted-foreground">You're all set. Sign in with your new password.</p>
                <Button onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }} className="w-full">
                  Continue to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
