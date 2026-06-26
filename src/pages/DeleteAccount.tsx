import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const CONFIRM_PHRASE = "DELETE";

const DeleteAccount = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const canDelete = confirm.trim().toUpperCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      toast.success("Your account and data have been deleted.");
      navigate("/");
    } catch (e) {
      toast.error((e as Error).message || "Could not delete account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Delete your account"
        description="Permanently delete your Doxazo Expressions account and associated data."
        path="/delete-account"
      />
      <Navbar />
      <main className="pt-16">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3">Delete your account</h1>
            <p className="text-muted-foreground">
              We're sorry to see you go. This action is permanent.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive mb-1">This cannot be undone.</p>
                    <p className="text-muted-foreground">
                      Deleting your account permanently removes your profile, favorites,
                      saved devices, notification subscriptions, and sign-in credentials.
                      Devotional content you've read remains publicly available, but it
                      will no longer be associated with you.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <p className="text-muted-foreground text-sm">Checking your session…</p>
                ) : !user ? (
                  <div className="text-sm">
                    <p className="mb-3">You need to be signed in to delete your account.</p>
                    <Button asChild>
                      <Link to="/auth">Sign in</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">
                      Signed in as <span className="text-foreground font-medium">{user.email}</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm">
                        Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> to confirm
                      </Label>
                      <Input
                        id="confirm"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder={CONFIRM_PHRASE}
                        autoComplete="off"
                      />
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={!canDelete || busy} className="w-full sm:w-auto">
                          {busy ? "Deleting…" : "Permanently delete my account"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately and permanently delete your account
                            and all associated data. You will not be able to recover it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <p className="text-xs text-muted-foreground">
                      Prefer to stay? You can{" "}
                      <Link to="/settings" className="underline">manage notifications</Link> or{" "}
                      <Link to="/" className="underline">return home</Link> instead.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DeleteAccount;
