import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

type Props = {
  title: string;
  text?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
};

const ShareButton = ({ title, text, variant = "outline", size = "default" }: Props) => {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    track("devotional_share", { title });
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
