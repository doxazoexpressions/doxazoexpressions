import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Variant = "devotional" | "home" | "native" | "archive";

const COPY: Record<Variant, string> = {
  devotional:
    "Save your reflections and build streaks — create a free account.",
  archive: "Save your favourites, reflections and reading progress — create a free account.",
  home: "Join the community — save your daily reflections and build your streak.",
  native: "Join the community — save your daily reflections and build your streak.",
};

/** Signed-out only. Renders nothing for signed-in users or while auth loads. */
const SignupPrompt = ({ variant }: { variant: Variant }) => {
  const { user, loading } = useAuth();
  if (loading || user) return null;

  if (variant === "home") {
    return (
      <div className="mt-[var(--app-header-h)] border-b border-accent/30 bg-card text-foreground">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <p className="text-sm">{COPY.home}</p>
          <Link
            to="/auth?mode=signup"
            className="text-sm font-semibold text-accent underline underline-offset-4 interactive"
          >
            Create free account
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "native") {
    return (
      <div className="px-4 pt-4">
        <Link
          to="/auth?mode=signup"
          className="rounded-xl border border-accent/40 bg-card p-4 flex items-center gap-3 active:scale-[0.98] transition"
        >
          <span className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
          </span>
          <span className="text-sm text-foreground">
            {COPY.native}{" "}
            <span className="font-semibold text-accent">Create free account</span>
          </span>
        </Link>
      </div>
    );
  }

  return (
    <aside className="mt-16 rounded-2xl border border-accent/40 bg-card p-6 sm:p-8 text-center">
      <Sparkles className="w-6 h-6 text-accent mx-auto mb-3" aria-hidden="true" />
      <p className="font-serif text-lg sm:text-xl text-foreground mb-5 max-w-xl mx-auto">
        {COPY[variant]}
      </p>
      <Button asChild className="min-h-11 px-6">
        <Link to="/auth?mode=signup">Create free account</Link>
      </Button>
    </aside>
  );
};

export default SignupPrompt;
