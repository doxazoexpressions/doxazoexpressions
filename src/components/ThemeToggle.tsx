import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="tap-target rounded-lg" aria-hidden="true" tabIndex={-1}>
        <Sun className="h-5 w-5" strokeWidth={1.75} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="tap-target rounded-lg hover:bg-secondary interactive"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
      )}
    </Button>
  );
};


export default ThemeToggle;
