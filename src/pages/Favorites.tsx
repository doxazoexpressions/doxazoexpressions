import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import DevotionalCard, { DevotionalCardData } from "@/components/DevotionalCard";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Favorites = () => {
  const { ids, loading: favLoading } = useFavorites();
  const { user } = useAuth();
  const [items, setItems] = useState<DevotionalCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("devotionals")
        .select("id,title,scripture_reference,excerpt,body,category,series,publish_date")
        .in("id", ids)
        .eq("published", true)
        .order("publish_date", { ascending: false });
      setItems((data ?? []) as DevotionalCardData[]);
      setLoading(false);
    })();
  }, [ids]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Your Favorites" description="Devotionals you've saved on Doxazo Expressions." path="/favorites" />
      <Navbar />
      <main className="pt-16">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3">Your Favorites</h1>
            <p className="text-muted-foreground">
              The devotionals you've saved live here — on this device and {user ? "synced to your account" : "ready to sync once you sign in"}.
            </p>
            {!user && (
              <p className="text-sm mt-3">
                <Link to="/auth" className="text-accent underline">Sign in</Link> to keep favorites across devices.
              </p>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {loading || favLoading ? (
              <p className="text-center text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <Heart className="w-10 h-10 text-accent/40 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-semibold mb-2">No favorites yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Tap the heart on any devotional to save it for later.
                  </p>
                  <Button asChild>
                    <Link to="/devotional">Read today's devotional</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {items.map((d) => (
                  <DevotionalCard key={d.id} d={d} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
