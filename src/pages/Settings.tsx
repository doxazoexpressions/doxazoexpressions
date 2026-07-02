import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Wifi, WifiOff, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  getCachedCurrentDevotional,
  getCachedRecentDevotionals,
} from "@/lib/offlineCache";
import { useEffect, useState } from "react";

const Settings = () => {
  const online = useOnlineStatus();
  const [cachedInfo, setCachedInfo] = useState({ hasToday: false, recentCount: 0 });

  useEffect(() => {
    const refresh = () => {
      setCachedInfo({
        hasToday: !!getCachedCurrentDevotional(),
        recentCount: getCachedRecentDevotionals().length,
      });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [online]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings" description="Manage notifications, offline reading, and favorites on Doxazo Expressions." path="/settings" />
      <Navbar />
      <main className="pt-16">
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3">Settings</h1>
            <p className="text-muted-foreground">Make Doxazo Expressions feel at home on your device.</p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 max-w-3xl space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Bell className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Daily notifications</h2>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Receive a gentle nudge when a new devotional is published. We never send anything else.
                </p>
                <PushNotificationToggle />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {online ? (
                    <Wifi className="w-5 h-5 text-accent" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-destructive" />
                  )}
                  <h2 className="text-xl font-serif font-semibold">Offline reading</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  Today's devotional and your most recent reads are saved on this device so you
                  can keep reading even with no connection.
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    Connection:{" "}
                    <span className={online ? "text-accent font-medium" : "text-destructive font-medium"}>
                      {online ? "Online" : "Offline — showing cached content"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Saved on this device: {cachedInfo.hasToday ? "today's devotional" : "no devotional yet"}
                    {cachedInfo.recentCount > 0
                      ? ` + ${cachedInfo.recentCount} recent ${cachedInfo.recentCount === 1 ? "entry" : "entries"}`
                      : ""}
                    .
                  </p>
                  {!cachedInfo.hasToday && online && (
                    <p className="text-muted-foreground">
                      Open{" "}
                      <Link to="/devotional" className="text-accent underline">
                        today's devotional
                      </Link>{" "}
                      once while online to save it for offline reading.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>



            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-serif font-semibold">Favorites</h2>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Saved devotionals live on this device and sync to your account when you sign in.
                </p>
                <Link to="/favorites" className="text-accent underline text-sm">
                  Open your favorites →
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-serif font-semibold mb-2">Delete your account</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  Permanently remove your account and all associated data. This cannot be undone.
                </p>
                <Link to="/delete-account" className="text-destructive underline text-sm">
                  Delete my account →
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
