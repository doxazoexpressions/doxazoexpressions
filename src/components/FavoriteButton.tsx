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
      title: nowFav ? "Saved to favorites" : "Removed from favorites",
      description: nowFav ? "Find it any time on the Favorites page." : undefined,
    });
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn(
        "gap-2 transition-transform duration-150 active:scale-90",
        fav && "border-accent text-accent",
      )}
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-200",
          fav && "fill-current scale-110",
        )}
      />
      {showLabel && (fav ? "Saved" : "Save")}

    </Button>
  );
};

export default FavoriteButton;
