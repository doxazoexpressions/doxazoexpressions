import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { canonicalUrl } from "@/lib/canonicalUrl";
import { isNative, shareNative } from "@/lib/native";

type Props = {
  title: string;
  text?: string;
  /** Explicit path to share (defaults to the current route). */
  path?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
};

const ShareButton = ({ title, text, path, variant = "outline", size = "default" }: Props) => {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    // NEVER window.location.href: inside the app shell that is
    // capacitor://localhost/... which is a dead link for the recipient.
    const url = canonicalUrl(path);
    track("devotional_share", { title, url });

    if (isNative()) {
      try {
        await shareNative({ title, text, url });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it with someone today." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not share", variant: "destructive" });
    }
  };


  return (
    <Button onClick={onShare} variant={variant} size={size} className="gap-2" aria-label="Share devotional">
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
};

export default ShareButton;
