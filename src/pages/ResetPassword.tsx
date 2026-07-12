import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { z } from "zod";

type Status = "checking" | "ready" | "invalid" | "done";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const CHECK_TIMEOUT_MS = 8000;

const ResetPassword = () => {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    let resolved = false;
    const markInvalid = (msg: string) => {
      if (resolved) return;
      resolved = true;
      setErrorMsg(msg);
      setStatus("invalid");
    };
    const markReady = () => {
      if (resolved) return;
      resolved = true;
      setStatus("ready");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) markReady();
    });

    // Surface an explicit error from the hash (e.g. expired link) immediately.
    const hash = window.location.hash || "";
    const hashErr = new URLSearchParams(hash.replace(/^#/, "")).get("error_description");
    if (hashErr) {
      markInvalid(decodeURIComponent(hashErr.replace(/\+/g, " ")));
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const isRecovery = hash.includes("type=recovery") || hash.includes("access_token");
        if (session && (isRecovery || true)) markReady();
      });
    }

    // Hard timeout — never leave the user stuck on "Verifying…".
    const timeout = window.setTimeout(() => {
      markInvalid("This reset link couldn't be verified. It may be expired, already used, or opened in a different browser than the one you requested it from.");
    }, CHECK_TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
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
      <Helmet>
        <title>Reset Password | Doxazo Expressions</title>
        <meta name="description" content="Set a new password for your Doxazo Expressions account." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <BrandMark size={40} />
          <span className="text-2xl font-serif font-bold text-foreground">
            Doxazo<span className="text-accent"> Expressions</span>
          </span>
        </Link>

        <Card>
          <CardContent className="p-6">
            {status === "checking" && (
              <div className="text-center py-8 space-y-4" role="status" aria-live="polite">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" aria-hidden="true" />
                <div>
                  <h1 className="text-lg font-serif font-semibold">Verifying reset link…</h1>
                  <p className="text-sm text-muted-foreground mt-1">This usually takes a couple of seconds.</p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => navigate("/auth")} variant="outline" size="sm" className="w-full">
                    Taking too long? Request a new link
                  </Button>
                  <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="w-full">
                    Back to home
                  </Button>
                </div>
              </div>
            )}

            {status === "invalid" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-destructive/15 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-destructive" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-serif font-bold">Link invalid or expired</h1>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => navigate("/auth")} className="w-full">Request a new link</Button>
                  <Button onClick={() => navigate("/")} variant="ghost" className="w-full">Back to home</Button>
                </div>
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
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
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
                  <CheckCircle2 className="w-7 h-7 text-accent" aria-hidden="true" />
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
