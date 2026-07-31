import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Bell, BookOpen, ArrowLeft } from "lucide-react";

/** Small stub screens linked from Settings so no row is a dead tap. */
const SettingsStub = () => {
  const { pathname } = useLocation();
  const isVersions = pathname.includes("bible-versions");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={isVersions ? "Bible versions" : "Notifications"}
        description="Doxazo Expressions settings."
        path={pathname}
      />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6 hover:text-accent">
            <ArrowLeft className="w-4 h-4" /> Settings
          </Link>
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              {isVersions ? (
                <BookOpen className="w-8 h-8 text-accent mx-auto" />
              ) : (
                <Bell className="w-8 h-8 text-accent mx-auto" />
              )}
              <h1 className="text-2xl font-serif font-bold">
                {isVersions ? "Bible versions" : "Notifications"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isVersions
                  ? "Doxazo currently reads Scripture from public-domain translations (KJV and Webster). Additional licensed translations come soon."
                  : "Daily devotional alerts are available today from the Notifications card in Settings. Reading reminders, prayer nudges and streak alerts come soon."}
              </p>
              <Button asChild variant="outline">
                <Link to="/settings">Back to Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsStub;
