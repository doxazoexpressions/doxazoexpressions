import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type Props = {
  devotionalId: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  showLabel?: boolean;
};

const FavoriteButton = ({
  devotionalId,
  variant = "outline",
  size = "default",
  showLabel = true,
}: Props) => {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(devotionalId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFav = await toggle(devotionalId);
    if (nowFav) track("devotional_saved", { id: devotionalId });
    toast({
      title: nowFav ? "Saved to favourites" : "Removed from favourites",
      description: nowFav ? "Find it any time on the Favourites page." : undefined,
    });
  };

  const iconOnly = size === "icon";

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn(
        "gap-2 interactive",
        iconOnly && "tap-target rounded-full",
        fav && "text-accent",
        fav && variant === "outline" && "border-accent",
      )}
      aria-pressed={fav}
      aria-label={fav ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart
        className={cn(
          "w-[18px] h-[18px] transition-[fill,color,opacity] duration-200 ease-out",
          fav ? "fill-current" : "fill-transparent",
        )}
        aria-hidden="true"
      />
      {showLabel && (fav ? "Saved" : "Save")}
    </Button>
  );
};

export default FavoriteButton;
