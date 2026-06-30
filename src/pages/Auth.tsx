import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Cross, MailCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

type Mode = "signin" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signupSentTo, setSignupSentTo] = useState<string | null>(null);
  const [forgotSentTo, setForgotSentTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setExistingEmail(session.user.email ?? "signed in");
    });
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setExistingEmail(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const eParse = emailSchema.safeParse(email);
    const pParse = passwordSchema.safeParse(password);
    if (!eParse.success) return toast({ title: "Check your email", description: eParse.error.issues[0].message, variant: "destructive" });
    if (!pParse.success) return toast({ title: "Check your password", description: pParse.error.issues[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: eParse.data,
      password: pParse.data,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);

    if (error) {
      const msg = /already registered|already exists|user already/i.test(error.message)
        ? "An account with this email already exists. Try signing in or resetting your password."
        : error.message;
      return toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    }
    setSignupSentTo(eParse.data);
    setResendCooldown(30);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const eParse = emailSchema.safeParse(email);
    const pParse = passwordSchema.safeParse(password);
    if (!eParse.success) return toast({ title: "Check your email", description: eParse.error.issues[0].message, variant: "destructive" });
    if (!pParse.success) return toast({ title: "Check your password", description: pParse.error.issues[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: eParse.data, password: pParse.data });
    setBusy(false);

    if (error) {
      let description = error.message;
      if (/email not confirmed/i.test(error.message)) description = "Please confirm your email first. Check your inbox (and spam folder) for the link.";
      else if (/invalid login credentials/i.test(error.message)) description = "Email or password is incorrect.";
      return toast({ title: "Sign in failed", description, variant: "destructive" });
    }
    toast({ title: "Welcome back!" });
    navigate("/");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const eParse = emailSchema.safeParse(email);
    if (!eParse.success) return toast({ title: "Check your email", description: eParse.error.issues[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(eParse.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);

    if (error) return toast({ title: "Could not send reset email", description: error.message, variant: "destructive" });
    setForgotSentTo(eParse.data);
    setResendCooldown(30);
  };

  const resendConfirmation = async () => {
    if (!signupSentTo || resendCooldown > 0) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: signupSentTo,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) return toast({ title: "Resend failed", description: error.message, variant: "destructive" });
    toast({ title: "Confirmation email sent again", description: `Sent to ${signupSentTo}` });
    setResendCooldown(30);
  };

  const resendReset = async () => {
    if (!forgotSentTo || resendCooldown > 0) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotSentTo, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast({ title: "Resend failed", description: error.message, variant: "destructive" });
    toast({ title: "Reset email sent again", description: `Sent to ${forgotSentTo}` });
    setResendCooldown(30);
  };

  const changeEmail = () => {
    setSignupSentTo(null);
    setForgotSentTo(null);
    setPassword("");
    setResendCooldown(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Helmet>
        <title>Sign In | Doxazo Expressions</title>
        <meta name="description" content="Sign in or create a Doxazo Expressions account to save favorites and receive daily devotionals." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
            ) : signupSentTo ? (
              <div className="text-center space-y-5">
                <div className="mx-auto w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
                  <MailCheck className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold mb-2">Check your email</h1>
                  <p className="text-sm text-muted-foreground">
                    We sent a confirmation link to <span className="font-medium text-foreground">{signupSentTo}</span>.
                    Click it to activate your account.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3 text-left">
                  Don't see it? Check your spam or promotions folder. Delivery can take up to a minute.
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={resendConfirmation} disabled={busy || resendCooldown > 0} className="w-full">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
                  </Button>
                  <Button onClick={changeEmail} variant="outline" className="w-full">
                    Use a different email
                  </Button>
                  <Button onClick={() => { setSignupSentTo(null); setMode("signin"); }} variant="ghost" className="w-full">
                    I've confirmed — Sign in
                  </Button>
                </div>
              </div>
            ) : forgotSentTo ? (
              <div className="text-center space-y-5">
                <div className="mx-auto w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center">
                  <MailCheck className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold mb-2">Reset link sent</h1>
                  <p className="text-sm text-muted-foreground">
                    If an account exists for <span className="font-medium text-foreground">{forgotSentTo}</span>,
                    you'll receive an email with a link to reset your password.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={resendReset} disabled={busy || resendCooldown > 0} className="w-full">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend reset email"}
                  </Button>
                  <Button onClick={() => { setForgotSentTo(null); setMode("signin"); }} variant="ghost" className="w-full">
                    Back to sign in
                  </Button>
                </div>
              </div>
            ) : mode === "forgot" ? (
              <>
                <button onClick={() => setMode("signin")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-accent rounded-md px-1 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-2xl font-serif font-bold mb-1">Reset your password</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your email and we'll send you a link to set a new password.
                </p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-serif font-bold mb-1">
                  {mode === "signin" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {mode === "signin" ? "Sign in to access your devotional journey." : "Join the community of daily seekers."}
                </p>
                <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-accent hover:underline rounded px-1 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === "signup" && (
                      <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
                    )}
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
